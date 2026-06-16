const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message = error instanceof ApiError ? error.message : 'QuickBooks request failed';
  const reason = error instanceof ApiError
    ? error.reason
    : (error.message || 'Unexpected server error');
  const details = error instanceof ApiError ? error.details : undefined;

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
      reason,
      statusCode,
      ...(details ? { details } : {}),
    },
  });
};

module.exports = errorHandler;
