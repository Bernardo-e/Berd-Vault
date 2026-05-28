const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/mailer');
const asyncHandler = require('../middleware/asyncHandler');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password, college, department, year, role: selectedRole } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();

  // Verify OTP (Temporarily disabled)
  // const OTP = require('../models/OTP');
  // const validOTP = await OTP.findOne({ email: normalizedEmail, otp });
  // if (!validOTP) {
  //   return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
  // }
  // // Delete OTP after verification
  // await OTP.deleteOne({ _id: validOTP?._id || null });

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  let role = selectedRole || 'student';
  let adminStatus = 'none';

  // Super Admin override
  if (email === "narded2007@gmail.com") {
    role = "superadmin";
    adminStatus = "approved";
  } 
  // Admin request logic
  else if (selectedRole === 'admin') {
    role = "student"; // Default to student until approved
    adminStatus = "pending";
  }

  const user = await User.create({ name, email, password, college, department, year, role, adminStatus });
  
  // Send Welcome Email (Async)
  sendWelcomeEmail(email, name).catch(e => console.error("Email error:", e));
  
  await Activity.create({
    action: 'USER_REGISTER',
    user: user._id,
    details: `New user registered: ${name} (${role})`
  });

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      college: user.college,
      department: user.department,
      year: user.year,
      role: user.role,
      uploadCount: user.uploadCount,
      bookmarks: user.bookmarks
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password, role: selectedRole } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Role check if provided
  if (selectedRole) {
    const isMatch = (selectedRole === user.role) || 
                    (selectedRole === 'admin' && user.role === 'superadmin') ||
                    (selectedRole === 'student' && user.role === 'staff');
    
    if (!isMatch && user.role !== 'superadmin') {
       return res.status(401).json({ success: false, message: `Access denied: User is not registered as ${selectedRole}` });
    }
  }

  const token = signToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      college: user.college,
      department: user.department,
      year: user.year,
      role: user.role,
      uploadCount: user.uploadCount,
      bookmarks: user.bookmarks,
      notifications: user.notifications.filter(n => !n.read).length
    }
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('bookmarks', 'title subject avgRating downloads');
  res.json({ success: true, user });
}));

module.exports = router;
