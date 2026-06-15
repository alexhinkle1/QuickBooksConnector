const { asArray, findFirstResponse } = require('../qbxml/parser');

const flattenRef = (node, field) => {
  const ref = node && node[field];
  if (!ref) {
    return undefined;
  }

  return {
    listId: ref.ListID,
    fullName: ref.FullName,
  };
};

const mapAddress = (address) => {
  if (!address) {
    return undefined;
  }

  return {
    line1: address.Addr1,
    line2: address.Addr2,
    line3: address.Addr3,
    city: address.City,
    state: address.State,
    postalCode: address.PostalCode,
    country: address.Country,
  };
};

const mapCompany = (parsed) => {
  const response = findFirstResponse(parsed);
  const company = response && response.CompanyRet;

  if (!company) {
    return null;
  }

  return {
    name: company.CompanyName,
    legalName: company.LegalCompanyName,
    address: mapAddress(company.CompanyAddress),
    email: company.Email,
    phone: company.Phone,
    country: company.Country,
    qbFileMode: company.QBFileMode,
  };
};

const mapCustomer = (customer) => ({
  listId: customer.ListID,
  timeCreated: customer.TimeCreated,
  timeModified: customer.TimeModified,
  editSequence: customer.EditSequence,
  name: customer.Name,
  fullName: customer.FullName,
  isActive: customer.IsActive,
  companyName: customer.CompanyName,
  firstName: customer.FirstName,
  lastName: customer.LastName,
  phone: customer.Phone,
  email: customer.Email,
  billAddress: mapAddress(customer.BillAddress),
  shipAddress: mapAddress(customer.ShipAddress),
  balance: customer.Balance,
});

const mapTransactionLine = (line) => ({
  item: flattenRef(line, 'ItemRef'),
  description: line.Desc,
  quantity: line.Quantity,
  rate: line.Rate,
  amount: line.Amount,
});

const mapTransaction = (txn, lineKey) => ({
  txnId: txn.TxnID,
  timeCreated: txn.TimeCreated,
  timeModified: txn.TimeModified,
  editSequence: txn.EditSequence,
  txnNumber: txn.TxnNumber,
  customer: flattenRef(txn, 'CustomerRef'),
  txnDate: txn.TxnDate,
  refNumber: txn.RefNumber,
  subtotal: txn.Subtotal,
  totalAmount: txn.TotalAmount,
  balanceRemaining: txn.BalanceRemaining,
  memo: txn.Memo,
  lines: asArray(txn[lineKey]).map(mapTransactionLine),
});

const mapPayment = (payment) => ({
  txnId: payment.TxnID,
  timeCreated: payment.TimeCreated,
  timeModified: payment.TimeModified,
  editSequence: payment.EditSequence,
  customer: flattenRef(payment, 'CustomerRef'),
  txnDate: payment.TxnDate,
  refNumber: payment.RefNumber,
  totalAmount: payment.TotalAmount,
  paymentMethod: flattenRef(payment, 'PaymentMethodRef'),
  depositToAccount: flattenRef(payment, 'DepositToAccountRef'),
  memo: payment.Memo,
});

const mapItem = (item, type) => ({
  listId: item.ListID,
  timeCreated: item.TimeCreated,
  timeModified: item.TimeModified,
  editSequence: item.EditSequence,
  name: item.Name,
  fullName: item.FullName,
  isActive: item.IsActive,
  type,
  salesDescription: item.SalesOrPurchase && item.SalesOrPurchase.Desc,
  price: item.SalesOrPurchase && item.SalesOrPurchase.Price,
  account: flattenRef(item.SalesOrPurchase, 'AccountRef'),
});

const mapAccount = (account) => ({
  listId: account.ListID,
  timeCreated: account.TimeCreated,
  timeModified: account.TimeModified,
  editSequence: account.EditSequence,
  name: account.Name,
  fullName: account.FullName,
  isActive: account.IsActive,
  accountType: account.AccountType,
  balance: account.Balance,
});

const listFromResponse = (parsed, retKey, mapper) => {
  const response = findFirstResponse(parsed);
  return asArray(response && response[retKey]).map(mapper);
};

const mappers = {
  'company.query': mapCompany,
  'customer.query': (parsed) => listFromResponse(parsed, 'CustomerRet', mapCustomer),
  'customer.add': (parsed) => listFromResponse(parsed, 'CustomerRet', mapCustomer)[0] || null,
  'estimate.query': (parsed) => listFromResponse(parsed, 'EstimateRet', (txn) => mapTransaction(txn, 'EstimateLineRet')),
  'estimate.add': (parsed) => listFromResponse(parsed, 'EstimateRet', (txn) => mapTransaction(txn, 'EstimateLineRet'))[0] || null,
  'invoice.query': (parsed) => listFromResponse(parsed, 'InvoiceRet', (txn) => mapTransaction(txn, 'InvoiceLineRet')),
  'invoice.add': (parsed) => listFromResponse(parsed, 'InvoiceRet', (txn) => mapTransaction(txn, 'InvoiceLineRet'))[0] || null,
  'salesOrder.query': (parsed) => listFromResponse(parsed, 'SalesOrderRet', (txn) => mapTransaction(txn, 'SalesOrderLineRet')),
  'salesOrder.add': (parsed) => listFromResponse(parsed, 'SalesOrderRet', (txn) => mapTransaction(txn, 'SalesOrderLineRet'))[0] || null,
  'payment.query': (parsed) => listFromResponse(parsed, 'ReceivePaymentRet', mapPayment),
  'payment.add': (parsed) => listFromResponse(parsed, 'ReceivePaymentRet', mapPayment)[0] || null,
  'item.query': (parsed) => {
    const response = findFirstResponse(parsed);
    const items = [
      ...asArray(response && response.ItemServiceRet).map((item) => mapItem(item, 'Service')),
      ...asArray(response && response.ItemInventoryRet).map((item) => mapItem(item, 'Inventory')),
      ...asArray(response && response.ItemNonInventoryRet).map((item) => mapItem(item, 'NonInventory')),
      ...asArray(response && response.ItemOtherChargeRet).map((item) => mapItem(item, 'OtherCharge')),
    ];
    return items;
  },
  'item.add': (parsed) => listFromResponse(parsed, 'ItemServiceRet', (item) => mapItem(item, 'Service'))[0] || null,
  'account.query': (parsed) => listFromResponse(parsed, 'AccountRet', mapAccount),
};

const map = (operation, parsed) => {
  const mapper = mappers[operation];

  if (!mapper) {
    throw new Error(`Unsupported QuickBooks mapper: ${operation}`);
  }

  return mapper(parsed);
};

module.exports = {
  map,
};
