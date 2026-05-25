const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @desc  Get all items (filtered by college for logged-in users)
// @route GET /api/items
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, status, search, sort, minPrice, maxPrice, isFree, page = 1, limit = 12 } = req.query;
    const query = { isActive: true, college: 'GL Bajaj Institute of Technology and Management, Greater Noida' };
    if (category && category !== 'all') query.category = category;
    if (status) query.status = status;
    else query.status = 'available';
    if (isFree === 'true') query.isFree = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { views: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('seller', 'name avatar college isVerified rating')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Create new item
// @route POST /api/items
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, category, condition, tags, location, imageFit } = req.body;
    if (!title || !description || price === undefined || !category) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const images = req.files ? req.files.map(f => f.path) : [];
    const item = await Item.create({
      title, description,
      price: Number(price),
      category, condition,
      images,
      seller: req.user._id,
      college: req.user.college || 'GL Bajaj Institute of Technology and Management, Greater Noida',
      isFree: Number(price) === 0,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      location,
      imageFit: imageFit || 'contain',
    });

    await item.populate('seller', 'name avatar college isVerified rating');
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Get single item
// @route GET /api/items/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('seller', 'name avatar college isVerified rating reviewsCount bio phone createdAt');

    if (!item || item.isActive === false) return res.status(404).json({ message: 'Item not found' });

    // Track recently viewed
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { recentlyViewed: item._id },
      });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Update item
// @route PUT /api/items/:id
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, price, category, condition, status, tags, location, imageFit } = req.body;
    if (title) item.title = title;
    if (description) item.description = description;
    if (price !== undefined) { item.price = Number(price); item.isFree = Number(price) === 0; }
    if (category) item.category = category;
    if (condition) item.condition = condition;
    if (status) item.status = status;
    if (tags) item.tags = tags.split(',').map(t => t.trim());
    if (location !== undefined) item.location = location;
    if (imageFit) item.imageFit = imageFit;
    if (req.files && req.files.length > 0) item.images = req.files.map(f => f.path);

    await item.save();
    await item.populate('seller', 'name avatar college isVerified rating');
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Delete item
// @route DELETE /api/items/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    item.isActive = false;
    await item.save();
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Mark item as sold
// @route POST /api/items/:id/sold
router.post('/:id/sold', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    item.status = 'sold';
    await item.save();
    res.json({ message: 'Item marked as sold', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Mark item as available
// @route POST /api/items/:id/available
router.post('/:id/available', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    item.status = 'available';
    await item.save();
    res.json({ message: 'Item marked as available', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
