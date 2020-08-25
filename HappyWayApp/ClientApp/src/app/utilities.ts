export function getDateWithTimeZoneOffset(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(),
    date.getSeconds()));
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

export function getNowDateWithoutTime() {
  const nowDate = new Date();
  nowDate.setHours(0, 0, 0, 0);
  return nowDate;
}

export function isSame<T>(a1: T[], a2: T[]) {
  return (a1.length === a2.length) && a1.every((element, index) => {
    return element === a2[index];
  });
}
