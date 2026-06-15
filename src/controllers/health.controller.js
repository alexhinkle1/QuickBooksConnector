const getHealth = (req, res) => {
  res.json({
    status: 'ok',
    service: 'quickbooks-desktop-adapter',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
};
