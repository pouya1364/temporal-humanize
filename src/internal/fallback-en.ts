import type { RelativeUnit } from './unit-select.js';

const UNIT_NAMES: Record<RelativeUnit, string> = {
  second: 'second',
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
};

/**
 * English-only relative phrasing used when `Intl.RelativeTimeFormat` isn't
 * available in the runtime.
 *
 * @example
 * ```ts
 * import { formatEnFallback } from './fallback-en.js';
 *
 * formatEnFallback(-3, 'day'); // "3 days ago"
 * ```
 */
export function formatEnFallback(value: number, unit: RelativeUnit): string {
  if (value === 0) return 'now';

  const abs = Math.abs(value);
  const name = abs === 1 ? UNIT_NAMES[unit] : `${UNIT_NAMES[unit]}s`;

  return value < 0 ? `${abs} ${name} ago` : `in ${abs} ${name}`;
}
