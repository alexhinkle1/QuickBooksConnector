const quickBooksService = require('../services/QuickBooksService');

const listSalesOrders = async (req, res, next) => {
  try {
    const salesOrders = await quickBooksService.listSalesOrders(req.query);
    res.json({ data: salesOrders });
  } catch (error) {
    next(error);
  }
};

const createSalesOrder = async (req, res, next) => {
  try {
    const salesOrder = await quickBooksService.createSalesOrder(req.body);
    res.status(201).json({ data: salesOrder });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listSalesOrders,
  createSalesOrder,
};
