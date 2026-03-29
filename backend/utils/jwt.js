const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token
 * @param {Object} payload - Data to encode { userId, role }
 * @returns {string} Signed token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '1h',
    issuer: 'task-manager-api',
    audience: 'task-manager-client',
  });
};

/**
 * Decodes and verifies a JWT token
 * @param {string} token
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'task-manager-api',
    audience: 'task-manager-client',
  });
};

module.exports = { generateToken, verifyToken };
