import type { RelativeTimeOptions, TemporalInput } from '../types.js';
import { formatRelative } from './relative-core.js';

/**
 * Formats a Temporal value relative to now (or `options.relativeTo`),
 * phrased from the perspective of looking forward toward the value.
 *
 * The direction (past vs future) is auto-detected from the sign of the
 * difference, so `toNow` and `fromNow` are behaviorally identical in v1 —
 * both produce "in 3 days" for future values and "3 days ago" for past ones.
 * They're kept as separate exports so call sites can express intent even
 * though the output doesn't currently diverge.
 *
 * `Temporal.PlainDateTime` inputs are compared as wall-clock time with no
 * timezone and no DST awareness. `Temporal.Instant` and
 * `Temporal.ZonedDateTime` inputs are compared as absolute instants, so
 * results stay correct across DST transitions.
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { toNow } from 'temporal-humanize';
 *
 * const inThreeDays = Temporal.Now.instant().add({ hours: 72 });
 * toNow(inThreeDays); // "in 3 days"
 * ```
 */
export function toNow(value: TemporalInput, options?: RelativeTimeOptions): string {
  return formatRelative(value, options);
}
