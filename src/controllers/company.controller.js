const quickBooksService = require('../services/QuickBooksService');

const getCompany = async (req, res, next) => {
  try {
    const company = await quickBooksService.getCompany();
    res.json({ data: company });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompany,
};
