import type { WallClockDate } from '../internal/calendar-fallback-en.js';
import { formatFallbackDate, formatTime, formatWeekday } from '../internal/calendar-format.js';
import { calendarDayWord } from '../internal/calendar-word.js';
import { resolveField } from '../internal/locale-registry.js';
import { resolveCalendarNow } from '../internal/resolve-calendar-now.js';
import type { CalendarInput, CalendarOptions } from '../types.js';

const DEFAULT_THRESHOLD_DAYS = 6;

function toWallClockDate(value: CalendarInput): WallClockDate {
  return {
    year: value.year,
    month: value.month,
    day: value.day,
    hour: value.hour,
    minute: value.minute,
    second: value.second,
  };
}

/**
 * Shared implementation behind `calendar`: resolves the reference point,
 * reduces both sides to a signed day difference computed as pure calendar
 * arithmetic (so DST transitions never shift the day boundary), and
 * renders the matching bucket.
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { formatCalendar } from './calendar-core.js';
 *
 * const relativeTo = Temporal.ZonedDateTime.from('2024-06-03T09:00:00-04:00[America/New_York]');
 * const value = Temporal.ZonedDateTime.from('2024-06-03T15:00:00-04:00[America/New_York]');
 * formatCalendar(value, { relativeTo }); // "Today at 3:00 PM"
 * ```
 */
export function formatCalendar(value: CalendarInput, options: CalendarOptions = {}): string {
  const resolved = resolveCalendarNow(value, options.relativeTo);

  const valueDate = value.toPlainDate();
  const nowDate =
    value instanceof Temporal.ZonedDateTime
      ? (resolved.now as Temporal.ZonedDateTime).withTimeZone(value.timeZoneId).toPlainDate()
      : (resolved.now as Temporal.PlainDateTime).toPlainDate();

  const dayDiff = nowDate.until(valueDate, { largestUnit: 'day' }).days;
  const threshold = options.thresholdDays ?? DEFAULT_THRESHOLD_DAYS;

  const wallClock = toWallClockDate(value);
  const timeFormat = options.timeFormat ?? 'short';
  const time = formatTime(wallClock, options.locale, timeFormat);

  if (dayDiff === 0 || dayDiff === -1 || dayDiff === 1) {
    const dayWord = calendarDayWord(dayDiff, { locale: options.locale });
    return resolveField(
      options.locale,
      'calendarDay',
      (w: string, t: string) => `${w} at ${t}`,
    )(dayWord, time);
  }

  if (dayDiff >= -threshold && dayDiff <= -2) {
    const weekday = formatWeekday(wallClock, options.locale);
    return resolveField(
      options.locale,
      'calendarLastWeekday',
      (w: string, t: string) => `Last ${w} at ${t}`,
    )(weekday, time);
  }

  if (dayDiff >= 2 && dayDiff <= threshold) {
    const weekday = formatWeekday(wallClock, options.locale);
    return resolveField(
      options.locale,
      'calendarWeekday',
      (w: string, t: string) => `${w} at ${t}`,
    )(weekday, time);
  }

  return formatFallbackDate(wallClock, options.locale);
}
