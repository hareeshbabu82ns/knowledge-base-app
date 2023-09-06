import { DateTime, Duration } from 'luxon';

export const getCurrentDate = ({ format = 'yyyyMMddHHmmss' }) => DateTime.now().toFormat(format);

export const formatDuration = ({ seconds, format = 'hh:mm:ss' }) =>
  Duration.fromObject({ seconds }).toFormat(format);

export const diffInSeconds = ({ dateStart, dateEnd, format = 'yyyyMMddHHmmss' }) => {
  // calculate diff
  const dStart = dateStart ? DateTime.fromFormat(dateStart, format) : DateTime.now();
  const dEnd = dateEnd ? DateTime.fromFormat(dateEnd, format) : DateTime.now();
  return dEnd.diff(dStart, 'seconds').seconds;
};
