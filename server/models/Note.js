const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 500 }
}, { timestamps: true });

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 1, max: 5 }
});

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  college: {
    type: String,
    required: [true, 'College is required'],
    trim: true
  },
  year: {
    type: String,
    required: true,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year']
  },
  semester: {
    type: String,
    required: true,
    enum: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
           'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']
  },
  tags: [{ type: String, trim: true, lowercase: true }],
  fileUrl: {
    type: String,
    required: [true, 'File is required']
  },
  filePublicId: { type: String, default: '' },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
    required: true
  },
  fileSize: { type: Number, default: 0 }, // bytes
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratings: [ratingSchema],
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  comments: [commentSchema],
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true }, // admin can toggle
  isFeatured: { type: Boolean, default: false },
  isExamMode: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: ['none', 'important', 'exam_priority', 'trending', 'official', 'assignment', 'revision_material', 'last_minute_prep'],
    default: 'none'
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  upvoteCount: { type: Number, default: 0 },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downloadedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Index for fast search/filter
noteSchema.index({ college: 1, department: 1, year: 1, semester: 1 });
noteSchema.index({ title: 'text', description: 'text', subject: 'text', tags: 'text' });
noteSchema.index({ isApproved: 1, createdAt: -1 });
noteSchema.index({ isFeatured: 1 });
noteSchema.index({ downloads: -1 });

// Recalculate average rating after save
noteSchema.methods.calculateAvgRating = function () {
  if (this.ratings.length === 0) {
    this.avgRating = 0;
    this.ratingCount = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.score, 0);
    this.avgRating = Math.round((sum / this.ratings.length) * 10) / 10;
    this.ratingCount = this.ratings.length;
  }
};

module.exports = mongoose.model('Note', noteSchema);
