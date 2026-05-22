const express = require('express');
const router = express.Router();
const BroadcastRequest = require('../models/BroadcastRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/auth');

// @desc  Create a broadcast request (notifies ALL users)
// @route POST /api/requests
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, type, budget, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const request = await BroadcastRequest.create({
      requester: req.user._id,
      title: title.trim(),
      description: description.trim(),
      type: type || 'both',
      budget: budget || '',
      category: category || 'General',
    });

    await request.populate('requester', 'name avatar college');

    // Notify ALL other users
    const allUsers = await User.find({ _id: { $ne: req.user._id } }, '_id');
    const notifications = allUsers.map(u => ({
      user: u._id,
      type: 'broadcast_request',
      title: `📢 ${req.user.name} is looking for something!`,
      message: `"${title.trim()}" — ${type === 'buy' ? 'To Buy' : type === 'rent' ? 'To Rent' : 'To Buy or Rent'}${budget ? ` • Budget: ₹${budget}` : ''}`,
      link: '/requests',
      avatar: req.user.avatar || '',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Real-time socket broadcast to all connected clients
    const io = req.app.get('io');
    io.emit('broadcastRequest', {
      request,
      requester: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar, college: req.user.college },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('[REQUEST] Error creating broadcast:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @desc  Get all open broadcast requests (feed)
// @route GET /api/requests
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const filter = { status: 'open' };
    if (req.query.type && req.query.type !== 'all') filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;

    const requests = await BroadcastRequest.find(filter)
      .populate('requester', 'name avatar college isVerified')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await BroadcastRequest.countDocuments(filter);

    res.json({ requests, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Get my requests
// @route GET /api/requests/mine
router.get('/mine', protect, async (req, res) => {
  try {
    const requests = await BroadcastRequest.find({ requester: req.user._id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Respond to a request ("I Can Help") — starts a chat
// @route POST /api/requests/:id/respond
router.post('/:id/respond', protect, async (req, res) => {
  try {
    const request = await BroadcastRequest.findById(req.params.id).populate('requester', 'name avatar college');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.requester._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot respond to your own request' });
    }
    if (request.status === 'closed') {
      return res.status(400).json({ message: 'This request is already closed' });
    }

    // Track responder
    if (!request.responses.includes(req.user._id)) {
      request.responses.push(req.user._id);
      await request.save();
    }

    // Get or create a conversation between responder and requester
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, request.requester._id] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, request.requester._id],
      });
    }

    // Send an opening message from responder to requester
    const openingMsg = `Hi! I saw your request for "${request.title}" and I can help! Let's talk.`;
    conversation.messages.push({ sender: req.user._id, content: openingMsg, seen: false });
    conversation.lastMessage = openingMsg;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const savedMsg = conversation.messages[conversation.messages.length - 1];

    // Notify the requester
    await Notification.create({
      user: request.requester._id,
      type: 'broadcast_response',
      title: `💬 ${req.user.name} can help with your request!`,
      message: `Someone responded to "${request.title}" — tap to chat.`,
      link: `/messages/${conversation._id}`,
      avatar: req.user.avatar || '',
    });

    // Real-time socket
    const io = req.app.get('io');
    io.to(conversation._id.toString()).emit('newMessage', {
      conversationId: conversation._id.toString(),
      message: { ...savedMsg.toObject(), sender: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar } },
    });
    io.to(request.requester._id.toString()).emit('messageNotification', {
      conversationId: conversation._id.toString(),
      sender: { name: req.user.name, avatar: req.user.avatar },
      content: openingMsg,
    });

    res.json({ conversationId: conversation._id });
  } catch (error) {
    console.error('[REQUEST] Error responding:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @desc  Close a request
// @route PUT /api/requests/:id/close
router.put('/:id/close', protect, async (req, res) => {
  try {
    const request = await BroadcastRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    request.status = 'closed';
    await request.save();
    res.json({ message: 'Request closed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
