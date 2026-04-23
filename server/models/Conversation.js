const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  seen: { type: Boolean, default: false },
  seenAt: { type: Date },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [messageSchema],
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  itemRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  borrowRef: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowItem', default: null },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
}, { timestamps: true });

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
