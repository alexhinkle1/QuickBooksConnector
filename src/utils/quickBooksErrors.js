const summarizeQuickBooksError = (error) => {
  const message = String(error && error.message ? error.message : '');

  if (message.includes('unable to log into this QuickBooks company data file automatically')) {
    return {
      message: 'QuickBooks Desktop app authorization is required',
      reason: 'QuickBooks rejected automatic login for this company file. Open QuickBooks as an admin and approve this app in Integrated Applications.',
    };
  }

  if (message.includes('company data file is not open')) {
    return {
      message: 'QuickBooks company file is not open',
      reason: 'Open the target company file in QuickBooks Desktop or set QB_COMPANY_FILE to the full .qbw path.',
    };
  }

  if (message.includes('Could not start QuickBooks')) {
    return {
      message: 'QuickBooks Desktop could not be started',
      reason: 'QuickBooks Desktop is not running or cannot be launched by the SDK in this Windows session.',
    };
  }

  if (message.includes('could not be found in QuickBooks')) {
    return {
      message: 'Referenced QuickBooks object was not found',
      reason: message,
    };
  }

  if (message.includes('parsing the provided XML')) {
    return {
      message: 'QuickBooks rejected the generated request',
      reason: 'QuickBooks could not parse the generated QBXML. Check the request fields, field order, and unsupported values for this QuickBooks entity.',
    };
  }

  if (message.startsWith('QuickBooks status ')) {
    return {
      message: 'QuickBooks returned an error status',
      reason: message,
    };
  }

  return {
    message: 'QuickBooks Desktop operation failed',
    reason: message || 'The QuickBooks SDK call failed without a specific message.',
  };
};

module.exports = {
  summarizeQuickBooksError,
};
