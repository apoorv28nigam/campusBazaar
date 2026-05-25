const express = require('express');
const router = express.Router();
const BorrowItem = require('../models/BorrowItem');
const Notification = require('../models/Notification');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @desc  Get all borrow items
// @route GET /api/borrow
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    const query = { isActive: true, status: 'available', college: 'GL Bajaj Institute of Technology and Management, Greater Noida' };
    if (category && category !== 'all') query.category = category;

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { rentPerDay: 1 };
    if (sort === 'price_desc') sortOption = { rentPerDay: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await BorrowItem.countDocuments(query);
    const items = await BorrowItem.find(query)
      .populate('owner', 'name avatar college isVerified rating')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Create borrow listing
// @route POST /api/borrow
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, rentPerDay, securityDeposit, category, condition, availableFrom, availableTo, imageFit } = req.body;
    if (!title || !description || !rentPerDay || !securityDeposit || !category || !availableFrom || !availableTo) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const images = req.files ? req.files.map(f => f.path) : [];
    const item = await BorrowItem.create({
      title, description,
      rentPerDay: Number(rentPerDay),
      securityDeposit: Number(securityDeposit),
      category, condition,
      availableFrom: new Date(availableFrom),
      availableTo: new Date(availableTo),
      images,
      owner: req.user._id,
      college: req.user.college,
      imageFit: imageFit || 'contain',
    });

    await item.populate('owner', 'name avatar college isVerified rating');
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Get single borrow item
// @route GET /api/borrow/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await BorrowItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('owner', 'name avatar college isVerified rating reviewsCount bio phone createdAt')
     .populate('borrowRequests.borrower', 'name avatar');

    if (!item || item.isActive === false) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Update borrow listing
// @route PUT /api/borrow/:id
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const item = await BorrowItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, rentPerDay, securityDeposit, category, condition, availableFrom, availableTo, imageFit } = req.body;
    if (title) item.title = title;
    if (description) item.description = description;
    if (rentPerDay) item.rentPerDay = Number(rentPerDay);
    if (securityDeposit) item.securityDeposit = Number(securityDeposit);
    if (category) item.category = category;
    if (condition) item.condition = condition;
    if (availableFrom) item.availableFrom = new Date(availableFrom);
    if (availableTo) item.availableTo = new Date(availableTo);
    if (imageFit) item.imageFit = imageFit;
    if (req.files && req.files.length > 0) item.images = req.files.map(f => f.path);

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Delete borrow listing
// @route DELETE /api/borrow/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await BorrowItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    item.isActive = false;
    await item.save();
    res.json({ message: 'Borrow listing deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Request to borrow
// @route POST /api/borrow/:id/request
router.post('/:id/request', protect, async (req, res) => {
  try {
    const { fromDate, toDate, message } = req.body;
    const item = await BorrowItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot borrow your own item' });
    }

    item.borrowRequests.push({ borrower: req.user._id, fromDate, toDate, message });
    await item.save();

    // Notify owner
    const io = req.app.get('io');
    const notification = await Notification.create({
      user: item.owner,
      type: 'borrow_request',
      title: 'New Borrow Request',
      message: `${req.user.name} wants to borrow your item: ${item.title}`,
      link: `/borrow/${item._id}`,
      avatar: req.user.avatar,
    });
    io.to(item.owner.toString()).emit('notification', notification);

    res.json({ message: 'Borrow request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Accept/Reject borrow request
// @route PUT /api/borrow/:id/request/:requestId
router.put('/:id/request/:requestId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const item = await BorrowItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const request = item.borrowRequests.id(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = status;

    if (status === 'accepted') {
      item.status = 'borrowed';
      item.currentBorrower = request.borrower;
    }

    await item.save();

    const io = req.app.get('io');
    const notification = await Notification.create({
      user: request.borrower,
      type: status === 'accepted' ? 'borrow_accepted' : 'borrow_rejected',
      title: status === 'accepted' ? 'Borrow Request Accepted!' : 'Borrow Request Rejected',
      message: `Your request to borrow "${item.title}" was ${status}`,
      link: `/borrow/${item._id}`,
    });
    io.to(request.borrower.toString()).emit('notification', notification);

    res.json({ message: `Request ${status}`, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Mark as returned
// @route PUT /api/borrow/:id/return
router.put('/:id/return', protect, async (req, res) => {
  try {
    const item = await BorrowItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    item.status = 'available';
    item.currentBorrower = null;
    await item.save();
    res.json({ message: 'Item marked as returned', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
