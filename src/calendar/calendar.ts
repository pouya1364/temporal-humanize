import type { CalendarInput, CalendarOptions } from '../types.js';
import { formatCalendar } from './calendar-core.js';

/**
 * Formats a Temporal value as a calendar-relative string — "Today at
 * 3:00 PM", "Yesterday at 9:15 AM", "Last Monday at 3:00 PM", "Wednesday
 * at 3:00 PM" — falling back to a locale date string (e.g. "Jun 3, 2024")
 * once the value is more than `thresholdDays` (6 by default) away from
 * now.
 *
 * `Temporal.ZonedDateTime` input treats "today" as today in the value's
 * own timezone: `now` is converted into that zone before the day
 * difference is computed. `Temporal.PlainDateTime` input has no timezone
 * at all, so "today" is whatever day `now` (or `options.relativeTo`)
 * happens to be on as wall-clock time, with no zone conversion.
 *
 * The day boundary itself is computed as pure calendar-date arithmetic
 * (`PlainDate.until`), so DST transitions never shift which bucket a
 * `ZonedDateTime` value falls into.
 *
 * The structural words "at" and "Last" render in English by default — only
 * the day/weekday word and the time portion are localized through Intl.
 * This package ships no built-in non-English glue words for these, but
 * they're overridable per locale via `registerLocale` (see the "Adding a
 * translation" section in the README).
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { calendar } from 'temporal-humanize';
 *
 * const now = Temporal.Now.zonedDateTimeISO();
 * calendar(now); // "Today at 3:00 PM" (time varies)
 * calendar(now.subtract({ days: 1 })); // "Yesterday at 3:00 PM"
 * ```
 */
export function calendar(value: CalendarInput, options?: CalendarOptions): string {
  return formatCalendar(value, options);
}
