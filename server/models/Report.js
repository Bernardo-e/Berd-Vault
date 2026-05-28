const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  note: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['wrong_pdf', 'spam', 'duplicate', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed'],
    default: 'pending'
  },
  comments: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
