const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @desc  Create review
// @route POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { revieweeId, itemId, borrowItemId, rating, comment, type } = req.body;
    if (!revieweeId || !rating) return res.status(400).json({ message: 'Reviewee and rating required' });
    if (revieweeId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot review yourself' });
    }

    const existing = await Review.findOne({ reviewer: req.user._id, reviewee: revieweeId, item: itemId || undefined, borrowItem: borrowItemId || undefined });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this seller for this item' });

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      item: itemId || undefined,
      borrowItem: borrowItemId || undefined,
      rating: Number(rating),
      comment,
      type: type || 'buy',
    });

    // Update user rating
    const reviewee = await User.findById(revieweeId);
    reviewee.totalRating += Number(rating);
    reviewee.reviewsCount += 1;
    reviewee.rating = (reviewee.totalRating / reviewee.reviewsCount).toFixed(1);
    await reviewee.save();

    await review.populate('reviewer', 'name avatar');

    // Notify
    const io = req.app.get('io');
    const notification = await Notification.create({
      user: revieweeId,
      type: 'review',
      title: 'New Review!',
      message: `${req.user.name} gave you ${rating} stars`,
      link: `/profile`,
      avatar: req.user.avatar,
    });
    io.to(revieweeId).emit('notification', notification);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Get reviews for a user
// @route GET /api/reviews/:userId
router.get('/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .populate('item', 'title')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
