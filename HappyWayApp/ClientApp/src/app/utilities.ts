export function getDateWithTimeZoneOffsetHours(date: Date) {
  const resDate = new Date(date);
  const currentTimeZoneOffsetInHours = resDate.getTimezoneOffset() / -60;
  resDate.setHours(resDate.getHours() + currentTimeZoneOffsetInHours);
  return resDate;
}
