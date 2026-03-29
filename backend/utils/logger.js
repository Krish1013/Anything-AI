const fs = require('fs');
const path = require('path');

// Simple logger that writes to console and optionally to file
const logLevels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = process.env.NODE_ENV === 'production' ? 1 : 2;

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  const msg = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
  return `[${timestamp}] [${level.toUpperCase()}] ${msg}`;
};

const logger = {
  error: (message) => {
    if (logLevels.error <= currentLevel) {
      console.error(formatMessage('error', message));
    }
  },
  warn: (message) => {
    if (logLevels.warn <= currentLevel) {
      console.warn(formatMessage('warn', message));
    }
  },
  info: (message) => {
    if (logLevels.info <= currentLevel) {
      console.info(formatMessage('info', message));
    }
  },
  debug: (message) => {
    if (logLevels.debug <= currentLevel) {
      console.debug(formatMessage('debug', message));
    }
  },
  // Morgan stream for HTTP request logging
  stream: {
    write: (message) => {
      console.info(`[${new Date().toISOString()}] [HTTP] ${message.trim()}`);
    },
  },
};

module.exports = logger;
