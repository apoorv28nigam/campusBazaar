const express = require('express');
const router = express.Router();
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️ Stripe Secret Key missing. Payments will not function.');
}

const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const BorrowItem = require('../models/BorrowItem');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @desc  Create Stripe checkout session
// @route POST /api/payments/checkout
router.post('/checkout', protect, async (req, res) => {
  try {
    const { itemId, borrowItemId, type, fromDate, toDate } = req.body;
    let lineItems = [];
    let metadata = { userId: req.user._id.toString(), type };
    let amount = 0;
    let sellerId = null;

    if (type === 'buy' && itemId) {
      const item = await Item.findById(itemId).populate('seller');
      if (!item) return res.status(404).json({ message: 'Item not found' });
      if (item.status !== 'available') return res.status(400).json({ message: 'Item not available' });
      amount = item.price * 100;
      sellerId = item.seller._id;
      metadata.itemId = itemId;
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: item.title, images: item.images.slice(0, 1) },
          unit_amount: Math.round(amount),
        },
        quantity: 1,
      });
    }

    if (type === 'borrow' && borrowItemId) {
      const item = await BorrowItem.findById(borrowItemId).populate('owner');
      if (!item) return res.status(404).json({ message: 'Borrow item not found' });
      const days = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24));
      const totalRent = item.rentPerDay * days;
      amount = (totalRent + item.securityDeposit) * 100;
      sellerId = item.owner._id;
      metadata.borrowItemId = borrowItemId;
      metadata.fromDate = fromDate;
      metadata.toDate = toDate;
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: `Rent: ${item.title} (${days} days)` },
          unit_amount: Math.round(totalRent * 100),
        },
        quantity: 1,
      }, {
        price_data: {
          currency: 'inr',
          product_data: { name: 'Security Deposit (Refundable)' },
          unit_amount: Math.round(item.securityDeposit * 100),
        },
        quantity: 1,
      });
    }

    if (lineItems.length === 0) return res.status(400).json({ message: 'Invalid payment request' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata,
    });

    await Transaction.create({
      buyer: req.user._id,
      seller: sellerId,
      item: type === 'buy' ? itemId : undefined,
      borrowItem: type === 'borrow' ? borrowItemId : undefined,
      amount: amount / 100,
      type,
      status: 'pending',
      stripeSessionId: session.id,
      borrowFrom: fromDate ? new Date(fromDate) : undefined,
      borrowTo: toDate ? new Date(toDate) : undefined,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Verify payment success
// @route GET /api/payments/verify/:sessionId
router.get('/verify/:sessionId', protect, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const transaction = await Transaction.findOne({ stripeSessionId: session.id });

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (session.payment_status === 'paid' && transaction.status === 'pending') {
      transaction.status = 'completed';
      transaction.stripePaymentIntentId = session.payment_intent;
      await transaction.save();

      if (transaction.item) {
        await Item.findByIdAndUpdate(transaction.item, { status: 'sold' });
        const item = await Item.findById(transaction.item);
        const io = req.app.get('io');
        await Notification.create({
          user: transaction.seller,
          type: 'item_sold',
          title: 'Your item was sold! 🎉',
          message: `"${item?.title}" has been purchased`,
          link: `/profile`,
        });
        io.to(transaction.seller.toString()).emit('notification', { type: 'item_sold' });
      }
    }

    res.json({ transaction, paymentStatus: session.payment_status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Get transaction history
// @route GET /api/payments/history
router.get('/history', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    })
      .populate('item', 'title images price')
      .populate('borrowItem', 'title images rentPerDay')
      .populate('buyer', 'name avatar')
      .populate('seller', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
