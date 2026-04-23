const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const BorrowItem = require('../models/BorrowItem');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @desc  Get user profile
// @route GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const isMongoId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId ? { _id: req.params.id } : { supabaseId: req.params.id };
    
    const user = await User.findOne(query).select('-password -verificationToken -email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const listings = await Item.find({ seller: user._id, isActive: true }).sort({ createdAt: -1 }).limit(10);
    const borrowListings = await BorrowItem.find({ owner: user._id, isActive: true }).sort({ createdAt: -1 }).limit(10);
    const reviews = await Review.find({ reviewee: user._id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ user, listings, borrowListings, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Update profile
// @route PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, college, course, year, bio, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (college) user.college = college;
    if (course !== undefined) user.course = course;
    if (year !== undefined) user.year = year;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;

    await user.save();
    res.json({ message: 'Profile updated', user: { _id: user._id, name: user.name, email: user.email, college: user.college, course: user.course, year: user.year, avatar: user.avatar, bio: user.bio, phone: user.phone, isVerified: user.isVerified } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Upload avatar
// @route POST /api/users/avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: req.file.path }, { new: true }).select('-password');
    res.json({ avatar: user.avatar, user, message: 'Avatar updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Get user's own listings
// @route GET /api/users/my/listings
router.get('/my/listings', protect, async (req, res) => {
  try {
    const items = await Item.find({ seller: req.user._id, isActive: true }).sort({ createdAt: -1 });
    const borrowItems = await BorrowItem.find({ owner: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ items, borrowItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Save/unsave an item
// @route POST /api/users/save/:itemId
router.post('/save/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const itemId = req.params.itemId;
    const idx = user.savedItems.indexOf(itemId);
    if (idx === -1) user.savedItems.push(itemId);
    else user.savedItems.splice(idx, 1);
    await user.save();
    res.json({ saved: idx === -1, savedItems: user.savedItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
