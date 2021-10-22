import * as d from "../data";

const millisecondInDay = 1000 * 60 * 60 * 24;

export const dateTimeToDate = (dateTime: d.DateTime): Date =>
  new Date(dateTime.day * millisecondInDay + dateTime.millisecond);

export const dateTimeToMillisecondsSinceUnixEpoch = (
  dateTime: d.DateTime
): number => {
  return dateTimeToDate(dateTime).getTime();
};
