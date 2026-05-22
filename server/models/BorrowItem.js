const mongoose = require('mongoose');

const borrowItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  rentPerDay: { type: Number, required: true, min: 0 },
  securityDeposit: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['books', 'electronics', 'clothing', 'furniture', 'sports', 'stationery', 'tools', 'other'],
  },
  images: [{ type: String }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college: { type: String, required: true },
  availableFrom: { type: Date, required: true },
  availableTo: { type: Date, required: true },
  status: { type: String, enum: ['available', 'borrowed', 'returned', 'pending'], default: 'available' },
  currentBorrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  borrowRequests: [{
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromDate: Date,
    toDate: Date,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    message: String,
    createdAt: { type: Date, default: Date.now },
  }],
  condition: { type: String, enum: ['new', 'like-new', 'good', 'fair'], default: 'good' },
  views: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

borrowItemSchema.index({ college: 1, status: 1, category: 1 });

module.exports = mongoose.model('BorrowItem', borrowItemSchema);
