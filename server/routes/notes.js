const express = require('express');
const router = express.Router();
const path = require('path');
const Note = require('../models/Note');
const User = require('../models/User');
const Activity = require('../models/Activity');
const PlatformControl = require('../models/PlatformControl');
const { protect, adminOnly } = require('../middleware/auth');
const { getUploader } = require('../middleware/upload');

const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const normalizeFileUrl = (req, fileUrl = '') => {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  const normalizedPath = fileUrl.replace(/\\/g, '/').replace(/^\/+/, '');

  if (normalizedPath.startsWith('uploads/')) {
    return `${getBaseUrl(req)}/${normalizedPath}`;
  }

  return `${getBaseUrl(req)}/${normalizedPath}`;
};

const getPlatformControls = async () => {
  const controls = await PlatformControl.findOne().sort({ createdAt: 1 });
  return controls || { studentUploadsEnabled: true };
};

// @route   GET /api/notes
// @desc    Get all notes with filter + search + pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search, college, department, year, semester, subject,
      priority, page = 1, limit = 12, sort = 'newest'
    } = req.query;

    const query = { isApproved: true };

    if (college)     query.college = new RegExp(college, 'i');
    if (department)  query.department = new RegExp(department, 'i');
    if (year)        query.year = year;
    if (semester)    query.semester = semester;
    if (subject)     query.subject = new RegExp(subject, 'i');
    if (priority)    query.priority = priority;

    if (search) {
      query.$text = { $search: search };
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { downloads: -1 },
      rating: { avgRating: -1 },
      views: { views: -1 }
    };

    const notes = await Note.find(query)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('uploader', 'name avatar college role')
      .select('-ratings -comments');

    const total = await Note.countDocuments(query);

    res.json({
      success: true,
      notes,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notes/trending
// @desc    Get trending notes (high downloads + rating)
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const notes = await Note.find({ isApproved: true })
      .sort({ downloads: -1, avgRating: -1 })
      .limit(8)
      .populate('uploader', 'name avatar')
      .select('-ratings -comments');
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notes/recent
// @desc    Get recently added notes (last 30 days)
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const notes = await Note.find({ isApproved: true, createdAt: { $gte: thirtyDaysAgo } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('uploader', 'name avatar')
      .select('-ratings -comments');
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notes/:id
// @desc    Get single note + increment views
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('uploader', 'name avatar college department')
      .populate('comments.user', 'name avatar');

    if (!note || !note.isApproved) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Decode token if exists to track unique views for authenticated users
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Ignore invalid tokens for public view
      }
    }

    if (userId) {
      const alreadyViewed = note.viewedBy && note.viewedBy.some(id => id.toString() === userId.toString());
      if (!alreadyViewed) {
        await Note.findByIdAndUpdate(req.params.id, {
          $addToSet: { viewedBy: userId },
          $inc: { views: 1 }
        });
        note.views = (note.views || 0) + 1;
      }
    } else {
      await Note.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
      note.views = (note.views || 0) + 1;
    }

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/notes
// @desc    Upload a new note
// @access  Private
router.post('/', protect, async (req, res) => {
  const uploader = getUploader();
  uploader.single('file')(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ success: false, message: uploadErr.message });
    }

    try {
      const { title, description, subject, department, college, year, semester, tags } = req.body;
      const controls = await getPlatformControls();
      if (controls.studentUploadsEnabled === false && req.user.role === 'student') {
        return res.status(403).json({ success: false, message: 'Student uploads are temporarily disabled by platform controls' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'File is required' });
      }

      const fileExt = path.extname(req.file.originalname).replace('.', '').toLowerCase();
      const fileUrl = req.file.filename && req.file.path
        ? `/uploads/${req.file.filename}`
        : req.file.path || req.file.secure_url || req.file.url || '';
      const filePublicId = req.file.filename || req.file.public_id || '';

      const note = await Note.create({
        title, description, subject, department, college, year, semester,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        fileUrl,
        filePublicId,
        fileType: fileExt,
        fileSize: req.file.size,
        uploader: req.user._id
      });

      // Increment user upload count & add notification
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { uploadCount: 1 },
        $push: {
          notifications: {
            message: `Your note "${title}" was uploaded successfully!`,
            read: false
          }
        }
      });
      
      await Activity.create({
        action: 'NOTE_UPLOAD',
        user: req.user._id,
        details: `Uploaded note: ${title}`
      });

      res.status(201).json({ success: true, note });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  });
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    if (note.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await note.deleteOne();
    await User.findByIdAndUpdate(note.uploader, { $inc: { uploadCount: -1 } });

    await Activity.create({
      action: 'NOTE_DELETE',
      user: req.user._id,
      details: `Deleted note: ${note.title}`
    });

    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/notes/:id/rate
// @desc    Rate a note (1-5 stars)
// @access  Private
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { score } = req.body;
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 5' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const existing = note.ratings.find(r => r.user.toString() === req.user._id.toString());
    if (existing) {
      existing.score = score;
    } else {
      note.ratings.push({ user: req.user._id, score });
    }

    note.calculateAvgRating();
    await note.save();

    res.json({ success: true, avgRating: note.avgRating, ratingCount: note.ratingCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/notes/:id/comment
// @desc    Add a comment
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    note.comments.push({ user: req.user._id, text: text.trim() });
    await note.save();

    const updatedNote = await Note.findById(req.params.id).populate('comments.user', 'name avatar');
    const newComment = updatedNote.comments[updatedNote.comments.length - 1];

    res.json({ success: true, comment: newComment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/notes/:id/download
// @desc    Increment download count + return file URL
// @access  Private
router.post('/:id/download', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const userId = req.user._id.toString();
    const hasDownloaded = note.downloadedBy && note.downloadedBy.some(id => id.toString() === userId);

    if (!hasDownloaded) {
      await Note.findByIdAndUpdate(req.params.id, {
        $addToSet: { downloadedBy: req.user._id },
        $inc: { downloads: 1 }
      });
      // Also increment downloadCount on uploader (only once per unique downloader!)
      await User.findByIdAndUpdate(note.uploader, { $inc: { downloadCount: 1 } });
    }

    res.json({ success: true, fileUrl: normalizeFileUrl(req, note.fileUrl) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notes/admin/all
// @desc    Admin: get all notes (incl. unapproved)
// @access  Admin
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const notes = await Note.find({}).sort({ createdAt: -1 }).populate('uploader', 'name email');
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/notes/:id/approve
// @desc    Admin: approve/unapprove note
// @access  Admin
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { isApproved: req.body.isApproved },
      { new: true }
    );
    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/notes/admin/:id
// @desc    Admin: update a note
// @access  Admin
router.put('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
