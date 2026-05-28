const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const error = new Error('Not authorized to access this route');
    error.status = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      const error = new Error('User not found');
      error.status = 401;
      return next(error);
    }
    next();
  } catch (err) {
    const error = new Error('Not authorized to access this route');
    error.status = 401;
    return next(error);
  }
});

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    return next();
  }
  const error = new Error('Access denied: Admin only');
  error.status = 403;
  return next(error);
};

const staffOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin' || req.user.role === 'superadmin')) {
    return next();
  }
  const error = new Error('Access denied: Staff/Admin only');
  error.status = 403;
  return next(error);
};

const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    return next();
  }
  const error = new Error('Access denied: Super Admin only');
  error.status = 403;
  return next(error);
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error(`User role ${req.user?.role || 'none'} is not authorized to access this route`);
      error.status = 403;
      return next(error);
    }
    next();
  };
};

module.exports = { protect, adminOnly, staffOnly, superAdminOnly, authorize };
