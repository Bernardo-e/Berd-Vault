const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Note = require('../models/Note');
const Report = require('../models/Report');
const Activity = require('../models/Activity');
const { protect, adminOnly } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD OVERVIEW STATS
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/moderator/stats
// @desc    Get stats for admin dashboard
// @access  Admin/SuperAdmin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalNotes = await Note.countDocuments();
    const activeStudents = await User.countDocuments({ role: 'student', isBlocked: false });
    
    const downloadsData = await Note.aggregate([{ $group: { _id: null, total: { $sum: "$downloads" } } }]);
    const totalDownloads = downloadsData.length > 0 ? downloadsData[0].total : 0;

    // Exam Mode Activity (Notes tagged as exam_priority)
    const examModeNotes = await Note.countDocuments({ priority: 'exam_priority' });

    // Pending Reports
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Recent Uploads
    const recentUploads = await Note.find().sort({ createdAt: -1 }).limit(5).populate('uploader', 'name email');

    // Trending Subjects
    const trendingSubjects = await Note.aggregate([
      { $match: { subject: { $exists: true, $ne: "" } } },
      { $group: { _id: "$subject", count: { $sum: "$downloads" } } },
      { $sort: { count: -1 } },
      { $limit: 4 }
    ]);

    // Most Downloaded Notes
    const mostDownloaded = await Note.find().sort({ downloads: -1 }).limit(5).populate('uploader', 'name');

    res.json({
      success: true,
      stats: {
        totalNotes,
        activeStudents,
        totalDownloads,
        examModeNotes,
        pendingReports,
        recentUploads,
        trendingSubjects: trendingSubjects.map(s => ({ subject: s._id, downloads: s.count })),
        mostDownloaded
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PDF MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/moderator/notes
// @desc    Get all notes for moderation
// @access  Admin/SuperAdmin
router.get('/notes', protect, adminOnly, async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 }).populate('uploader', 'name email');
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/moderator/notes/:id
// @desc    Edit note metadata
// @access  Admin/SuperAdmin
router.put('/notes/:id', protect, adminOnly, async (req, res) => {
  try {
    const { title, subject, department, isApproved } = req.body;
    
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    if (title) note.title = title;
    if (subject) note.subject = subject;
    if (department) note.department = department;
    if (typeof isApproved !== 'undefined') note.isApproved = isApproved;

    await note.save();

    await Activity.create({
      action: 'NOTE_UPDATE',
      user: req.user._id,
      details: `Admin edited note: ${note.title}`
    });

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/moderator/notes/:id
// @desc    Delete a note
// @access  Admin/SuperAdmin
router.delete('/notes/:id', protect, adminOnly, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const noteTitle = note.title;
    
    // Also delete any reports associated with this note
    await Report.deleteMany({ note: note._id });
    
    await note.deleteOne();

    await Activity.create({
      action: 'NOTE_DELETE',
      user: req.user._id,
      details: `Admin deleted note: ${noteTitle}`
    });

    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/moderator/notes/:id/tag
// @desc    Tag note (important, exam_priority, trending, official)
// @access  Admin/SuperAdmin
router.put('/notes/:id/tag', protect, adminOnly, async (req, res) => {
  try {
    const { priority } = req.body;
    if (!['none', 'important', 'exam_priority', 'trending', 'official'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority' });
    }

    const note = await Note.findByIdAndUpdate(req.params.id, { priority }, { new: true });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// REPORT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// @route   POST /api/moderator/reports
// @desc    Submit a new report (Used by students, but added here for convenience)
// @access  Private
router.post('/reports', protect, async (req, res) => {
  try {
    const { noteId, reason, comments } = req.body;
    const report = await Report.create({
      note: noteId,
      reportedBy: req.user._id,
      reason,
      comments
    });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/moderator/reports
// @desc    Get all reports
// @access  Admin/SuperAdmin
router.get('/reports', protect, adminOnly, async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate('note', 'title uploader isApproved')
      .populate('reportedBy', 'name email');
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/moderator/reports/:id/status
// @desc    Update report status (reviewed, dismissed)
// @access  Admin/SuperAdmin
router.put('/reports/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/moderator/reports/:id
// @desc    Delete a report
// @access  Admin/SuperAdmin
router.delete('/reports/:id', protect, adminOnly, async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/moderator/users
// @desc    Get all users (excluding superadmins for normal admins)
// @access  Admin/SuperAdmin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    let query = {};
    // If not superadmin, hide superadmins
    if (req.user.role !== 'superadmin') {
      query.role = { $ne: 'superadmin' };
    }
    
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/moderator/users/:id/suspend
// @desc    Suspend/Unsuspend a student temporarily
// @access  Admin/SuperAdmin
router.put('/users/:id/suspend', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Admins cannot suspend superadmins. Normal admins shouldn't suspend other admins.
    if (user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Cannot suspend a Super Admin' });
    }
    if (req.user.role === 'admin' && user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admins cannot suspend other Admins' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    await Activity.create({
      action: 'USER_BAN',
      user: req.user._id,
      details: `Admin ${user.isBlocked ? 'suspended' : 'unsuspended'} user: ${user.name}`
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/moderator/users/:id/warn
// @desc    Warn a student / send notification
// @access  Admin/SuperAdmin
router.post('/users/:id/warn', protect, adminOnly, async (req, res) => {
  try {
    const { message = 'Your account has received a moderation warning from an Admin.' } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Push notification
    user.notifications = (user.notifications || 0) + 1;
    // Push warning notification to notifications history
    // Since notifications might be handled as custom arrays or subdocuments, we match the admin.js push logic:
    await User.findByIdAndUpdate(
      req.params.id,
      { $push: { notifications: { message, read: false } } }
    );

    await Activity.create({
      action: 'USER_WARN',
      user: req.user._id,
      details: `Admin warned user ${user.name}: ${message}`
    });

    res.json({ success: true, message: 'Warning dispatched successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
