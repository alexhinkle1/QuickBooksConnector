const quickBooksService = require('../services/QuickBooksService');

const listAccounts = async (req, res, next) => {
  try {
    const accounts = await quickBooksService.listAccounts(req.query);
    res.json({ data: accounts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listAccounts,
};
