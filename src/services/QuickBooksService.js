const winax = require('winax');
const logger = require('../config/logger');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const qbxmlBuilder = require('../qbxml/builders');
const qbxmlParser = require('../qbxml/parser');
const mappings = require('../mappings');
const { summarizeQuickBooksError } = require('../utils/quickBooksErrors');

class QuickBooksService {
  constructor() {
    this.appName = config.quickBooks.appName;
    this.companyFile = config.quickBooks.companyFile;
  }

  async execute(operation, payload = {}) {
    const qbxml = qbxmlBuilder.build(operation, payload);
    const parsed = await this.processQbxml(qbxml, operation);
    return mappings.map(operation, parsed);
  }

  getSupportedOperations() {
    return qbxmlBuilder.supportedOperations();
  }

  async getCompany() {
    return this.execute('company.query');
  }

  async listCustomers(filters) {
    return this.execute('customer.query', filters);
  }

  async createCustomer(customer) {
    return this.execute('customer.add', customer);
  }

  async listEstimates(filters) {
    return this.execute('estimate.query', filters);
  }

  async createEstimate(estimate) {
    return this.execute('estimate.add', estimate);
  }

  async listInvoices(filters) {
    return this.execute('invoice.query', filters);
  }

  async createInvoice(invoice) {
    return this.execute('invoice.add', invoice);
  }

  async listSalesOrders(filters) {
    return this.execute('salesOrder.query', filters);
  }

  async createSalesOrder(salesOrder) {
    return this.execute('salesOrder.add', salesOrder);
  }

  async listPayments(filters) {
    return this.execute('payment.query', filters);
  }

  async createPayment(payment) {
    return this.execute('payment.add', payment);
  }

  async listItems(filters) {
    return this.execute('item.query', filters);
  }

  async createItem(item) {
    return this.execute('item.add', item);
  }

  async listAccounts(filters) {
    return this.execute('account.query', filters);
  }

  async processQbxml(qbxml, operation) {
    let requestProcessor;
    let ticket;

    try {
      requestProcessor = new winax.Object('QBXMLRP2.RequestProcessor');

      logger.info('Opening QuickBooks connection', { operation, appName: this.appName });
      requestProcessor.OpenConnection2('', this.appName, 1);

      logger.debug('Beginning QuickBooks session', {
        operation,
        companyFile: this.companyFile || 'currently-open-company',
      });
      ticket = requestProcessor.BeginSession(this.companyFile, 2);

      logger.debug('QuickBooks QBXML request', { operation, qbxml });
      const responseXml = requestProcessor.ProcessRequest(ticket, qbxml);
      logger.debug('QuickBooks QBXML response', { operation, responseXml });

      const parsed = await qbxmlParser.parse(responseXml);
      this.assertSuccessfulResponse(parsed);
      return parsed;
    } catch (error) {
      logger.error('QuickBooks operation failed', {
        operation,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
      const summary = summarizeQuickBooksError(error);
      throw new ApiError(502, summary.message, { operation }, summary.reason);
    } finally {
      if (requestProcessor && ticket) {
        try {
          requestProcessor.EndSession(ticket);
        } catch (error) {
          logger.warn('QuickBooks EndSession failed', { operation, message: error.message });
        }
      }

      if (requestProcessor) {
        try {
          requestProcessor.CloseConnection();
        } catch (error) {
          logger.warn('QuickBooks CloseConnection failed', { operation, message: error.message });
        }
      }
    }
  }

  assertSuccessfulResponse(parsed) {
    const response = qbxmlParser.findFirstResponse(parsed);

    if (!response) {
      throw new Error('QuickBooks returned an unexpected response shape');
    }

    const statusCode = response.$ && response.$.statusCode;
    const statusSeverity = response.$ && response.$.statusSeverity;

    if (statusCode === '1' && statusSeverity === 'Info') {
      return;
    }

    if (statusCode && statusCode !== '0') {
      const statusMessage = response.$ && response.$.statusMessage;
      throw new Error(`QuickBooks status ${statusCode}: ${statusMessage || 'No status message returned'}`);
    }
  }
}

module.exports = new QuickBooksService();
