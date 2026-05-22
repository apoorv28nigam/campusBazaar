const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  borrowItem: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowItem' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  type: { type: String, enum: ['buy', 'borrow'], default: 'buy' },
}, { timestamps: true });

reviewSchema.index({ reviewee: 1 });

module.exports = mongoose.model('Review', reviewSchema);
