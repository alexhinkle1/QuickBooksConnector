const { parseStringPromise } = require('xml2js');

const parse = (xml) => parseStringPromise(xml, {
  explicitArray: false,
  trim: true,
  normalizeTags: false,
});

const findFirstResponse = (parsed) => {
  const responseRoot = parsed && parsed.QBXML && parsed.QBXML.QBXMLMsgsRs;

  if (!responseRoot || typeof responseRoot !== 'object') {
    return null;
  }

  const responseKey = Object.keys(responseRoot).find((key) => key.endsWith('Rs'));
  return responseKey ? responseRoot[responseKey] : null;
};

const asArray = (value) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

module.exports = {
  parse,
  findFirstResponse,
  asArray,
};
