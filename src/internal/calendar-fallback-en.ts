export interface WallClockDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

function toUtcDate(date: WallClockDate): Date {
  return new Date(
    Date.UTC(date.year, date.month - 1, date.day, date.hour, date.minute, date.second),
  );
}

/**
 * English-only day word used when `Intl.RelativeTimeFormat` isn't
 * available in the runtime.
 *
 * @example
 * ```ts
 * import { calendarDayWordEnFallback } from './calendar-fallback-en.js';
 *
 * calendarDayWordEnFallback(0); // "Today"
 * ```
 */
export function calendarDayWordEnFallback(dayDiff: -1 | 0 | 1): string {
  if (dayDiff === 0) return 'Today';
  if (dayDiff === -1) return 'Yesterday';
  return 'Tomorrow';
}

/**
 * English-only weekday name used when `Intl.DateTimeFormat` isn't
 * available in the runtime.
 *
 * @example
 * ```ts
 * import { formatWeekdayEnFallback } from './calendar-fallback-en.js';
 *
 * formatWeekdayEnFallback({ year: 2024, month: 6, day: 3, hour: 0, minute: 0, second: 0 });
 * // "Monday"
 * ```
 */
export function formatWeekdayEnFallback(date: WallClockDate): string {
  return WEEKDAY_NAMES[toUtcDate(date).getUTCDay()] as string;
}

/**
 * English-only 12-hour time renderer used when `Intl.DateTimeFormat` isn't
 * available in the runtime.
 *
 * @example
 * ```ts
 * import { formatTimeEnFallback } from './calendar-fallback-en.js';
 *
 * formatTimeEnFallback({ year: 2024, month: 6, day: 3, hour: 15, minute: 0, second: 0 });
 * // "3:00 PM"
 * ```
 */
export function formatTimeEnFallback(date: WallClockDate): string {
  const period = date.hour >= 12 ? 'PM' : 'AM';
  const hour12 = date.hour % 12 === 0 ? 12 : date.hour % 12;
  const minute = String(date.minute).padStart(2, '0');
  return `${hour12}:${minute} ${period}`;
}

/**
 * English-only fallback date string used when `Intl.DateTimeFormat` isn't
 * available in the runtime.
 *
 * @example
 * ```ts
 * import { formatFallbackDateEnFallback } from './calendar-fallback-en.js';
 *
 * formatFallbackDateEnFallback({ year: 2024, month: 6, day: 3, hour: 0, minute: 0, second: 0 });
 * // "Jun 3, 2024"
 * ```
 */
export function formatFallbackDateEnFallback(date: WallClockDate): string {
  return `${MONTH_NAMES[date.month - 1]} ${date.day}, ${date.year}`;
}
