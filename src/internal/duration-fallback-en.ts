import type { DurationPart } from './duration-balance.js';

const UNIT_NAMES: Record<DurationPart['unit'], string> = {
  years: 'year',
  months: 'month',
  weeks: 'week',
  days: 'day',
  hours: 'hour',
  minutes: 'minute',
  seconds: 'second',
  milliseconds: 'millisecond',
};

/**
 * English-only long-style duration phrasing used when
 * `Intl.DurationFormat` isn't available in the runtime. Parts are joined
 * with ", " and each unit is pluralized based on its value.
 *
 * @example
 * ```ts
 * import { formatDurationEnFallback } from './duration-fallback-en.js';
 *
 * formatDurationEnFallback([{ unit: 'hours', value: 3 }]); // "3 hours"
 * ```
 */
export function formatDurationEnFallback(parts: readonly DurationPart[]): string {
  return parts
    .map(({ unit, value }) => {
      const name = value === 1 ? UNIT_NAMES[unit] : `${UNIT_NAMES[unit]}s`;
      return `${value} ${name}`;
    })
    .join(', ');
}
