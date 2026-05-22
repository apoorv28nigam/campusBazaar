const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @desc  Get all conversations for user
// @route GET /api/messages
router.get('/', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar college isVerified')
      .populate('itemRef', 'title images price')
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Get or create conversation
// @route POST /api/messages/conversation
router.post('/conversation', protect, async (req, res) => {
  try {
    const { recipientId, itemId, borrowId } = req.body;
    if (!recipientId) return res.status(400).json({ message: 'Recipient required' });
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
      ...(itemId ? { itemRef: itemId } : {}),
    }).populate('participants', 'name avatar college isVerified');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        itemRef: itemId || null,
        borrowRef: borrowId || null,
      });
      await conversation.populate('participants', 'name avatar college isVerified');
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Get messages in a conversation
// @route GET /api/messages/:conversationId
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate('participants', 'name avatar college isVerified')
      .populate('itemRef', 'title images price status')
      .populate('borrowRef', 'title images rentPerDay status');

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark messages as seen
    conversation.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user._id.toString() && !msg.seen) {
        msg.seen = true;
        msg.seenAt = new Date();
      }
    });
    await conversation.save();

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Send message
// @route POST /api/messages/:conversationId
router.post('/:conversationId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Message content required' });

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = { sender: req.user._id, content: content.trim(), seen: false };
    conversation.messages.push(message);
    conversation.lastMessage = content.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const savedMsg = conversation.messages[conversation.messages.length - 1];

    // Real-time via socket
    const io = req.app.get('io');
    const recipient = conversation.participants.find(p => p.toString() !== req.user._id.toString());

    io.to(req.params.conversationId).emit('newMessage', {
      conversationId: req.params.conversationId,
      message: { ...savedMsg.toObject(), sender: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar } },
    });

    // Notify recipient if not in the room
    if (recipient) {
      io.to(recipient.toString()).emit('messageNotification', {
        conversationId: req.params.conversationId,
        sender: { name: req.user.name, avatar: req.user.avatar },
        content: content.trim(),
      });

      await Notification.create({
        user: recipient,
        type: 'message',
        title: `New message from ${req.user.name}`,
        message: content.trim().substring(0, 80),
        link: `/messages/${req.params.conversationId}`,
        avatar: req.user.avatar,
      });
    }

    res.status(201).json(savedMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
