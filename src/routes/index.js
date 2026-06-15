const express = require('express');
const healthRoutes = require('./health.routes');
const companyRoutes = require('./company.routes');
const customerRoutes = require('./customers.routes');
const estimateRoutes = require('./estimates.routes');
const invoiceRoutes = require('./invoices.routes');
const salesOrderRoutes = require('./salesOrders.routes');
const paymentRoutes = require('./payments.routes');
const itemRoutes = require('./items.routes');
const accountRoutes = require('./accounts.routes');
const executeRoutes = require('./execute.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/company', companyRoutes);
router.use('/customers', customerRoutes);
router.use('/estimates', estimateRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/salesorders', salesOrderRoutes);
router.use('/payments', paymentRoutes);
router.use('/items', itemRoutes);
router.use('/accounts', accountRoutes);
router.use('/execute', executeRoutes);

module.exports = router;
