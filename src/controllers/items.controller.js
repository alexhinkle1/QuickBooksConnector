const quickBooksService = require('../services/QuickBooksService');

const listItems = async (req, res, next) => {
  try {
    const items = await quickBooksService.listItems(req.query);
    res.json({ data: items });
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  try {
    const item = await quickBooksService.createItem(req.body);
    res.status(201).json({ data: item });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listItems,
  createItem,
};
