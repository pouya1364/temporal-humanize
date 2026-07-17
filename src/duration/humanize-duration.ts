import type { HumanizeDurationOptions } from '../types.js';
import { formatDuration } from './duration-core.js';

/**
 * Formats a Temporal.Duration as a human-readable string, balancing it
 * into a small number of units (three by default) and rounding the last
 * one shown.
 *
 * A negative duration is rendered with a single leading "-" on the whole
 * string rather than on each unit, e.g. "-3 hours, 15 minutes".
 *
 * By default the duration is balanced up to the largest unit already
 * present in its fields (or 'hours' if none of days/weeks/months/years is
 * populated); pass `largestUnit` to force balancing to a specific unit.
 * `maxUnits: Infinity` disables capping entirely, rendering full precision
 * down to milliseconds.
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { humanizeDuration } from 'temporal-humanize';
 *
 * humanizeDuration(Temporal.Duration.from({ days: 1, hours: 26, minutes: 5, seconds: 30 }));
 * // "2 days, 2 hours, 6 minutes"
 *
 * humanizeDuration(Temporal.Duration.from({ hours: 3 }), { style: 'short' });
 * // "3h"
 * ```
 */
export function humanizeDuration(
  duration: Temporal.Duration,
  options?: HumanizeDurationOptions,
): string {
  return formatDuration(duration, options);
}
