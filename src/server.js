const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');

const server = app.listen(config.port, () => {
  logger.info('QuickBooks Desktop Adapter listening', {
    port: config.port,
    appName: config.quickBooks.appName,
  });
});

const shutdown = (signal) => {
  logger.info('Received shutdown signal', { signal });
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
});
