const quickBooksService = require('../services/QuickBooksService');

const listPayments = async (req, res, next) => {
  try {
    const payments = await quickBooksService.listPayments(req.query);
    res.json({ data: payments });
  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const payment = await quickBooksService.createPayment(req.body);
    res.status(201).json({ data: payment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPayments,
  createPayment,
};
