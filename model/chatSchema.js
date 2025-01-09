const mongoose = require('mongoose');

// Define a schema for the chat messages
const chatSchema = new mongoose.Schema({
  senderId: {
    type: String, // userId or 'admin'
    required: true
  },
  receiverId: {
    type: String, // userId for admin's message or 'admin' for user's message
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create a model for chat messages
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
