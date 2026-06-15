require('dotenv').config({ quiet: true });

const config = {
  port: Number(process.env.PORT || 3000),
  logLevel: process.env.LOG_LEVEL || 'info',
  quickBooks: {
    appName: process.env.QB_APP_NAME || 'QuickBooks Desktop Adapter',
    companyFile: process.env.QB_COMPANY_FILE || '',
  },
};

module.exports = config;
