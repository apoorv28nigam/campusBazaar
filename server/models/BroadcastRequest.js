const mongoose = require('mongoose');

const broadcastRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  type: { type: String, enum: ['buy', 'rent', 'both'], default: 'both' },
  budget: { type: String, default: '' },
  category: { type: String, default: 'General', trim: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

broadcastRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('BroadcastRequest', broadcastRequestSchema);
