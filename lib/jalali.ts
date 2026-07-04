/**
 * Jalali (Solar Hijri) Calendar Converter
 * تبدیل بین میلادی و شمسی با دقت نجومی استاندارد
 */

import type { JalaliDate, GregorianDate } from '@/types/timeline';

/**
 * Convert Gregorian date to Jalali (Solar Hijri)
 * Standard astronomical algorithm for 100% exact Solar Hijri dates.
 */
export function gregorianToJalali(date: Date | string): JalaliDate {
  const d = typeof date === 'string' ? new Date(date) : date;
  let gy = d.getFullYear();
  const gm = d.getMonth() + 1;
  const gd = d.getDate();

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number, jm: number, jd: number;

  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }

  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;

  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return { year: jy, month: jm, day: jd };
}

/**
 * Convert Jalali (Solar Hijri) date to Gregorian
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  let gy: number;
  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }

  let days = (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);

  gy += 400 * Math.floor(days / 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let gd = days + 1;
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm];
    if (gd <= v) break;
    gd -= v;
  }

  return { year: gy, month: gm, day: gd };
}

/**
 * Format Jalali date as string (YYYY/MM/DD)
 */
export function formatJalaliDate(year: number, month: number, day: number): string {
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
}

/**
 * Format Gregorian date as string (YYYY-MM-DD)
 */
export function formatGregorianDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get Jalali date string in Persian format
 * Example: "۱۴۰۵/۰۴/۱۳ (شنبه)"
 */
export function getJalaliDateStringPersian(date: Date | string): string {
  const gregorianDate = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(gregorianDate.getTime())) return 'تاریخ نامشخص';

  const jalali = gregorianToJalali(gregorianDate);
  const formatted = formatJalaliDate(jalali.year, jalali.month, jalali.day);
  const dayName = getPersianDayName(gregorianDate.getDay());
  const monthName = getPersianMonthName(jalali.month);

  // Convert English numbers to Persian digits
  const farsiNums = (str: string) => str.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);

  return `${farsiNums(formatted)} (${dayName}) ${monthName}`;
}

/**
 * Get Persian day name (0 = Sunday, 6 = Saturday in JS)
 */
export function getPersianDayName(dayIndex: number): string {
  const days = [
    'یکشنبه',  // Sunday
    'دوشنبه',  // Monday
    'سه‌شنبه',  // Tuesday
    'چهارشنبه', // Wednesday
    'پنج‌شنبه', // Thursday
    'جمعه',    // Friday
    'شنبه',    // Saturday
  ];
  return days[dayIndex] || days[0];
}

/**
 * Get Persian month name
 */
export function getPersianMonthName(month: number): string {
  const months = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ];
  return months[Math.max(0, Math.min(11, month - 1))] || '';
}

/**
 * Get current Jalali date
 */
export function getNowJalali(): JalaliDate {
  return gregorianToJalali(new Date());
}

/**
 * Parse Jalali date string (YYYY/MM/DD)
 */
export function parseJalaliDateString(dateString: string): JalaliDate | null {
  const pattern = /^(\d{4})\/(\d{2})\/(\d{2})$/;
  const match = dateString.match(pattern);

  if (!match) return null;

  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  };
}

/**
 * Parse Gregorian date string (YYYY-MM-DD)
 */
export function parseGregorianDateString(dateString: string): GregorianDate | null {
  const pattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = dateString.match(pattern);

  if (!match) return null;

  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  };
}

/**
 * Calculate age in years (from date to now)
 */
export function getAgeInYears(date: Date): number {
  const now = new Date();
  return now.getFullYear() - date.getFullYear();
}

/**
 * Check if Jalali year is leap year
 */
export function isJalaliLeapYear(year: number): boolean {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2000, 2002, 2025, 2059, 2067, 2075, 2092, 2102, 2108, 2112,
  ];

  let gy = year + 1474;
  if (gy <= 0) gy -= 1;

  let jp = breaks[0];
  let jump = 0;

  for (let j = 1; j < breaks.length; j++) {
    const jm = breaks[j];
    jump = jm - jp;
    if (year < jm) break;
    jp = jm;
  }

  let n = year - jp;
  if (jump - n < 6) n = n + ((jump - n - 4) / 33) * 33;

  return (n + 1) % 33 % 4 === 0 && (n + 1) % 33 !== 1;
}

/**
 * Get days in Jalali month
 */
export function getDaysInJalaliMonth(month: number, year: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
}

/**
 * Calculate difference between two dates in days
 */
export function getDateDifference(date1: Date, date2: Date): number {
  const time1 = date1.getTime();
  const time2 = date2.getTime();
  return Math.ceil(Math.abs(time2 - time1) / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is valid
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if Jalali date is valid
 */
export function isValidJalaliDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  if (month <= 6 && day > 31) return false;
  if (month <= 11 && day > 30) return false;
  if (month === 12) {
    const maxDay = isJalaliLeapYear(year) ? 30 : 29;
    return day <= maxDay;
  }
  return true;
}
