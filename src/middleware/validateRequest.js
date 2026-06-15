const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    next();
    return;
  }

  next(new ApiError(400, 'Request validation failed', result.array()));
};

module.exports = validateRequest;
