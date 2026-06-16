const escapeXml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const formatQbDate = (value) => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
};

const formatQbAmount = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return value;
  }

  return amount.toFixed(2);
};

const value = (node, key) => (node && node[key] !== undefined ? node[key] : undefined);

module.exports = {
  escapeXml,
  formatQbAmount,
  formatQbDate,
  value,
};
