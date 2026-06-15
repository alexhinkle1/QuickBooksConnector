const { escapeXml, formatQbDate } = require('../utils/qbxml');

const envelope = (body) => `<?xml version="1.0" encoding="utf-8"?>
<?qbxml version="16.0"?>
<QBXML>
  <QBXMLMsgsRq onError="stopOnError">
${body}
  </QBXMLMsgsRq>
</QBXML>`;

const tag = (name, value) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  return `<${name}>${escapeXml(String(value))}</${name}>`;
};

const listRef = (name, fullName) => {
  if (!fullName) {
    return '';
  }

  return `<${name}><FullName>${escapeXml(String(fullName))}</FullName></${name}>`;
};

const activeStatus = (filters = {}) => tag('ActiveStatus', filters.activeStatus || 'ActiveOnly');

const maxReturned = (filters = {}) => tag('MaxReturned', filters.limit || 100);

const fullNameFilter = (fullName) => {
  if (!fullName) {
    return '';
  }

  return `<FullName>${escapeXml(String(fullName))}</FullName>`;
};

const customerFilter = (filters = {}) => {
  if (!filters.customerFullName) {
    return '';
  }

  return `<EntityFilter>${fullNameFilter(filters.customerFullName)}</EntityFilter>`;
};

const addressBlock = (name, address = {}) => {
  if (!address || Object.keys(address).length === 0) {
    return '';
  }

  return `<${name}>
    ${tag('Addr1', address.line1)}
    ${tag('Addr2', address.line2)}
    ${tag('Addr3', address.line3)}
    ${tag('City', address.city)}
    ${tag('State', address.state)}
    ${tag('PostalCode', address.postalCode)}
    ${tag('Country', address.country)}
  </${name}>`;
};

const transactionLines = (lineTag, lines = []) => lines.map((line) => `<${lineTag}>
    ${listRef('ItemRef', line.itemFullName)}
    ${tag('Desc', line.description)}
    ${tag('Quantity', line.quantity)}
    ${tag('Rate', line.rate)}
    ${tag('Amount', line.amount)}
  </${lineTag}>`).join('\n');

const transactionAdd = (requestName, addName, lineTag, txn) => envelope(`    <${requestName} requestID="1">
      <${addName}>
        ${listRef('CustomerRef', txn.customerFullName)}
        ${tag('TxnDate', formatQbDate(txn.txnDate))}
        ${tag('RefNumber', txn.refNumber)}
        ${tag('Memo', txn.memo)}
${transactionLines(lineTag, txn.lines)}
      </${addName}>
    </${requestName}>`);

const transactionQuery = (requestName, filters = {}) => envelope(`    <${requestName} requestID="1">
      ${maxReturned(filters)}
      ${customerFilter(filters)}
      ${tag('IncludeLineItems', true)}
    </${requestName}>`);

const builders = {
  'company.query': () => envelope('    <CompanyQueryRq requestID="1" />'),
  'customer.query': (filters = {}) => {
    const queryBody = filters.fullName
      ? fullNameFilter(filters.fullName)
      : `${maxReturned(filters)}
      ${activeStatus(filters)}`;

    return envelope(`    <CustomerQueryRq requestID="1">
      ${queryBody}
    </CustomerQueryRq>`);
  },
  'customer.add': (customer) => envelope(`    <CustomerAddRq requestID="1">
      <CustomerAdd>
        ${tag('Name', customer.name)}
        ${tag('CompanyName', customer.companyName)}
        ${tag('FirstName', customer.firstName)}
        ${tag('LastName', customer.lastName)}
        ${tag('Phone', customer.phone)}
        ${tag('Email', customer.email)}
        ${addressBlock('BillAddress', customer.billAddress)}
        ${addressBlock('ShipAddress', customer.shipAddress)}
      </CustomerAdd>
    </CustomerAddRq>`),
  'estimate.query': (filters) => transactionQuery('EstimateQueryRq', filters),
  'estimate.add': (estimate) => transactionAdd('EstimateAddRq', 'EstimateAdd', 'EstimateLineAdd', estimate),
  'invoice.query': (filters) => transactionQuery('InvoiceQueryRq', filters),
  'invoice.add': (invoice) => transactionAdd('InvoiceAddRq', 'InvoiceAdd', 'InvoiceLineAdd', invoice),
  'salesOrder.query': (filters) => transactionQuery('SalesOrderQueryRq', filters),
  'salesOrder.add': (salesOrder) => transactionAdd('SalesOrderAddRq', 'SalesOrderAdd', 'SalesOrderLineAdd', salesOrder),
  'payment.query': (filters = {}) => envelope(`    <ReceivePaymentQueryRq requestID="1">
      ${maxReturned(filters)}
      ${customerFilter(filters)}
    </ReceivePaymentQueryRq>`),
  'payment.add': (payment) => envelope(`    <ReceivePaymentAddRq requestID="1">
      <ReceivePaymentAdd>
        ${listRef('CustomerRef', payment.customerFullName)}
        ${tag('TxnDate', formatQbDate(payment.txnDate))}
        ${tag('RefNumber', payment.refNumber)}
        ${tag('TotalAmount', payment.totalAmount)}
        ${listRef('PaymentMethodRef', payment.paymentMethodFullName)}
        ${listRef('DepositToAccountRef', payment.depositToAccountFullName)}
        ${tag('Memo', payment.memo)}
      </ReceivePaymentAdd>
    </ReceivePaymentAddRq>`),
  'item.query': (filters = {}) => envelope(`    <ItemQueryRq requestID="1">
      ${filters.fullName ? fullNameFilter(filters.fullName) : `${maxReturned(filters)}
      ${activeStatus(filters)}`}
    </ItemQueryRq>`),
  'item.add': (item) => envelope(`    <ItemServiceAddRq requestID="1">
      <ItemServiceAdd>
        ${tag('Name', item.name)}
        <SalesOrPurchase>
          ${tag('Desc', item.description)}
          ${tag('Price', item.price)}
          ${listRef('AccountRef', item.incomeAccountFullName)}
        </SalesOrPurchase>
      </ItemServiceAdd>
    </ItemServiceAddRq>`),
  'account.query': (filters = {}) => envelope(`    <AccountQueryRq requestID="1">
      ${maxReturned(filters)}
      ${activeStatus(filters)}
    </AccountQueryRq>`),
};

const build = (operation, payload) => {
  const builder = builders[operation];

  if (!builder) {
    throw new Error(`Unsupported QuickBooks operation: ${operation}`);
  }

  return builder(payload);
};

const supportedOperations = () => Object.keys(builders);

module.exports = {
  build,
  supportedOperations,
};
