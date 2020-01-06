export function getDateWithTimeZoneOffsetHours(date: Date) {
  const resDate = new Date(date);
  const currentTimeZoneOffsetInHours = resDate.getTimezoneOffset() / -60;
  resDate.setHours(resDate.getHours() + currentTimeZoneOffsetInHours);
  return resDate;
}

export function getDateText(date: Date) {
  let dd: number | string = date.getDate();
  let mm: number | string = date.getMonth() + 1;
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  return `${dd}.${mm}`;
}
