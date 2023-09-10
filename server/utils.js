import { DateTime, Duration } from "luxon";

export const formatToJSDate = ({
  dateStr,
  fromFormat = "yyyyMMddHHmmss",
} = {}) => DateTime.fromFormat(dateStr, fromFormat).toJSDate();

export const formatToDateTime = ({
  dateStr,
  fromFormat = "yyyyMMddHHmmss",
} = {}) => DateTime.fromFormat(dateStr, fromFormat);
