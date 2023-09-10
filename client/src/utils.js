import { DateTime, Duration } from 'luxon';

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
