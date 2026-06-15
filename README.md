# QuickBooks Desktop REST API Adapter

Local REST API layer for connecting Make.com to QuickBooks Desktop through the Make On-Prem Agent.

```text
Make Cloud -> Make On-Prem Agent -> Node.js API -> QuickBooks Desktop SDK (QBXMLRP2)
```

Base URL:

```text
http://localhost:3000
```

This service is only responsible for QuickBooks Desktop integration. It does not contain Salesforce or other external-system business logic.

## Features

- CommonJS Node.js Express API.
- QuickBooks Desktop communication through one service: `QuickBooksService`.
- QBXML request generation and QBXML response parsing.
- Clean JSON API responses; QBXML is never returned to clients.
- Winston logging to `logs/app.log` and `logs/error.log`.
- Request validation with `express-validator`.
- Security middleware with `helmet` and `cors`.
- Optional generic adapter endpoint: `POST /execute`.

## Requirements

- Windows.
- QuickBooks Desktop installed.
- QuickBooks company file available and accessible.
- QuickBooks Desktop SDK / QBXMLRP2 Request Processor registered.
- Node.js installed.
- Make On-Prem Agent running on the same machine or able to reach this machine.

## Installation

Install dependencies:

```powershell
npm install
```

If `npm` is not on PATH but Node is installed in the default Windows location:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
& 'C:\Program Files\nodejs\npm.cmd' install
```

## Configuration

Create `.env` from `.env.example`:

```env
PORT=3000
QB_APP_NAME=QuickBooks Desktop Adapter
QB_COMPANY_FILE=
LOG_LEVEL=info
```

### Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | Local HTTP port for the REST API. |
| `QB_APP_NAME` | No | `QuickBooks Desktop Adapter` | Application name shown in QuickBooks Integrated Application permissions. |
| `QB_COMPANY_FILE` | No | empty | Full path to a `.qbw` company file. Leave empty to connect to the currently open QuickBooks company. |
| `LOG_LEVEL` | No | `info` | Winston log level. Use `debug` to log QBXML request/response payloads. |

### Company File Modes

Interactive mode, recommended for first authorization:

```env
QB_COMPANY_FILE=
```

Open QuickBooks Desktop, log in to the company file, then call an API endpoint such as `GET /company`. QuickBooks should show an Integrated Application permission prompt for `QB_APP_NAME`.

Explicit company file mode:

```env
QB_COMPANY_FILE=C:\Users\Public\Documents\Intuit\QuickBooks\Company Files\YourCompany.qbw
```

This mode requires QuickBooks admin approval for automatic login in:

```text
Edit -> Preferences -> Integrated Applications -> Company Preferences
```

Grant access to the app name configured by `QB_APP_NAME`.

## Running

Start production mode:

```powershell
npm start
```

Start development mode with nodemon:

```powershell
npm run dev
```

Health check:

```powershell
curl.exe http://localhost:3000/health
```

## QuickBooks Authorization Checklist

1. Open QuickBooks Desktop.
2. Open the target company file.
3. Log in as a QuickBooks admin for first authorization.
4. Start the Node API.
5. Call `GET /company`.
6. Approve the Integrated Application prompt for `QuickBooks Desktop Adapter`.
7. For unattended access, enable automatic login in QuickBooks Integrated Application preferences.

## Response Format

Successful responses use:

```json
{
  "data": {}
}
```

List responses use:

```json
{
  "data": []
}
```

Errors use:

```json
{
  "error": {
    "message": "QuickBooks Desktop operation failed",
    "statusCode": 502
  }
}
```

Raw QuickBooks errors are logged server-side and are not exposed to API clients.

## Common Query Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `limit` | integer, 1-1000 | Max records to request from QuickBooks. |
| `activeStatus` | `ActiveOnly`, `InactiveOnly`, `All` | List active/inactive records where supported. |
| `fullName` | string | Exact QuickBooks full name lookup for customers/items. |
| `customerFullName` | string | Filter transactions by exact customer full name. |

## Endpoints

### GET /health

Returns API health only. Does not call QuickBooks.

Example response:

```json
{
  "status": "ok",
  "service": "quickbooks-desktop-adapter",
  "timestamp": "2026-06-15T17:11:29.379Z"
}
```

### GET /company

Returns the currently connected QuickBooks company.

Example:

```http
GET /company
```

Example response:

```json
{
  "data": {
    "name": "Example Company",
    "legalName": "Example Company",
    "address": {
      "line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001"
    },
    "email": "accounting@example.com",
    "phone": "555-0100",
    "country": "US",
    "qbFileMode": "SingleUser"
  }
}
```

Some fields may be omitted if QuickBooks does not return them.

## Customers

### GET /customers

Query customers.

Query parameters:

| Parameter | Type | Required |
| --- | --- | --- |
| `limit` | integer, 1-1000 | No |
| `fullName` | string | No |
| `activeStatus` | `ActiveOnly`, `InactiveOnly`, `All` | No |

Examples:

```http
GET /customers?limit=10
GET /customers?fullName=Make%20API%20Approved%20Test%2020260615%20131203
```

Example response:

```json
{
  "data": [
    {
      "listId": "80000002-1234567890",
      "timeCreated": "2026-06-15T14:12:04-04:00",
      "timeModified": "2026-06-15T14:12:04-04:00",
      "editSequence": "1234567890",
      "name": "Acme Corp 20260615 131203",
      "fullName": "Acme Corp 20260615 131203",
      "isActive": "true",
      "companyName": "Acme Corp",
      "firstName": "Make",
      "lastName": "Approved",
      "phone": "555-0101",
      "email": "make-api-approved@example.com",
      "balance": "0.00"
    }
  ]
}
```

### POST /customers

Create a customer.

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | Yes | Max 41 characters. Must be unique in QuickBooks. |
| `companyName` | string | No | Max 41 characters. |
| `firstName` | string | No | Max 25 characters. |
| `lastName` | string | No | Max 25 characters. |
| `email` | string | No | Valid email. |
| `phone` | string | No | Max 21 characters. |
| `billAddress` | object | No | Address object. |
| `shipAddress` | object | No | Address object. |

Request:

```json
{
  "name": "Acme Corp",
  "companyName": "Acme Corp",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "phone": "555-0100",
  "billAddress": {
    "line1": "100 Main St",
    "line2": "Suite 200",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "shipAddress": {
    "line1": "100 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  }
}
```

Response:

```json
{
  "data": {
    "listId": "80000002-1234567890",
    "name": "Acme Corp",
    "fullName": "Acme Corp",
    "isActive": "true",
    "email": "ada@example.com",
    "balance": "0.00"
  }
}
```

## Items

### GET /items

Query items.

Query parameters:

| Parameter | Type | Required |
| --- | --- | --- |
| `limit` | integer, 1-1000 | No |
| `fullName` | string | No |
| `activeStatus` | `ActiveOnly`, `InactiveOnly`, `All` | No |

Example:

```http
GET /items?limit=10
GET /items?fullName=MakeSvc%20131714
```

Response:

```json
{
  "data": [
    {
      "listId": "80000001-1234567891",
      "timeCreated": "2026-06-15T14:17:15-04:00",
      "timeModified": "2026-06-15T14:17:15-04:00",
      "editSequence": "1234567891",
      "name": "Consulting Service",
      "fullName": "Consulting Service",
      "isActive": "true",
      "type": "Service",
      "salesDescription": "Test service item created by API",
      "price": "100.00",
      "account": {
        "listId": "80000006-1234567892",
        "fullName": "Consulting Income"
      }
    }
  ]
}
```

If QuickBooks has no matching items:

```json
{
  "data": []
}
```

### POST /items

Create a QuickBooks service item. This is useful before creating estimates, invoices, or sales orders.

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | Yes | Max 31 characters. Must be unique. |
| `description` | string | No | Sales/purchase description. |
| `price` | number | No | Default sales price/rate. |
| `incomeAccountFullName` | string | Yes | Existing QuickBooks income account full name. |

Request:

```json
{
  "name": "Consulting Service",
  "description": "Test service item created by API",
  "price": 100,
  "incomeAccountFullName": "Consulting Income"
}
```

Response:

```json
{
  "data": {
    "listId": "80000001-1234567891",
    "name": "Consulting Service",
    "fullName": "Consulting Service",
    "isActive": "true",
    "type": "Service",
    "salesDescription": "Test service item created by API",
    "price": "100.00",
    "account": {
      "listId": "80000006-1234567892",
      "fullName": "Consulting Income"
    }
  }
}
```

## Accounts

### GET /accounts

Query chart of accounts.

Query parameters:

| Parameter | Type | Required |
| --- | --- | --- |
| `limit` | integer, 1-1000 | No |
| `activeStatus` | `ActiveOnly`, `InactiveOnly`, `All` | No |

Example:

```http
GET /accounts?limit=10
```

Response:

```json
{
  "data": [
    {
      "listId": "80000006-1234567892",
      "timeCreated": "2026-06-15T13:24:54-04:00",
      "timeModified": "2026-06-15T13:24:54-04:00",
      "editSequence": "1234567892",
      "name": "Consulting Income",
      "fullName": "Consulting Income",
      "isActive": "true",
      "accountType": "Income",
      "balance": "0.00"
    }
  ]
}
```

## Estimates

### GET /estimates

Query estimates. Transaction queries include line items.

Query parameters:

| Parameter | Type | Required |
| --- | --- | --- |
| `limit` | integer, 1-1000 | No |
| `customerFullName` | string | No |

Example:

```http
GET /estimates?customerFullName=Acme%20Corp&limit=5
```

Response:

```json
{
  "data": [
    {
      "txnId": "1-1234567893",
      "timeCreated": "2026-06-15T14:17:31-04:00",
      "timeModified": "2026-06-15T14:17:31-04:00",
      "editSequence": "1234567893",
      "txnNumber": "1",
      "customer": {
        "listId": "80000002-1234567890",
        "fullName": "Acme Corp"
      },
      "txnDate": "2026-06-15",
      "refNumber": "1",
      "subtotal": "100.00",
      "totalAmount": "100.00",
      "memo": "API transaction write validation",
      "lines": [
        {
          "item": {
            "listId": "80000001-1234567891",
            "fullName": "Consulting Service"
          },
          "description": "Estimate line created by API validation",
          "quantity": "1",
          "rate": "100.00",
          "amount": "100.00"
        }
      ]
    }
  ]
}
```

### POST /estimates

Create an estimate.

Request fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `customerFullName` | string | Yes | Existing QuickBooks customer full name. |
| `txnDate` | ISO date string | No | Example: `2026-06-15`. |
| `refNumber` | string | No | Max 11 characters. |
| `memo` | string | No | Transaction memo. |
| `lines` | array | Yes | At least one line. |
| `lines[].itemFullName` | string | Yes | Existing QuickBooks item full name. |
| `lines[].description` | string | No | Line description. |
| `lines[].quantity` | number | No | Quantity. |
| `lines[].rate` | number | No | Unit rate. |
| `lines[].amount` | number | No | Explicit line amount. |

Request:

```json
{
  "customerFullName": "Acme Corp",
  "txnDate": "2026-06-15",
  "memo": "API transaction write validation",
  "lines": [
    {
      "itemFullName": "Consulting Service",
      "description": "Estimate line created by API validation",
      "quantity": 1,
      "rate": 100
    }
  ]
}
```

Response:

```json
{
  "data": {
    "txnId": "1-1234567893",
    "txnNumber": "1",
    "customer": {
      "listId": "80000002-1234567890",
      "fullName": "Acme Corp"
    },
    "txnDate": "2026-06-15",
    "refNumber": "1",
    "subtotal": "100.00",
    "totalAmount": "100.00",
    "memo": "API transaction write validation",
    "lines": [
      {
        "item": {
          "listId": "80000001-1234567891",
          "fullName": "Consulting Service"
        },
        "description": "Estimate line created by API validation",
        "quantity": "1",
        "rate": "100.00",
        "amount": "100.00"
      }
    ]
  }
}
```

## Invoices

### GET /invoices

Query invoices. Supports the same query parameters and response shape as estimates.

```http
GET /invoices?customerFullName=Acme%20Corp&limit=5
```

### POST /invoices

Create an invoice. Uses the same request line structure as `POST /estimates`.

Request:

```json
{
  "customerFullName": "Acme Corp",
  "txnDate": "2026-06-15",
  "memo": "Invoice created by API",
  "lines": [
    {
      "itemFullName": "Consulting Service",
      "description": "Invoice line created by API",
      "quantity": 1,
      "rate": 100
    }
  ]
}
```

Response shape:

```json
{
  "data": {
    "txnId": "123-456",
    "txnNumber": "2",
    "customer": {
      "fullName": "Acme Corp"
    },
    "txnDate": "2026-06-15",
    "subtotal": "100.00",
    "totalAmount": "100.00",
    "balanceRemaining": "100.00",
    "memo": "Invoice created by API",
    "lines": [
      {
        "item": {
          "fullName": "Consulting Service"
        },
        "description": "Invoice line created by API",
        "quantity": "1",
        "rate": "100.00",
        "amount": "100.00"
      }
    ]
  }
}
```

## Sales Orders

### GET /salesorders

Query sales orders. Supports the same query parameters and response shape as estimates.

```http
GET /salesorders?customerFullName=Acme%20Corp&limit=5
```

### POST /salesorders

Create a sales order. Uses the same request line structure as `POST /estimates`.

Request:

```json
{
  "customerFullName": "Acme Corp",
  "txnDate": "2026-06-15",
  "memo": "Sales order created by API",
  "lines": [
    {
      "itemFullName": "Consulting Service",
      "description": "Sales order line created by API",
      "quantity": 1,
      "rate": 100
    }
  ]
}
```

## Payments

### GET /payments

Query received payments.

Query parameters:

| Parameter | Type | Required |
| --- | --- | --- |
| `limit` | integer, 1-1000 | No |
| `customerFullName` | string | No |

Example:

```http
GET /payments?customerFullName=Acme%20Corp&limit=5
```

Response:

```json
{
  "data": [
    {
      "txnId": "123-456",
      "timeCreated": "2026-06-15T14:20:00-04:00",
      "timeModified": "2026-06-15T14:20:00-04:00",
      "editSequence": "123456",
      "customer": {
        "listId": "80000002-1234567890",
        "fullName": "Acme Corp"
      },
      "txnDate": "2026-06-15",
      "refNumber": "PMT-1",
      "totalAmount": "100.00",
      "paymentMethod": {
        "fullName": "Check"
      },
      "depositToAccount": {
        "fullName": "Undeposited Funds"
      },
      "memo": "Payment created by API"
    }
  ]
}
```

### POST /payments

Create a received payment.

Request fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `customerFullName` | string | Yes | Existing QuickBooks customer full name. |
| `totalAmount` | number | Yes | Payment amount. |
| `txnDate` | ISO date string | No | Example: `2026-06-15`. |
| `refNumber` | string | No | Max 11 characters. |
| `memo` | string | No | Payment memo. |
| `depositToAccountFullName` | string | No | Existing QuickBooks account full name. |
| `paymentMethodFullName` | string | No | Existing QuickBooks payment method full name. |

Request:

```json
{
  "customerFullName": "Acme Corp",
  "totalAmount": 100,
  "txnDate": "2026-06-15",
  "refNumber": "PMT-1",
  "memo": "Payment created by API",
  "depositToAccountFullName": "Undeposited Funds",
  "paymentMethodFullName": "Check"
}
```

Response shape:

```json
{
  "data": {
    "txnId": "123-456",
    "customer": {
      "fullName": "Acme Corp"
    },
    "txnDate": "2026-06-15",
    "refNumber": "PMT-1",
    "totalAmount": "100.00",
    "memo": "Payment created by API"
  }
}
```

## Generic Execution Endpoint

### POST /execute

Executes a whitelisted adapter operation. This endpoint does not accept raw QBXML.

Supported operations:

```text
company.query
customer.query
customer.add
estimate.query
estimate.add
invoice.query
invoice.add
salesOrder.query
salesOrder.add
payment.query
payment.add
item.query
item.add
account.query
```

Request:

```json
{
  "operation": "customer.query",
  "payload": {
    "limit": 10,
    "activeStatus": "ActiveOnly"
  }
}
```

Response:

```json
{
  "data": [
    {
      "listId": "80000002-1234567890",
      "fullName": "Acme Corp"
    }
  ]
}
```

## Make.com Usage

Use the Make On-Prem Agent to call:

```text
http://localhost:3000
```

Typical Make HTTP module settings:

| Setting | Value |
| --- | --- |
| Method | `GET` or `POST` |
| URL | `http://localhost:3000/customers` |
| Body type | Raw JSON for POST endpoints |
| Headers | `Content-Type: application/json` |

Example Make POST body for a customer:

```json
{
  "name": "{{Customer Name}}",
  "companyName": "{{Company Name}}",
  "email": "{{Email}}",
  "phone": "{{Phone}}"
}
```

Example Make POST body for an estimate:

```json
{
  "customerFullName": "{{QuickBooks Customer FullName}}",
  "memo": "Created by Make",
  "lines": [
    {
      "itemFullName": "{{QuickBooks Item FullName}}",
      "description": "{{Description}}",
      "quantity": "{{Quantity}}",
      "rate": "{{Rate}}"
    }
  ]
}
```

## Logging

Logs are written to:

```text
logs/app.log
logs/error.log
```

Logged events:

- HTTP requests.
- QuickBooks connection/session lifecycle.
- QBXML requests and responses when `LOG_LEVEL=debug`.
- Errors and stack traces.

For production, use:

```env
LOG_LEVEL=info
```

For troubleshooting QuickBooks request payloads, use:

```env
LOG_LEVEL=debug
```

## QuickBooks Notes

- Customer `name` and item `name` must be unique in QuickBooks.
- QuickBooks item names are limited to 31 characters.
- Customer names are limited to 41 characters.
- Transaction `refNumber` is limited to 11 characters by this API validation.
- Estimates, invoices, and sales orders require at least one existing item.
- Payments do not currently apply to specific invoices; they create a received payment for the customer.
- This adapter opens and closes a QuickBooks SDK session for each API request.

## Troubleshooting

### `QuickBooks Desktop operation failed`

Check `logs/app.log` or `logs/error.log` for the raw QuickBooks message.

Common causes:

- QuickBooks Desktop is not open.
- No company file is open and `QB_COMPANY_FILE` is empty.
- The app has not been approved in Integrated Applications.
- The configured `QB_COMPANY_FILE` path is wrong.
- The referenced customer, item, account, or payment method does not exist.
- QuickBooks is showing an interactive modal prompt.

### `This application is unable to log into this QuickBooks company data file automatically`

Open QuickBooks as admin and grant automatic login:

```text
Edit -> Preferences -> Integrated Applications -> Company Preferences
```

If permission already exists, remove it, save preferences, then approve the app again.

### `A query request did not find a matching object in QuickBooks`

For list endpoints this API returns:

```json
{
  "data": []
}
```

For exact full-name lookups, verify the `fullName` exactly matches QuickBooks, including spaces, punctuation, and parent-child naming.

## Template Readiness Notes

This repository is intended to be cloned and configured per QuickBooks Desktop installation.

Before using it with a new company file:

1. Copy `.env.example` to `.env`.
2. Set `QB_APP_NAME` to the application name you want QuickBooks users to approve.
3. Leave `QB_COMPANY_FILE` empty for first-run interactive authorization, or set it to the target `.qbw` path after automatic login is approved.
4. Open QuickBooks Desktop and the target company file.
5. Call `GET /company` and approve the Integrated Application prompt.
6. Create or identify at least one service item before testing transaction writes.
