const express = require('express');
const { body, query } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const customersController = require('../controllers/customers.controller');

const router = express.Router();

router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
    query('fullName').optional().isString().trim().notEmpty(),
    query('activeStatus').optional().isIn(['ActiveOnly', 'InactiveOnly', 'All']),
  ],
  validateRequest,
  customersController.listCustomers
);

router.post(
  '/',
  [
    body('name').isString().trim().notEmpty().isLength({ max: 41 }),
    body('companyName').optional().isString().trim().isLength({ max: 41 }),
    body('firstName').optional().isString().trim().isLength({ max: 25 }),
    body('lastName').optional().isString().trim().isLength({ max: 25 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isString().trim().isLength({ max: 21 }),
    body('billAddress').optional().isObject(),
    body('shipAddress').optional().isObject(),
  ],
  validateRequest,
  customersController.createCustomer
);

module.exports = router;
