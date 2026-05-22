const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  borrowItem: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowItem' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'inr' },
  type: { type: String, enum: ['buy', 'borrow', 'deposit'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  stripeSessionId: { type: String },
  stripePaymentIntentId: { type: String },
  borrowFrom: { type: Date },
  borrowTo: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
