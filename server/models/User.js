const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  designation: {
    type: String,
    maxlength: [100, 'Designation cannot exceed 100 characters'],
    default: ''
  },
  subjectsHandled: [{ type: String, trim: true }],
  college: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', ''],
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin', 'superadmin'],
    default: 'student'
  },
  adminStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  notifications: [{
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  badges: [{
    name: String,
    icon: String,
    awardedAt: { type: Date, default: Date.now }
  }],
  uploadCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Performance Indexes
userSchema.index({ role: 1, adminStatus: 1 });
userSchema.index({ points: -1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
