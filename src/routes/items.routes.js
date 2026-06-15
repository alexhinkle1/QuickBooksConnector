const express = require('express');
const { body, query } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const itemsController = require('../controllers/items.controller');

const router = express.Router();

router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
    query('fullName').optional().isString().trim().notEmpty(),
    query('activeStatus').optional().isIn(['ActiveOnly', 'InactiveOnly', 'All']),
  ],
  validateRequest,
  itemsController.listItems
);

router.post(
  '/',
  [
    body('name').isString().trim().notEmpty().isLength({ max: 31 }),
    body('description').optional().isString().trim().isLength({ max: 4095 }),
    body('price').optional().isFloat({ min: 0 }),
    body('incomeAccountFullName').isString().trim().notEmpty(),
  ],
  validateRequest,
  itemsController.createItem
);

module.exports = router;
