const quickBooksService = require('../services/QuickBooksService');

const listEstimates = async (req, res, next) => {
  try {
    const estimates = await quickBooksService.listEstimates(req.query);
    res.json({ data: estimates });
  } catch (error) {
    next(error);
  }
};

const createEstimate = async (req, res, next) => {
  try {
    const estimate = await quickBooksService.createEstimate(req.body);
    res.status(201).json({ data: estimate });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listEstimates,
  createEstimate,
};
