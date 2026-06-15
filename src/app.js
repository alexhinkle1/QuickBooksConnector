const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const apiRoutes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

app.use('/', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
