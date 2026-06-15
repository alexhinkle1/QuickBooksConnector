const quickBooksService = require('../services/QuickBooksService');

const listCustomers = async (req, res, next) => {
  try {
    const customers = await quickBooksService.listCustomers(req.query);
    res.json({ data: customers });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const customer = await quickBooksService.createCustomer(req.body);
    res.status(201).json({ data: customer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCustomers,
  createCustomer,
};
