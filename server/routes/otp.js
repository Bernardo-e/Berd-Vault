const express = require('express');
const router = express.Router();
const OTP = require('../models/OTP');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/mailer');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/otp/send
// @desc    Send OTP to email
// @access  Public
router.post('/send', [
  body('email').isEmail().withMessage('Valid email is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, checkUserExists } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();

  // Optional: check if user already exists (for signup)
  if (checkUserExists) {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Cooldown check: check if an OTP was recently sent (within 1 minute)
  const recentOTP = await OTP.findOne({ email: normalizedEmail, createdAt: { $gt: new Date(Date.now() - 60000) } });
  if (recentOTP) {
    return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting another code' });
  }

  const otp = generateOTP();
  
  // Save to DB (overwrite existing for this email)
  await OTP.findOneAndDelete({ email: normalizedEmail });
  await OTP.create({ email: normalizedEmail, otp });

  // Send Email (use normalized email)
  try {
    await sendOTPEmail(normalizedEmail, otp);
  } catch (emailError) {
    // If email fails, delete the OTP record and propagate error
    await OTP.deleteOne({ email: normalizedEmail });
    console.error('OTP send failed for', normalizedEmail, ':', emailError.message);
    throw emailError;
  }

  res.json({ success: true, message: 'Verification code sent to ' + normalizedEmail });
}));

// @route   POST /api/otp/verify
// @desc    Verify OTP
// @access  Public
router.post('/verify', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Valid 6-digit code is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, otp } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();

  const record = await OTP.findOne({ email: normalizedEmail, otp });
  if (!record) {
    return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
  }

  // Success (we don't delete yet, the actual action like signup will verify again or we can delete here)
  // Actually, it's safer to delete here to prevent reuse.
  await OTP.deleteOne({ _id: record._id });

  res.json({ success: true, message: 'Email verified successfully' });
}));

module.exports = router;
