import type { RelativeTimeOptions, TemporalInput } from '../types.js';
import { formatRelative } from './relative-core.js';

/**
 * Formats a Temporal value relative to now (or `options.relativeTo`),
 * phrased from the perspective of looking back from the reference point.
 *
 * The direction (past vs future) is auto-detected from the sign of the
 * difference, so `fromNow` and `toNow` are behaviorally identical in v1 —
 * both produce "3 days ago" for past values and "in 3 days" for future ones.
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
 * import { fromNow } from 'temporal-humanize';
 *
 * const threeDaysAgo = Temporal.Now.instant().subtract({ hours: 72 });
 * fromNow(threeDaysAgo); // "3 days ago"
 * ```
 */
export function fromNow(value: TemporalInput, options?: RelativeTimeOptions): string {
  return formatRelative(value, options);
}
