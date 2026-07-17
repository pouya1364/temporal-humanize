import type { LocaleInput } from '../types.js';
import type { WallClockDate } from './calendar-fallback-en.js';
import {
  formatFallbackDateEnFallback,
  formatTimeEnFallback,
  formatWeekdayEnFallback,
} from './calendar-fallback-en.js';

export type { WallClockDate } from './calendar-fallback-en.js';

// Intl.DateTimeFormat is universally available in target runtimes, so this
// probe is primarily defensive — it keeps the same capability-probe
// convention used elsewhere in the package and gives the fallback path
// something real to stub in tests.
const HAS_DTF = typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function';

type FormatterKind = 'time' | 'weekday' | 'fallback-date';

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function localeKey(locale: LocaleInput | undefined): string {
  if (locale === undefined) return '';
  return Array.isArray(locale) ? locale.join(',') : (locale as string);
}

function getFormatter(
  locale: LocaleInput | undefined,
  kind: FormatterKind,
  style: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${localeKey(locale)}|${kind}|${style}`;
  const cached = formatterCache.get(key);
  if (cached) return cached;

  const localeArg = Array.isArray(locale) ? [...locale] : locale;
  const formatter = new Intl.DateTimeFormat(localeArg, options);
  formatterCache.set(key, formatter);
  return formatter;
}

// Pins the rendered wall-clock digits to the input's own fields regardless
// of the host's timezone: the fields are placed onto a UTC-based JS Date
// and every formatter below is constructed with timeZone: 'UTC', so the
// formatter reads back exactly the fields it was given.
function toUtcDate(date: WallClockDate): Date {
  return new Date(
    Date.UTC(date.year, date.month - 1, date.day, date.hour, date.minute, date.second),
  );
}

/**
 * Formats the wall-clock time portion of a calendar bucket (e.g.
 * "3:00 PM"), using `Intl.DateTimeFormat` when available and falling back
 * to a plain 12-hour renderer otherwise.
 *
 * @example
 * ```ts
 * import { formatTime } from './calendar-format.js';
 *
 * formatTime({ year: 2024, month: 6, day: 3, hour: 15, minute: 0, second: 0 }, undefined, 'short');
 * // "3:00 PM"
 * ```
 */
export function formatTime(
  date: WallClockDate,
  locale: LocaleInput | undefined,
  timeFormat: 'short' | 'medium' | 'long' | 'full',
): string {
  if (!HAS_DTF) return formatTimeEnFallback(date);

  const formatter = getFormatter(locale, 'time', timeFormat, {
    timeStyle: timeFormat,
    timeZone: 'UTC',
  });

  // timeStyle 'long'/'full' render a timeZoneName part ("UTC" / "Coordinated
  // Universal Time") because the formatter is pinned to UTC as a rendering
  // trick to read back the input's own wall-clock fields verbatim — that
  // part is dropped since it doesn't describe a real timezone here.
  return formatter
    .formatToParts(toUtcDate(date))
    .filter((part) => part.type !== 'timeZoneName')
    .map((part) => part.value)
    .join('')
    .trimEnd()
    // Newer ICU versions render a narrow no-break space (U+202F) before the
    // AM/PM marker instead of a plain space; normalize so output is stable
    // across Node/ICU versions.
    .replace(/[  ]/g, ' ');
}

/**
 * Formats the locale weekday name for a calendar bucket (e.g. "Monday"),
 * using `Intl.DateTimeFormat` when available and falling back to an
 * English-only weekday name otherwise.
 *
 * @example
 * ```ts
 * import { formatWeekday } from './calendar-format.js';
 *
 * formatWeekday({ year: 2024, month: 6, day: 3, hour: 0, minute: 0, second: 0 }, undefined);
 * // "Monday"
 * ```
 */
export function formatWeekday(date: WallClockDate, locale: LocaleInput | undefined): string {
  if (!HAS_DTF) return formatWeekdayEnFallback(date);

  const formatter = getFormatter(locale, 'weekday', 'long', {
    weekday: 'long',
    timeZone: 'UTC',
  });
  return formatter.format(toUtcDate(date));
}

/**
 * Formats a locale date string (`dateStyle: 'medium'`) for the `sameElse`
 * bucket, using `Intl.DateTimeFormat` when available and falling back to
 * an English-only date string otherwise.
 *
 * @example
 * ```ts
 * import { formatFallbackDate } from './calendar-format.js';
 *
 * formatFallbackDate({ year: 2024, month: 6, day: 3, hour: 0, minute: 0, second: 0 }, undefined);
 * // "Jun 3, 2024"
 * ```
 */
export function formatFallbackDate(date: WallClockDate, locale: LocaleInput | undefined): string {
  if (!HAS_DTF) return formatFallbackDateEnFallback(date);

  const formatter = getFormatter(locale, 'fallback-date', 'medium', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  });
  return formatter.format(toUtcDate(date));
}
