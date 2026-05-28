const express = require('express');
const path = require('path');
const router = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Activity = require('../models/Activity');
const PlatformControl = require('../models/PlatformControl');
const { protect } = require('../middleware/auth');
const { getUploader } = require('../middleware/upload');

const STAFF_PRIORITIES = ['none', 'important', 'exam_priority', 'official', 'assignment', 'revision_material', 'last_minute_prep'];
const ANNOUNCEMENT_TYPES = ['general', 'exam', 'assignment', 'lab', 'important', 'revision', 'instruction'];

const staffOnly = (req, res, next) => {
  if (req.user?.role === 'staff') return next();
  return res.status(403).json({ success: false, message: 'Staff access only' });
};

const ensureOwnNote = async (req, res, next) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
  if (note.uploader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'You can only manage your own uploads' });
  }
  req.note = note;
  next();
};

const parseTags = (tags = '') =>
  (Array.isArray(tags) ? tags.join(',') : String(tags))
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

const sanitizePriority = (priority = 'none') =>
  STAFF_PRIORITIES.includes(priority) ? priority : 'none';

const getPlatformControls = async () => {
  const controls = await PlatformControl.findOne().sort({ createdAt: 1 });
  return controls || { staffAnnouncementsEnabled: true, autoApproveStaffUploads: true };
};

router.get('/stats', protect, staffOnly, async (req, res) => {
  try {
    const notes = await Note.find({ uploader: req.user._id }).sort({ createdAt: -1 }).lean();
    const announcements = await Announcement.find({ postedBy: req.user._id }).sort({ isPinned: -1, createdAt: -1 }).lean();

    const totalUploads = notes.length;
    const totalDownloads = notes.reduce((sum, note) => sum + (note.downloads || 0), 0);
    const totalUpvotes = notes.reduce((sum, note) => sum + (note.upvoteCount || 0), 0);
    const totalViews = notes.reduce((sum, note) => sum + (note.views || 0), 0);
    const totalComments = notes.reduce((sum, note) => sum + (note.comments?.length || 0), 0);
    const announcementAppreciations = announcements.reduce((sum, ann) => sum + (ann.appreciationCount || 0), 0);
    const totalStudentInteractions = totalDownloads + totalUpvotes + totalViews + totalComments + announcementAppreciations;
    const engagementScore = Math.min(100, Math.round((totalDownloads * 1.5) + (totalViews * 0.5) + (totalUpvotes * 4) + (totalComments * 3) + (announcementAppreciations * 2)));

    const mostAppreciatedPdf = notes
      .slice()
      .sort((a, b) => ((b.upvoteCount || 0) + (b.ratingCount || 0)) - ((a.upvoteCount || 0) + (a.ratingCount || 0)))[0] || null;
    const trendingUpload = notes
      .slice()
      .sort((a, b) => ((b.downloads || 0) + (b.views || 0) + ((b.upvoteCount || 0) * 2)) - ((a.downloads || 0) + (a.views || 0) + ((a.upvoteCount || 0) * 2)))[0] || null;
    const mostDownloadedUpload = notes.slice().sort((a, b) => (b.downloads || 0) - (a.downloads || 0))[0] || null;
    const mostLikedUpload = notes.slice().sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))[0] || null;
    const examPriorityContent = notes
      .filter((note) => ['exam_priority', 'last_minute_prep', 'revision_material', 'important'].includes(note.priority))
      .sort((a, b) => ((b.downloads || 0) + (b.upvoteCount || 0)) - ((a.downloads || 0) + (a.upvoteCount || 0)))
      .slice(0, 4);

    const subjectCounts = notes.reduce((acc, note) => {
      if (!note.subject) return acc;
      acc[note.subject] = (acc[note.subject] || 0) + 1;
      return acc;
    }, {});
    const trendingSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data yet';

    const recentComments = notes
      .flatMap((note) => (note.comments || []).map((comment) => ({
        noteId: note._id,
        title: note.title,
        text: comment.text,
        createdAt: comment.createdAt,
      })))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const recentInteractions = notes
      .filter((note) => (note.downloads || 0) || (note.upvoteCount || 0) || (note.views || 0) || (note.comments?.length || 0))
      .slice(0, 6)
      .map((note) => ({
        noteId: note._id,
        title: note.title,
        downloads: note.downloads || 0,
        upvotes: note.upvoteCount || 0,
        views: note.views || 0,
        comments: note.comments?.length || 0,
        updatedAt: note.updatedAt,
      }));

    const monthlyTrend = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const bucketNotes = notes.filter((note) => {
        const created = new Date(note.createdAt);
        return created.getMonth() === date.getMonth() && created.getFullYear() === year;
      });
      return {
        label: month,
        uploads: bucketNotes.length,
        downloads: bucketNotes.reduce((sum, note) => sum + (note.downloads || 0), 0),
        engagement: bucketNotes.reduce((sum, note) => sum + (note.views || 0) + (note.upvoteCount || 0), 0),
      };
    });

    const materialPerformance = STAFF_PRIORITIES
      .filter((priority) => priority !== 'none')
      .map((priority) => ({
        priority,
        count: notes.filter((note) => note.priority === priority).length,
        downloads: notes.filter((note) => note.priority === priority).reduce((sum, note) => sum + (note.downloads || 0), 0),
      }))
      .filter((item) => item.count > 0);

    res.json({
      success: true,
      stats: {
        totalUploads,
        totalDownloads,
        totalUpvotes,
        totalViews,
        totalComments,
        totalStudentInteractions,
        engagementScore,
        announcementsPosted: announcements.length,
        announcementAppreciations,
        mostAppreciatedPdf,
        mostDownloadedUpload,
        mostLikedUpload,
        trendingUpload,
        examPriorityContent,
        trendingSubject,
        recentInteractions,
        recentComments,
        monthlyTrend,
        materialPerformance,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/notes', protect, staffOnly, async (req, res) => {
  try {
    const notes = await Note.find({ uploader: req.user._id }).sort({ createdAt: -1 }).select('-ratings');
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/notes', protect, staffOnly, async (req, res) => {
  const uploader = getUploader();
  uploader.single('file')(req, res, async (uploadErr) => {
    if (uploadErr) return res.status(400).json({ success: false, message: uploadErr.message });

    try {
      const { title, description, subject, department, college, year, semester, tags, priority } = req.body;
      if (!req.file) return res.status(400).json({ success: false, message: 'PDF file is required' });

      const fileExt = path.extname(req.file.originalname).replace('.', '').toLowerCase();
      if (fileExt !== 'pdf') return res.status(400).json({ success: false, message: 'Staff materials must be uploaded as PDF files' });

      const note = await Note.create({
        title,
        description,
        subject,
        department,
        college: college || req.user.college || 'Sathyabama University',
        year,
        semester,
        tags: parseTags(tags),
        priority: sanitizePriority(priority),
        fileUrl: req.file.filename && req.file.path ? `/uploads/${req.file.filename}` : req.file.path || req.file.secure_url || req.file.url || '',
        filePublicId: req.file.filename || req.file.public_id || '',
        fileType: fileExt,
        fileSize: req.file.size,
        uploader: req.user._id,
        isApproved: (await getPlatformControls()).autoApproveStaffUploads !== false,
      });

      await User.findByIdAndUpdate(req.user._id, { $inc: { uploadCount: 1 } });
      await Activity.create({ action: 'STAFF_NOTE_UPLOAD', user: req.user._id, details: `Staff uploaded material: ${title}` });

      res.status(201).json({ success: true, note });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  });
});

router.put('/notes/:id', protect, staffOnly, ensureOwnNote, async (req, res) => {
  try {
    const allowed = ['title', 'description', 'subject', 'department', 'college', 'year', 'semester', 'tags', 'priority'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (updates.tags !== undefined) updates.tags = parseTags(updates.tags);
    if (updates.priority !== undefined) updates.priority = sanitizePriority(updates.priority);

    const note = await Note.findByIdAndUpdate(req.note._id, updates, { new: true, runValidators: true }).select('-ratings -comments');
    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

router.delete('/notes/:id', protect, staffOnly, ensureOwnNote, async (req, res) => {
  try {
    await req.note.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $inc: { uploadCount: -1 } });
    await Activity.create({ action: 'STAFF_NOTE_DELETE', user: req.user._id, details: `Staff deleted material: ${req.note.title}` });
    res.json({ success: true, message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/announcements', async (req, res) => {
  try {
    const query = req.query.mine === 'true' && req.user?._id ? { postedBy: req.user._id } : {};
    const announcements = await Announcement.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .populate('postedBy', 'name role avatar');
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/my-announcements', protect, staffOnly, async (req, res) => {
  try {
    const announcements = await Announcement.find({ postedBy: req.user._id })
      .sort({ isPinned: -1, createdAt: -1 })
      .populate('postedBy', 'name role avatar');
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/announcements', protect, staffOnly, async (req, res) => {
  try {
    const { title, content, type, isPinned } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required' });
    const controls = await getPlatformControls();
    if (controls.staffAnnouncementsEnabled === false) {
      return res.status(403).json({ success: false, message: 'Staff announcements are temporarily disabled by platform controls' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      type: ANNOUNCEMENT_TYPES.includes(type) ? type : 'general',
      isPinned: Boolean(isPinned),
      postedBy: req.user._id,
    });

    res.status(201).json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/announcements/:id', protect, staffOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    if (announcement.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own announcements' });
    }

    const { title, content, type, isPinned } = req.body;
    if (title !== undefined) announcement.title = title;
    if (content !== undefined) announcement.content = content;
    if (type !== undefined) announcement.type = ANNOUNCEMENT_TYPES.includes(type) ? type : announcement.type;
    if (isPinned !== undefined) announcement.isPinned = Boolean(isPinned);
    await announcement.save();

    res.json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/profile', protect, staffOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -notifications -bookmarks');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/profile', protect, staffOnly, async (req, res) => {
  try {
    const allowed = ['name', 'avatar', 'bio', 'college', 'department', 'designation', 'subjectsHandled'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (updates.subjectsHandled !== undefined) updates.subjectsHandled = parseTags(updates.subjectsHandled).map((subject) => subject.replace(/\b\w/g, (c) => c.toUpperCase()));

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password -notifications -bookmarks');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

router.delete('/announcements/:id', protect, staffOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    if (announcement.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own announcements' });
    }
    await announcement.deleteOne();
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/announcements/:id/appreciate', protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

    const alreadyAppreciated = announcement.appreciatedBy.some((id) => id.toString() === req.user._id.toString());
    if (alreadyAppreciated) {
      announcement.appreciatedBy = announcement.appreciatedBy.filter((id) => id.toString() !== req.user._id.toString());
      announcement.appreciationCount = Math.max(0, announcement.appreciationCount - 1);
    } else {
      announcement.appreciatedBy.push(req.user._id);
      announcement.appreciationCount += 1;
    }
    await announcement.save();

    res.json({ success: true, appreciated: !alreadyAppreciated, appreciationCount: announcement.appreciationCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
