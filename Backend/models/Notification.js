const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: String,
    required: true,
    index: true
  },
  recipientType: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  type: {
    type: String,
    enum: ['message', 'feedback', 'announcement', 'certificate', 'internship', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  senderId: {
    type: String
  },
  senderName: {
    type: String
  },
  link: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for fast queries: unread notifications for a user, sorted by newest
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
