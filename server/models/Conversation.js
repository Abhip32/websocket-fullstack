const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  conversationType: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct',
  },
  name: {
    type: String,
    default: null,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Conversation', conversationSchema);
