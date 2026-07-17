import type { LocaleInput } from '../types.js';
import { formatEnFallback } from './fallback-en.js';
import { resolveField } from './locale-registry.js';
import type { RelativeUnit } from './unit-select.js';

const HAS_RTF = typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat === 'function';

const formatterCache = new Map<string, Intl.RelativeTimeFormat>();

function localeKey(locale: LocaleInput | undefined): string {
  if (locale === undefined) return '';
  return Array.isArray(locale) ? locale.join(',') : (locale as string);
}

function getFormatter(
  locale: LocaleInput | undefined,
  style: Intl.RelativeTimeFormatStyle,
  numeric: Intl.RelativeTimeFormatNumeric,
): Intl.RelativeTimeFormat {
  const key = `${localeKey(locale)}|${style}|${numeric}`;
  const cached = formatterCache.get(key);
  if (cached) return cached;

  const localeArg = Array.isArray(locale) ? [...locale] : locale;
  const formatter = new Intl.RelativeTimeFormat(localeArg, { style, numeric });
  formatterCache.set(key, formatter);
  return formatter;
}

export interface FormatUnitOptions {
  locale?: LocaleInput;
  style?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
}

/**
 * Formats a signed value/unit pair using `Intl.RelativeTimeFormat` when
 * available, falling back to English-only phrasing otherwise. A value of
 * 0 always renders as "now" (or its registered translation, see
 * `registerLocale`) rather than relying on RTF's zero-format wording,
 * which varies across engines.
 *
 * @example
 * ```ts
 * import { formatUnit } from './relative-time-format.js';
 *
 * formatUnit(-3, 'day', {}); // "3 days ago"
 * ```
 */
export function formatUnit(value: number, unit: RelativeUnit, opts: FormatUnitOptions): string {
  if (value === 0) return resolveField(opts.locale, 'now', 'now');

  if (!HAS_RTF) return formatEnFallback(value, unit);

  const style = opts.style ?? 'long';
  // 'always' avoids calendar-style wording ("tomorrow", "yesterday") that
  // 'auto' produces for +/-1 units — calendar-relative phrasing is a
  // separate, not-yet-implemented feature, not this package's default.
  const numeric = opts.numeric ?? 'always';
  const formatter = getFormatter(opts.locale, style, numeric);
  return formatter.format(value, unit);
}
