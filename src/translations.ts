import {
  clearRegistry,
  deleteLocale,
  registeredLocaleKeys,
  setLocale,
} from './internal/locale-registry.js';
import type { LocaleTranslations } from './types.js';

/**
 * Registers glue-word translations for a locale, covering exactly the
 * strings this package renders without going through Intl: the zero-delta
 * "now" (`fromNow`/`toNow`), the "at"/"Last"-equivalent structural wording
 * in `calendar()`, and short-style duration unit abbreviations/joins in
 * `humanizeDuration()`. Everything else — day words, weekday names, times,
 * numbers, and long-style duration wording — is already localized through
 * `Intl` and isn't affected by this registry.
 *
 * Calling this more than once for the same `locale` merges with whatever
 * was registered previously rather than replacing it, so fields can be
 * supplied incrementally across multiple calls without clobbering earlier
 * ones.
 *
 * @example
 * ```ts
 * import { registerLocale } from 'temporal-humanize';
 *
 * registerLocale('zz', {
 *   now: '<now>',
 *   calendarDay: (dayWord, time) => `${dayWord} <at> ${time}`,
 *   durationShortUnits: { hours: '<h>' },
 * });
 * ```
 */
export function registerLocale(locale: string, translations: Partial<LocaleTranslations>): void {
  setLocale(locale, translations);
}

/**
 * Removes every translation previously registered for `locale`. Locales not
 * currently registered are a no-op.
 *
 * @example
 * ```ts
 * import { unregisterLocale } from 'temporal-humanize';
 *
 * unregisterLocale('zz');
 * ```
 */
export function unregisterLocale(locale: string): void {
  deleteLocale(locale);
}

/**
 * Removes every registered locale translation, restoring English defaults
 * everywhere. Mainly useful for test teardown.
 *
 * @example
 * ```ts
 * import { clearLocales } from 'temporal-humanize';
 *
 * clearLocales();
 * ```
 */
export function clearLocales(): void {
  clearRegistry();
}

/**
 * Returns the locale keys currently registered, in no particular order.
 *
 * @example
 * ```ts
 * import { getRegisteredLocales, registerLocale } from 'temporal-humanize';
 *
 * registerLocale('zz', { now: '<now>' });
 * getRegisteredLocales(); // ["zz"]
 * ```
 */
export function getRegisteredLocales(): string[] {
  return registeredLocaleKeys();
}
