const express = require('express');
const { body, query } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const paymentsController = require('../controllers/payments.controller');

const router = express.Router();

router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
    query('customerFullName').optional().isString().trim().notEmpty(),
  ],
  validateRequest,
  paymentsController.listPayments
);

router.post(
  '/',
  [
    body('customerFullName').isString().trim().notEmpty(),
    body('totalAmount').isFloat({ min: 0 }),
    body('txnDate').optional().isISO8601().toDate(),
    body('refNumber').optional().isString().trim().isLength({ max: 11 }),
    body('memo').optional().isString().trim(),
    body('depositToAccountFullName').optional().isString().trim().notEmpty(),
    body('paymentMethodFullName').optional().isString().trim().notEmpty(),
    body('isAutoApply').optional().isBoolean().toBoolean(),
  ],
  validateRequest,
  paymentsController.createPayment
);

module.exports = router;
