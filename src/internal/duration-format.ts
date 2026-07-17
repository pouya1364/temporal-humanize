import type { LocaleInput } from '../types.js';
import type { DurationPart } from './duration-balance.js';
import { formatDurationEnFallback } from './duration-fallback-en.js';
import { resolveField } from './locale-registry.js';

// Intl.DurationFormat isn't part of TypeScript's lib.es* declarations yet
// (as of TS 5.6), so this is a narrow local type covering only the surface
// this file uses: constructing with a locale/style and calling .format on
// a plain object of unit fields.
interface DurationFormatLike {
  format(parts: Record<string, number>): string;
}

type DurationFormatConstructor = new (
  locale: string | readonly string[] | undefined,
  options: { style: 'long' | 'short' | 'narrow' },
) => DurationFormatLike;

const HAS_DF =
  typeof Intl !== 'undefined' &&
  typeof (Intl as Record<string, unknown>).DurationFormat === 'function';

const formatterCache = new Map<string, DurationFormatLike>();

const SHORT_UNIT_ABBREVIATIONS: Record<DurationPart['unit'], string> = {
  years: 'y',
  months: 'mo',
  weeks: 'w',
  days: 'd',
  hours: 'h',
  minutes: 'm',
  seconds: 's',
  milliseconds: 'ms',
};

function localeKey(locale: LocaleInput | undefined): string {
  if (locale === undefined) return '';
  return Array.isArray(locale) ? locale.join(',') : (locale as string);
}

function getDurationFormatter(
  locale: LocaleInput | undefined,
  style: 'long' | 'short',
): DurationFormatLike {
  const key = `${localeKey(locale)}|${style}`;
  const cached = formatterCache.get(key);
  if (cached) return cached;

  const Ctor = (Intl as unknown as { DurationFormat: DurationFormatConstructor }).DurationFormat;
  const formatter = new Ctor(locale, { style });
  formatterCache.set(key, formatter);
  return formatter;
}

function toPlainFields(parts: readonly DurationPart[]): Record<string, number> {
  const fields: Record<string, number> = {};
  for (const { unit, value } of parts) {
    fields[unit] = value;
  }
  return fields;
}

function formatShort(parts: readonly DurationPart[], locale: LocaleInput | undefined): string {
  const localeArg = Array.isArray(locale) ? [...locale] : locale;
  const numberFormat = new Intl.NumberFormat(localeArg);
  const registeredUnits = resolveField(locale, 'durationShortUnits', {});

  const rendered = parts.map(({ unit, value }) => {
    const abbreviation = registeredUnits[unit] ?? SHORT_UNIT_ABBREVIATIONS[unit];
    return `${numberFormat.format(value)}${abbreviation}`;
  });

  return resolveField(locale, 'durationShortJoin', (joinParts: readonly string[]) =>
    joinParts.join(' '),
  )(rendered);
}

export interface FormatDurationPartsOptions {
  locale?: LocaleInput;
  style?: 'long' | 'short';
}

/**
 * Renders a list of balanced duration parts as a string, using
 * `Intl.DurationFormat` for long style when available, a custom compact
 * renderer for short style, and English-only phrasing as a fallback when
 * `Intl.DurationFormat` isn't supported by the runtime.
 *
 * @example
 * ```ts
 * import { formatDurationParts } from './duration-format.js';
 *
 * formatDurationParts([{ unit: 'hours', value: 3 }], { style: 'short' }); // "3h"
 * ```
 */
export function formatDurationParts(
  parts: readonly DurationPart[],
  opts: FormatDurationPartsOptions,
): string {
  const style = opts.style ?? 'long';
  const isZero = parts.length === 1 && parts[0]?.value === 0;

  if (style === 'short') return formatShort(parts, opts.locale);

  // Intl.DurationFormat renders an all-zero field set as an empty string
  // rather than "0 <unit>", so the zero case is handled directly instead
  // of being passed through.
  if (isZero) return formatDurationEnFallback(parts);

  if (!HAS_DF) return formatDurationEnFallback(parts);

  const formatter = getDurationFormatter(opts.locale, style);
  return formatter.format(toPlainFields(parts));
}
