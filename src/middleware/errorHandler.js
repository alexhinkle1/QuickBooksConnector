const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message = error instanceof ApiError ? error.message : 'QuickBooks request failed';

  logger.error('Request failed', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
  });

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
    },
  });
};

module.exports = errorHandler;
