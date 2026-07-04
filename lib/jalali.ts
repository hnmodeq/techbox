/**
 * Jalali (Solar Hijri) Calendar Converter
 * تبدیل بین میلادی و شمسی
 */

import type { JalaliDate, GregorianDate } from '@/types/timeline';

/**
 * Convert Gregorian date to Jalali (Solar Hijri)
 * Reference: https://en.wikipedia.org/wiki/Jalali_calendar
 */
export function gregorianToJalali(date: Date): JalaliDate {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1; // JS months are 0-indexed
  const gd = date.getDate();

  let jy: number, jm: number, jd: number;

  const g_d_n = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400) + gd;

  let j_d_n = g_d_n - 79;

  let j_np = Math.floor(j_d_n / 12053);
  j_d_n %= 12053;

  jy = 979 + 33 * j_np + 4 * Math.floor(j_d_n / 1461);

  j_d_n %= 1461;

  if (j_d_n >= 366) {
    jy += Math.floor((j_d_n - 1) / 365);
    j_d_n = (j_d_n - 1) % 365;
  }

  if (j_d_n < 186) {
    jm = 1 + Math.floor(j_d_n / 31);
    jd = 1 + (j_d_n % 31);
  } else {
    jm = 7 + Math.floor((j_d_n - 186) / 30);
    jd = 1 + ((j_d_n - 186) % 30);
  }

  return { year: jy, month: jm, day: jd };
}

/**
 * Convert Jalali (Solar Hijri) date to Gregorian
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  let gy: number, gm: number, gd: number;

  const j_d_n = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

  let g_d_n = j_d_n + 79;

  gy = 400 * Math.floor(g_d_n / 146097);
  g_d_n %= 146097;

  let leap = true;
  if (g_d_n >= 36525) {
    g_d_n--;
    gy += 100 * Math.floor(g_d_n / 36524);
    g_d_n %= 36524;
    if (g_d_n >= 365) g_d_n++;
    leap = false;
  }

  gy += 4 * Math.floor(g_d_n / 1461);
  g_d_n %= 1461;

  if (leap) {
    if (g_d_n >= 366) {
      g_d_n--;
      gy += Math.floor(g_d_n / 365);
      g_d_n = g_d_n % 365;
    }
  }

  const isLeapYear = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  gm = 0;
  for (let i = 0; i < daysInMonth.length; i++) {
    if (g_d_n < daysInMonth[i]) {
      gm = i + 1;
      break;
    }
    g_d_n -= daysInMonth[i];
  }

  gd = g_d_n + 1;

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
 * Example: "۱۴۰۳/۱۰/۲۵ (جمعه)"
 */
export function getJalaliDateStringPersian(date: Date | string): string {
  const gregorianDate = typeof date === 'string' ? new Date(date) : date;
  const jalali = gregorianToJalali(gregorianDate);
  const formatted = formatJalaliDate(jalali.year, jalali.month, jalali.day);
  const dayName = getPersianDayName(gregorianDate.getDay());
  const monthName = getPersianMonthName(jalali.month);

  return `${formatted} (${dayName}) ${monthName}`;
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

  const leap = (n + 1) % 33 % 4 === 0 && (n + 1) % 33 !== 1;

  return leap;
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
  const diffTime = Math.abs(time2 - time1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
