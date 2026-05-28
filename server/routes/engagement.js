const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const ACTIVE_USER_WINDOW_MS = 45 * 1000;
const activeUsers = new Map();
const activeUserStreams = new Map();

function normalizeClientId(clientId) {
  if (typeof clientId !== 'string') return null;
  const trimmed = clientId.trim();
  return trimmed ? trimmed.slice(0, 120) : null;
}

function getFallbackClientId(req) {
  return `${req.ip || 'unknown'}:${req.get('user-agent') || 'unknown'}`;
}

function pruneActiveUsers(now = Date.now()) {
  for (const [clientId, lastSeen] of activeUsers.entries()) {
    if (now - lastSeen > ACTIVE_USER_WINDOW_MS) {
      activeUsers.delete(clientId);
    }
  }
}

function getActiveUserCount() {
  pruneActiveUsers();
  const uniqueClientIds = new Set(activeUsers.keys());

  for (const [clientId, streams] of activeUserStreams.entries()) {
    if (streams.size > 0) uniqueClientIds.add(clientId);
  }

  return uniqueClientIds.size;
}

function getActiveUserPayload() {
  return {
    success: true,
    activeUsers: getActiveUserCount(),
    windowSeconds: Math.round(ACTIVE_USER_WINDOW_MS / 1000)
  };
}

function sendActiveUserEvent(stream, payload = getActiveUserPayload()) {
  stream.write(`event: active-users\n`);
  stream.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcastActiveUsers() {
  const payload = getActiveUserPayload();

  for (const streams of activeUserStreams.values()) {
    for (const stream of streams) {
      sendActiveUserEvent(stream, payload);
    }
  }
}

// @route   POST /api/engagement/active-users/heartbeat
// @desc    Register a visitor heartbeat and return current live users
// @access  Public
router.post('/active-users/heartbeat', asyncHandler(async (req, res) => {
  const now = Date.now();
  const clientId = normalizeClientId(req.body?.clientId) || getFallbackClientId(req);

  pruneActiveUsers(now);
  activeUsers.set(clientId, now);
  broadcastActiveUsers();

  res.json(getActiveUserPayload());
}));

// @route   GET /api/engagement/active-users
// @desc    Get current live users
// @access  Public
router.get('/active-users', asyncHandler(async (req, res) => {
  res.json(getActiveUserPayload());
}));

// @route   GET /api/engagement/active-users/stream
// @desc    Legacy live-user stream kept open so old dev clients do not fall back to heartbeat counting
// @access  Public
router.get('/active-users/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  sendActiveUserEvent(res);

  const keepAliveId = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAliveId);
  });
});

// @route   GET /api/engagement/active-users/live-stream
// @desc    Stream current live users as connections open and close
// @access  Public
router.get('/active-users/live-stream', (req, res) => {
  const clientId = normalizeClientId(req.query?.clientId) || getFallbackClientId(req);

  activeUsers.set(clientId, Date.now());

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  if (!activeUserStreams.has(clientId)) {
    activeUserStreams.set(clientId, new Set());
  }

  const streams = activeUserStreams.get(clientId);
  streams.add(res);

  broadcastActiveUsers();

  const keepAliveId = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAliveId);
    streams.delete(res);

    if (streams.size === 0) {
      activeUserStreams.delete(clientId);
      activeUsers.delete(clientId);
    }

    broadcastActiveUsers();
  });
});

// @route   POST /api/engagement/active-users/leave
// @desc    Remove a visitor from live users when the browser is closed
// @access  Public
router.post('/active-users/leave', asyncHandler(async (req, res) => {
  const clientId = normalizeClientId(req.body?.clientId || req.query?.clientId) || getFallbackClientId(req);

  activeUsers.delete(clientId);
  broadcastActiveUsers();

  res.json(getActiveUserPayload());
}));

// ─── APPRECIATION LOGIC ──────────────────────────────────────────────────────

// @route   POST /api/engagement/upvote/:id
// @desc    Upvote/Like a note
// @access  Private
router.post('/upvote/:id', protect, asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

  const isUpvoted = note.upvotes.includes(req.user._id);

  if (isUpvoted) {
    // Remove upvote
    note.upvotes = note.upvotes.filter(id => id.toString() !== req.user._id.toString());
    note.upvoteCount = Math.max(0, note.upvoteCount - 1);
    
    // Deduct points from uploader safely
    const uploader = await User.findById(note.uploader);
    if (uploader) {
      uploader.points = Math.max(0, uploader.points - 10);
      await uploader.save();
    }
  } else {
    // Add upvote
    note.upvotes.push(req.user._id);
    note.upvoteCount += 1;
    
    // Award points to uploader
    const uploader = await User.findById(note.uploader);
    if (uploader) {
      uploader.points += 10;
      await uploader.save();
    }
  }

  await note.save();
  res.json({ success: true, upvoteCount: note.upvoteCount, isUpvoted: !isUpvoted });
}));

// @route   GET /api/engagement/leaderboard
// @desc    Get top contributors
// @access  Public
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const topStudents = await User.aggregate([
    { $match: { role: 'student' } },
    {
      $lookup: {
        from: 'notes',
        localField: '_id',
        foreignField: 'uploader',
        as: 'notes'
      }
    },
    {
      $lookup: {
        from: 'notes',
        let: { userId: '$_id' },
        pipeline: [
          { $unwind: '$comments' },
          { $match: { $expr: { $eq: ['$comments.user', '$$userId'] } } }
        ],
        as: 'userComments'
      }
    },
    {
      $project: {
        name: 1,
        avatar: 1,
        badges: 1,
        uploadCount: { $size: '$notes' },
        upvotesReceived: { $sum: '$notes.upvoteCount' },
        commentsCount: { $size: '$userComments' }
      }
    },
    {
      $addFields: {
        points: {
          $add: [
            { $multiply: ['$uploadCount', 20] },
            { $multiply: ['$upvotesReceived', 10] },
            { $multiply: ['$commentsCount', 5] }
          ]
        }
      }
    },
    { $sort: { points: -1, uploadCount: -1 } },
    { $limit: 10 }
  ]);

  const topStaff = await User.aggregate([
    { $match: { role: { $in: ['staff', 'admin'] } } },
    {
      $lookup: {
        from: 'notes',
        localField: '_id',
        foreignField: 'uploader',
        as: 'notes'
      }
    },
    {
      $lookup: {
        from: 'notes',
        let: { userId: '$_id' },
        pipeline: [
          { $unwind: '$comments' },
          { $match: { $expr: { $eq: ['$comments.user', '$$userId'] } } }
        ],
        as: 'userComments'
      }
    },
    {
      $project: {
        name: 1,
        avatar: 1,
        badges: 1,
        uploadCount: { $size: '$notes' },
        upvotesReceived: { $sum: '$notes.upvoteCount' },
        commentsCount: { $size: '$userComments' }
      }
    },
    {
      $addFields: {
        points: {
          $add: [
            { $multiply: ['$uploadCount', 20] },
            { $multiply: ['$upvotesReceived', 10] },
            { $multiply: ['$commentsCount', 5] }
          ]
        }
      }
    },
    { $sort: { points: -1, uploadCount: -1 } },
    { $limit: 10 }
  ]);

  res.json({ success: true, topStudents, topStaff });
}));

// ─── BADGE SYSTEM ────────────────────────────────────────────────────────────

// @route   POST /api/engagement/award-badges
// @desc    Check and award badges (Internal/Cron-like)
// @access  Private
router.post('/award-badges', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const badges = [];

  // Exam Hero: 5+ exam_priority uploads
  const examUploads = await Note.countDocuments({ uploader: user._id, priority: 'exam_priority' });
  if (examUploads >= 5) badges.push({ name: 'Exam Hero', icon: '🏆' });

  // Top Contributor: 10+ total uploads
  if (user.uploadCount >= 10) badges.push({ name: 'Top Contributor', icon: '🔥' });

  // Most Helpful: 100+ points
  if (user.points >= 100) badges.push({ name: 'Most Helpful', icon: '🤝' });

  // Update user badges if new ones found
  const currentBadgeNames = user.badges.map(b => b.name);
  const newBadges = badges.filter(b => !currentBadgeNames.includes(b.name));

  if (newBadges.length > 0) {
    user.badges.push(...newBadges);
    await user.save();
  }

  res.json({ success: true, badges: user.badges });
}));

module.exports = router;
