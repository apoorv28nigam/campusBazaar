const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['message', 'item_sold', 'borrow_request', 'borrow_accepted', 'borrow_rejected', 'payment', 'review', 'system', 'broadcast_request', 'broadcast_response'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
  avatar: { type: String, default: '' },
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
