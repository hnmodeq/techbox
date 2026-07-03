interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

export function gregorianToJalali(date: Date): JalaliDate {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

  const g_d_n = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400) + gd;
  let j_d_n = g_d_n - 79;

  let j_np = Math.floor(j_d_n / 12053);
  j_d_n %= 12053;

  let jy = 979 + 33 * j_np + 4 * Math.floor(j_d_n / 1461);
  j_d_n %= 1461;

  if (j_d_n >= 366) {
    jy += Math.floor((j_d_n - 1) / 365);
    j_d_n = (j_d_n - 1) % 365;
  }

  let jm = 1;
  let jd = j_d_n + 1;

  if (jd <= 186) {
    jm = 1 + Math.floor(jd / 31);
    jd = 1 + (jd % 31);
  } else {
    jm = 7 + Math.floor((jd - 186) / 30);
    jd = 1 + ((jd - 186) % 30);
  }

  return { year: jy, month: jm, day: jd };
}

export function formatJalaliDate(jy: number, jm: number, jd: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${jy}/${pad(jm)}/${pad(jd)}`;
}

export function formatJalaliDatePersian(jy: number, jm: number, jd: number): string {
  const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  return `${jd} ${monthNames[jm - 1]} ${jy}`;
}

export function getJalaliDateString(date: Date): string {
  const jalali = gregorianToJalali(date);
  return formatJalaliDate(jalali.year, jalali.month, jalali.day);
}

export function getJalaliDateStringPersian(date: Date): string {
  const jalali = gregorianToJalali(date);
  return formatJalaliDatePersian(jalali.year, jalali.month, jalali.day);
}
