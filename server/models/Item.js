const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['books', 'electronics', 'clothing', 'furniture', 'sports', 'stationery', 'food', 'other', 'free'],
  },
  condition: { type: String, enum: ['new', 'like-new', 'good', 'fair', 'poor'], default: 'good' },
  images: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college: { type: String, required: true },
  status: { type: String, enum: ['available', 'sold', 'reserved'], default: 'available' },
  isFree: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  tags: [{ type: String }],
  location: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  imageFit: { type: String, enum: ['contain', 'cover'], default: 'contain' },
}, { timestamps: true });

itemSchema.index({ title: 'text', description: 'text', tags: 'text' });
itemSchema.index({ college: 1, status: 1, category: 1 });

module.exports = mongoose.model('Item', itemSchema);
