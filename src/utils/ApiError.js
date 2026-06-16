class ApiError extends Error {
  constructor(statusCode, message, details, reason) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.reason = reason || message;
  }
}

module.exports = ApiError;
