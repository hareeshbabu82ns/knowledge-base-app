import { DateTime, Duration } from 'luxon';
import { AES, enc } from 'crypto-js';

export const formatDate = ({
  dateStr,
  fromFormat = 'yyyyMMddHHmmss',
  toFormat = 'MMM dd yyyy HH:mm',
} = {}) => DateTime.fromFormat(dateStr, fromFormat).toFormat(toFormat);

export const formatToJSDate = ({ dateStr, fromFormat = 'yyyyMMddHHmmss' } = {}) =>
  DateTime.fromFormat(dateStr, fromFormat).toJSDate();

export const getCurrentDate = ({ format = 'yyyyMMddHHmmss' } = {}) =>
  DateTime.now().toFormat(format);

export const formatJsDateToDB = ({ date, format = 'yyyyMMddHHmmss' } = {}) =>
  DateTime.fromJSDate(date).toFormat(format);

export const formatDuration = ({ seconds, format = 'hh:mm:ss' }) =>
  Duration.fromObject({ seconds }).toFormat(format);

export const diffInSeconds = ({ dateStart, dateEnd, format = 'yyyyMMddHHmmss' } = {}) => {
  // calculate diff
  const dStart = dateStart ? DateTime.fromFormat(dateStart, format) : DateTime.now();
  const dEnd = dateEnd ? DateTime.fromFormat(dateEnd, format) : DateTime.now();
  return dEnd.diff(dStart, 'seconds').seconds;
};

// Generate a random encryption key
export async function generateEncryptionKey() {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Generate a random IV (Initialization Vector)
  const base64IV = btoa(JSON.stringify(iv));
  return base64IV;
}

// Encrypt data using an encryption key
export function encryptData({ key, data }) {
  return AES.encrypt(data, key).toString();
}

// Decrypt data using an encryption key
export function decryptData({ key, data }) {
  const bytes = AES.decrypt(data, key);
  return bytes.toString(enc.Utf8);
}

// DataGrid Filters to MDB Filters
export function dataGridFiltersToMDB(filters = []) {
  const res = filters
    .filter((f) => f.value && f.value.length > 0)
    .map(({ field, operator, value }) => {
      let mdbOperator = '$eq';
      let mdbValue = value;
      switch (operator) {
        case '=':
        case 'is':
          mdbOperator = '$eq';
          break;
        case '!=':
          mdbOperator = '$ne';
          break;
        case '<':
        case 'before':
          mdbOperator = '$lt';
          break;
        case '<=':
        case 'onOrBefore':
          mdbOperator = '$lte';
          break;
        case '>':
        case 'after':
          mdbOperator = '$gt';
          break;
        case '>=':
        case 'onOrAfter':
          mdbOperator = '$gte';
          break;
        case 'isAnyOf':
          mdbOperator = '$in';
          break;
        default:
          break;
      }
      return { [field]: { [mdbOperator]: mdbValue } };
    });
  // for DataGrid non Pro its only one filter
  return res[0];
}

// Crypto usage:
// (async () => {
//   try {
//     const {key,iv} = await generateEncryptionKey();
//     const originalData = "This is a secret message.";

//     const encryptedData = await encryptData({key, iv, data: originalData});
//     console.log("Encrypted Data:", encryptedData);

//     const decryptedData = await decryptData({key, iv, data: encryptedData});
//     console.log("Decrypted Data:", decryptedData);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// })();
