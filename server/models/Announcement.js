const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['general', 'exam', 'assignment', 'lab', 'important', 'revision', 'instruction'],
    default: 'general'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appreciatedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  appreciationCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
