const classifyQuickBooksError = (error) => {
  const message = String(error && error.message ? error.message : '');

  if (message.includes('unable to log into this QuickBooks company data file automatically')) {
    return 'QuickBooks Desktop app authorization is required';
  }

  if (message.includes('company data file is not open')) {
    return 'QuickBooks company file is not open';
  }

  if (message.includes('Could not start QuickBooks')) {
    return 'QuickBooks Desktop could not be started';
  }

  if (message.includes('could not be found in QuickBooks')) {
    return 'Referenced QuickBooks object was not found';
  }

  if (message.includes('parsing the provided XML')) {
    return 'QuickBooks rejected the generated request';
  }

  return 'QuickBooks Desktop operation failed';
};

module.exports = {
  classifyQuickBooksError,
};
