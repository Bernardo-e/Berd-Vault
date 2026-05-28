const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Note = require('../models/Note');
const Activity = require('../models/Activity');
const Report = require('../models/Report');
const Announcement = require('../models/Announcement');
const PlatformControl = require('../models/PlatformControl');
const { protect, superAdminOnly } = require('../middleware/auth');

const CONTENT_PRIORITIES = ['none', 'important', 'exam_priority', 'trending', 'official', 'assignment', 'revision_material', 'last_minute_prep'];

const getPlatformControls = async () => {
  let controls = await PlatformControl.findOne().sort({ createdAt: 1 });
  if (!controls) controls = await PlatformControl.create({});
  return controls;
};

// ═══════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/users
// @desc    Get all users (replaces the broken /users/admin/all)
// @access  Super Admin
router.get('/users', protect, superAdminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role
// @access  Super Admin
router.put('/users/:id/role', protect, superAdminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'staff', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (user.role === 'superadmin' && role !== 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot demote superadmin' });
    }

    const oldRole = user.role;
    user.role = role;
    if (role === 'admin') user.adminStatus = 'approved';
    if (role === 'student') user.adminStatus = 'none';
    await user.save();
    
    await Activity.create({
      action: 'ROLE_UPDATE',
      user: req.user._id,
      details: `Changed role of ${user.name} from ${oldRole} to ${role}`
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban/unban a user
// @access  Super Admin
router.put('/users/:id/ban', protect, superAdminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot ban superadmin' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    await Activity.create({
      action: 'USER_BAN',
      user: req.user._id,
      details: `${user.isBlocked ? 'Banned' : 'Unbanned'} user: ${user.name}`
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user account permanently
// @access  Super Admin
router.delete('/users/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot delete superadmin' });
    }

    const userName = user.name;
    await user.deleteOne();

    await Activity.create({
      action: 'USER_DELETE',
      user: req.user._id,
      details: `Permanently deleted user: ${userName}`
    });

    res.json({ success: true, message: 'User deleted permanently' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN REQUEST SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/requests
// @desc    Get all pending admin requests
// @access  Super Admin
router.get('/requests', protect, superAdminOnly, async (req, res) => {
  try {
    const requestHistory = await User.find({ adminStatus: { $in: ['pending', 'approved', 'rejected'] } })
      .select('-password')
      .sort({ updatedAt: -1 });
    const requests = requestHistory.filter((user) => user.adminStatus === 'pending');
    res.json({ success: true, requests, requestHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/approve/:id
// @desc    Approve admin request
// @access  Super Admin
router.post('/approve/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = 'admin';
    user.adminStatus = 'approved';
    await user.save();

    await Activity.create({
      action: 'ADMIN_APPROVE',
      user: req.user._id,
      details: `Approved admin access for ${user.name}`
    });

    res.json({ success: true, message: 'User approved as admin' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/reject/:id
// @desc    Reject admin request
// @access  Super Admin
router.post('/reject/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.adminStatus = 'rejected';
    await user.save();

    await Activity.create({
      action: 'ADMIN_REJECT',
      user: req.user._id,
      details: `Rejected admin request from ${user.name}`
    });

    res.json({ success: true, message: 'Admin request rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/remove/:id
// @desc    Remove admin privileges
// @access  Super Admin
router.delete('/remove/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot remove super admin' });
    }

    user.role = 'student';
    user.adminStatus = 'none';
    await user.save();

    await Activity.create({
      action: 'ADMIN_REMOVE',
      user: req.user._id,
      details: `Removed admin privileges from ${user.name}`
    });

    res.json({ success: true, message: 'Admin privileges removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT CONTROL
// ═══════════════════════════════════════════════════════════════════════════════

// @route   PUT /api/admin/notes/:id/tag
// @desc    Tag a note with priority (important, exam_priority, trending, official)
// @access  Super Admin
router.put('/notes/:id/tag', protect, superAdminOnly, async (req, res) => {
  try {
    const { priority } = req.body;
    if (!CONTENT_PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority value' });
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    ).populate('uploader', 'name email');

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    await Activity.create({
      action: 'NOTE_TAG',
      user: req.user._id,
      details: `Tagged "${note.title}" as ${priority}`
    });

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/notes
// @desc    Super Admin: all content for moderation
// @access  Super Admin
router.get('/notes', protect, superAdminOnly, async (req, res) => {
  try {
    const notes = await Note.find()
      .sort({ createdAt: -1 })
      .populate('uploader', 'name email role avatar')
      .select('-ratings');
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/notes/:id/moderate
// @desc    Super Admin: moderate content flags and visibility
// @access  Super Admin
router.put('/notes/:id/moderate', protect, superAdminOnly, async (req, res) => {
  try {
    const allowed = ['priority', 'isApproved', 'isFeatured', 'isExamMode'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (updates.priority && !CONTENT_PRIORITIES.includes(updates.priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority value' });
    }

    const note = await Note.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('uploader', 'name email role avatar')
      .select('-ratings');
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    await Activity.create({
      action: 'CONTENT_MODERATE',
      user: req.user._id,
      details: `Moderated "${note.title}" with ${Object.keys(updates).join(', ')}`
    });

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// @route   DELETE /api/admin/notes/:id
// @desc    Super Admin: delete any upload
// @access  Super Admin
router.delete('/notes/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    const title = note.title;
    await Report.deleteMany({ note: note._id });
    await note.deleteOne();
    await User.findByIdAndUpdate(note.uploader, { $inc: { uploadCount: -1 } });

    await Activity.create({
      action: 'CONTENT_DELETE',
      user: req.user._id,
      details: `Super Admin removed upload: ${title}`
    });

    res.json({ success: true, message: 'Upload removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/reports
// @desc    Super Admin report management
// @access  Super Admin
router.get('/reports', protect, superAdminOnly, async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'note', select: 'title subject uploader isApproved priority', populate: { path: 'uploader', select: 'name email role' } })
      .populate('reportedBy', 'name email role avatar');
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/reports/:id/status', protect, superAdminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('note', 'title')
      .populate('reportedBy', 'name email');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    await Activity.create({
      action: 'REPORT_UPDATE',
      user: req.user._id,
      details: `Marked report on "${report.note?.title || 'unknown upload'}" as ${status}`
    });

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/reports/:id', protect, superAdminOnly, async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    await Activity.create({
      action: 'REPORT_DELETE',
      user: req.user._id,
      details: 'Deleted a platform report'
    });
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/users/:id/warn', protect, superAdminOnly, async (req, res) => {
  try {
    const { message = 'Your account has received a moderation warning from the Super Admin.' } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { notifications: { message, read: false } } },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await Activity.create({
      action: 'USER_WARN',
      user: req.user._id,
      details: `Warned user ${user.name}: ${message}`
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/announcements', protect, superAdminOnly, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ isPinned: -1, createdAt: -1 })
      .populate('postedBy', 'name email role avatar');
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/announcements/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const allowed = ['isPinned', 'type', 'title', 'content'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('postedBy', 'name email role avatar');
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    await Activity.create({
      action: 'ANNOUNCEMENT_MODERATE',
      user: req.user._id,
      details: `Updated announcement: ${announcement.title}`
    });
    res.json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

router.delete('/announcements/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    const title = announcement.title;
    await announcement.deleteOne();
    await Activity.create({
      action: 'ANNOUNCEMENT_DELETE',
      user: req.user._id,
      details: `Deleted announcement: ${title}`
    });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/controls', protect, superAdminOnly, async (req, res) => {
  try {
    const controls = await getPlatformControls();
    res.json({ success: true, controls });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/controls', protect, superAdminOnly, async (req, res) => {
  try {
    const allowed = ['maintenanceMode', 'studentUploadsEnabled', 'staffAnnouncementsEnabled', 'examModeBoostEnabled', 'autoApproveStaffUploads'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = Boolean(req.body[field]);
    });
    updates.updatedBy = req.user._id;

    const controls = await PlatformControl.findOneAndUpdate({}, updates, { new: true, upsert: true, setDefaultsOnInsert: true });
    await Activity.create({
      action: 'PLATFORM_CONTROLS_UPDATE',
      user: req.user._id,
      details: `Updated platform controls: ${Object.keys(updates).filter((key) => key !== 'updatedBy').join(', ')}`
    });

    res.json({ success: true, controls });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/analytics
// @desc    Get enhanced platform analytics
// @access  Super Admin
router.get('/analytics', protect, superAdminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalNotes = await Note.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const totalAnnouncements = await Announcement.countDocuments();
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const pendingAdminRequests = await User.countDocuments({ adminStatus: 'pending' });

    const totalDownloadsData = await Note.aggregate([{ $group: { _id: null, total: { $sum: "$downloads" } } }]);
    const totalDownloads = totalDownloadsData.length > 0 ? totalDownloadsData[0].total : 0;

    const totalViewsData = await Note.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]);
    const totalViews = totalViewsData.length > 0 ? totalViewsData[0].total : 0;
    const totalUpvotesData = await Note.aggregate([{ $group: { _id: null, total: { $sum: "$upvoteCount" } } }]);
    const totalUpvotes = totalUpvotesData.length > 0 ? totalUpvotesData[0].total : 0;
    const totalEngagement = totalDownloads + totalViews + totalUpvotes;
    
    // Most active departments
    const activeDepartments = await Note.aggregate([
      { $match: { department: { $exists: true, $ne: "" } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const departmentData = activeDepartments.map(d => ({ name: d._id || "Unknown", value: d.count }));

    // Top 5 contributors (users with most uploads)
    const topContributors = await User.find({ uploadCount: { $gt: 0 } })
      .sort({ uploadCount: -1 })
      .limit(5)
      .select('name avatar uploadCount role');

    // Top 5 most downloaded notes
    const topDownloaded = await Note.find({ isApproved: true })
      .sort({ downloads: -1 })
      .limit(5)
      .select('title downloads subject')
      .populate('uploader', 'name');

    const staffContribution = await User.aggregate([
      { $match: { role: { $in: ['staff', 'admin'] } } },
      { $lookup: { from: 'notes', localField: '_id', foreignField: 'uploader', as: 'uploads' } },
      { $project: { name: 1, role: 1, uploadCount: { $size: '$uploads' }, appreciations: { $sum: '$uploads.upvoteCount' } } },
      { $sort: { uploadCount: -1, appreciations: -1 } },
      { $limit: 6 }
    ]);

    const adminActivity = await Activity.aggregate([
      { $match: { action: { $in: ['ADMIN_APPROVE', 'ADMIN_REJECT', 'ADMIN_REMOVE', 'ROLE_UPDATE', 'CONTENT_DELETE', 'REPORT_UPDATE', 'USER_BAN'] } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 7-day time-series data (real data from DB)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyUploads = await Note.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Build 7-day chart data array
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];
      const uploads = dailyUploads.find(u => u._id === key)?.count || 0;
      const users = dailySignups.find(u => u._id === key)?.count || 0;
      chartData.push({ name: dayName, uploads, users });
    }

    res.json({
      success: true,
      stats: {
        totalUsers, totalNotes, totalDownloads, totalViews,
        totalStudents, totalAdmins, totalStaff, blockedUsers,
        totalAnnouncements, totalReports, pendingReports, pendingAdminRequests,
        totalUpvotes, totalEngagement,
        departmentData, topContributors, topDownloaded, staffContribution, adminActivity, chartData
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVITY FEED
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/activity
// @desc    Get real-time activity feed
// @access  Super Admin
router.get('/activity', protect, superAdminOnly, async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('user', 'name avatar role');
    res.json({ success: true, logs: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/list
// @desc    Get all admins
// @access  Super Admin
router.get('/list', protect, superAdminOnly, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
