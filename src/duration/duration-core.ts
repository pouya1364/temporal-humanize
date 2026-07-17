import { balanceDuration } from '../internal/duration-balance.js';
import { formatDurationParts } from '../internal/duration-format.js';
import type { HumanizeDurationOptions } from '../types.js';

const DEFAULT_MAX_UNITS = 3;

/**
 * Shared implementation behind `humanizeDuration`: extracts the sign,
 * balances and caps the magnitude into a small set of units, rounds the
 * last shown unit, and formats the result — reapplying a leading "-" for
 * negative durations.
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { formatDuration } from './duration-core.js';
 *
 * formatDuration(Temporal.Duration.from({ hours: -3 })); // "-3 hours"
 * ```
 */
export function formatDuration(
  duration: Temporal.Duration,
  options: HumanizeDurationOptions = {},
): string {
  const maxUnits = options.maxUnits ?? DEFAULT_MAX_UNITS;

  const { sign, parts } = balanceDuration(duration, {
    largestUnit: options.largestUnit,
    maxUnits,
  });

  const formatted = formatDurationParts(parts, {
    locale: options.locale,
    style: options.style,
  });

  return sign < 0 ? `-${formatted}` : formatted;
}
