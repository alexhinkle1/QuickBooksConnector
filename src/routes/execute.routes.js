const express = require('express');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const executeController = require('../controllers/execute.controller');
const quickBooksService = require('../services/QuickBooksService');

const router = express.Router();

router.post(
  '/',
  [
    body('operation').isString().trim().isIn(quickBooksService.getSupportedOperations()),
    body('payload').optional().isObject(),
  ],
  validateRequest,
  executeController.execute
);

module.exports = router;
