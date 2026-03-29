const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * Verifies JWT token and attaches decoded user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'Access denied. Invalid token format.');
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from DB to ensure they still exist (not deleted)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return sendError(res, 401, 'Token is valid but user no longer exists.');
    }

    // Attach full user object to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token. Please login again.');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired. Please login again.');
    }
    next(error);
  }
};

/**
 * Authorization middleware factory for role-based access control
 * @param {...string} roles - Allowed roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access forbidden. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

module.exports = { authenticate, authorizeRoles };
