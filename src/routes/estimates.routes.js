const express = require('express');
const { body, query } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const estimatesController = require('../controllers/estimates.controller');

const router = express.Router();

router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
    query('customerFullName').optional().isString().trim().notEmpty(),
  ],
  validateRequest,
  estimatesController.listEstimates
);

router.post(
  '/',
  [
    body('customerFullName').isString().trim().notEmpty(),
    body('txnDate').optional().isISO8601().toDate(),
    body('refNumber').optional().isString().trim().isLength({ max: 11 }),
    body('memo').optional().isString().trim(),
    body('lines').isArray({ min: 1 }),
    body('lines.*.itemFullName').isString().trim().notEmpty(),
    body('lines.*.quantity').optional().isFloat({ min: 0 }),
    body('lines.*.rate').optional().isFloat({ min: 0 }),
    body('lines.*.amount').optional().isFloat({ min: 0 }),
    body('lines.*.description').optional().isString().trim(),
  ],
  validateRequest,
  estimatesController.createEstimate
);

module.exports = router;
