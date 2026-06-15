const fs = require('fs');
const path = require('path');
const winston = require('winston');
const config = require('./index');

const logsDirectory = path.resolve(__dirname, '../../logs');

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const details = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${details}`;
  })
);

const logger = winston.createLogger({
  level: config.logLevel,
  defaultMeta: { service: 'quickbooks-desktop-adapter' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDirectory, 'error.log'),
      level: 'error',
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDirectory, 'app.log'),
      format: fileFormat,
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

module.exports = logger;
