const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Must be registered last in Express middleware chain
 */
const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log the full error for debugging (not exposed to client)
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    user: req.user ? req.user._id : 'unauthenticated',
  });

  // Mongoose: CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    status = 409;
    message = `A record with this ${field} already exists.`;
  }

  // Mongoose: Validation error
  if (err.name === 'ValidationError') {
    status = 400;
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(status).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // JWT errors (backup - should already be caught in auth middleware)
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  // Do not expose stack traces in production
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

/**
 * 404 Not Found handler — for unmatched routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
