import type { LocaleInput } from '../types.js';
import { calendarDayWordEnFallback } from './calendar-fallback-en.js';

const HAS_RTF = typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat === 'function';

const formatterCache = new Map<string, Intl.RelativeTimeFormat>();

function localeKey(locale: LocaleInput | undefined): string {
  if (locale === undefined) return '';
  return Array.isArray(locale) ? locale.join(',') : (locale as string);
}

function getFormatter(locale: LocaleInput | undefined): Intl.RelativeTimeFormat {
  const key = localeKey(locale);
  const cached = formatterCache.get(key);
  if (cached) return cached;

  const localeArg = Array.isArray(locale) ? [...locale] : locale;
  const formatter = new Intl.RelativeTimeFormat(localeArg, { numeric: 'auto' });
  formatterCache.set(key, formatter);
  return formatter;
}

// Capitalizes the first grapheme for standalone, sentence-initial use
// (e.g. "Yesterday at 3:00 PM"), operating on Array.from graphemes rather
// than string indices so astral-plane leading characters aren't split.
function capitalizeLeading(text: string, locale: LocaleInput | undefined): string {
  const graphemes = Array.from(text);
  const first = graphemes[0];
  if (first === undefined) return text;

  const localeArg = Array.isArray(locale) ? [...locale] : locale;
  graphemes[0] = first.toLocaleUpperCase(localeArg);
  return graphemes.join('');
}

export interface CalendarDayWordOptions {
  locale?: LocaleInput;
}

/**
 * Renders the locale word for "today"/"yesterday"/"tomorrow" from a signed
 * day difference of 0, -1, or 1, using `Intl.RelativeTimeFormat` with
 * `numeric: 'auto'` so engines that support calendar-style wording produce
 * it, then capitalizing the leading character for sentence-initial use.
 * Falls back to literal English words when `Intl.RelativeTimeFormat` isn't
 * available in the runtime.
 *
 * @example
 * ```ts
 * import { calendarDayWord } from './calendar-word.js';
 *
 * calendarDayWord(0, {}); // "Today"
 * calendarDayWord(-1, { locale: 'es' }); // "Ayer"
 * ```
 */
export function calendarDayWord(dayDiff: -1 | 0 | 1, opts: CalendarDayWordOptions): string {
  if (!HAS_RTF) return calendarDayWordEnFallback(dayDiff);

  const formatter = getFormatter(opts.locale);
  const text = formatter.format(dayDiff, 'day');
  return capitalizeLeading(text, opts.locale);
}
