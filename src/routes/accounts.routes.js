const express = require('express');
const { query } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const accountsController = require('../controllers/accounts.controller');

const router = express.Router();

router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
    query('activeStatus').optional().isIn(['ActiveOnly', 'InactiveOnly', 'All']),
  ],
  validateRequest,
  accountsController.listAccounts
);

module.exports = router;
