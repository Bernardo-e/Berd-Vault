const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');

// @route   PUT /api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const { name, bio, college, department, year } = req.body;
    
    const updateData = { name, bio, department, year };
    if (req.user.role === 'student') {
      updateData.college = 'Sathyabama University';
    } else {
      updateData.college = college;
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/users/bookmark/:noteId
// @desc    Toggle bookmark on a note
// @access  Private
router.post('/bookmark/:noteId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const noteId = req.params.noteId;

    const isBookmarked = user.bookmarks.includes(noteId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(b => b.toString() !== noteId);
    } else {
      user.bookmarks.push(noteId);
    }

    await user.save();
    res.json({ success: true, bookmarked: !isBookmarked, bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/me/bookmarks
// @desc    Get populated bookmarks for current user
// @access  Private
router.get('/me/bookmarks', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      select: '-comments -__v',
      populate: { path: 'uploader', select: 'name avatar college role' }
    });
    res.json({ success: true, bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/me/notifications
// @desc    Get notifications + mark as read
// @access  Private
router.get('/me/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);

    // Mark all as read
    await User.findByIdAndUpdate(req.user._id, {
      $set: { 'notifications.$[].read': true }
    });

    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/users/admin/:id/block
// @desc    Admin: block/unblock a user
// @access  Admin
router.put('/admin/:id/block', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ success: true, isBlocked: user.isBlocked });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/users/admin/:id
// @desc    Admin: delete a user
// @access  Admin
router.delete('/admin/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/users/request-admin
// @desc    Request admin access for existing student
// @access  Private
router.post('/request-admin', protect, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (user.role === 'admin' || user.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'User is already an admin' });
    }

    if (user.adminStatus === 'pending') {
      return res.status(400).json({ success: false, message: 'Request already pending' });
    }

    // Verify OTP
    const OTP = require('../models/OTP');
    const validOTP = await OTP.findOne({ email: user.email, otp });
    if (!validOTP) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }
    
    await OTP.deleteOne({ _id: validOTP._id });

    // Update status
    user.adminStatus = 'pending';
    await user.save();

    res.json({ success: true, message: 'Admin request submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to submit admin request' });
  }
});

// @route   GET /api/users/:id
// @desc    Get public profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -notifications -bookmarks');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const notes = await Note.find({ uploader: req.params.id, isApproved: true })
      .sort({ createdAt: -1 })
      .select('title subject avgRating downloads views createdAt fileType');

    res.json({ success: true, user, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
