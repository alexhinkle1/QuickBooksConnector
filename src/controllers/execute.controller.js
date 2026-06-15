const quickBooksService = require('../services/QuickBooksService');

const execute = async (req, res, next) => {
  try {
    const result = await quickBooksService.execute(req.body.operation, req.body.payload || {});
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  execute,
};
