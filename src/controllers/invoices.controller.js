const quickBooksService = require('../services/QuickBooksService');

const listInvoices = async (req, res, next) => {
  try {
    const invoices = await quickBooksService.listInvoices(req.query);
    res.json({ data: invoices });
  } catch (error) {
    next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const invoice = await quickBooksService.createInvoice(req.body);
    res.status(201).json({ data: invoice });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listInvoices,
  createInvoice,
};
