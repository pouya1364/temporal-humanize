/**
 * Normalizes a tz-aware Temporal value down to an absolute Instant.
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { toInstant } from './to-instant.js';
 *
 * toInstant(Temporal.Now.zonedDateTimeISO()); // Temporal.Instant
 * ```
 */
export function toInstant(value: Temporal.Instant | Temporal.ZonedDateTime): Temporal.Instant {
  return value instanceof Temporal.ZonedDateTime ? value.toInstant() : value;
}

/**
 * Signed delta in nanoseconds between two instants. Positive when `target`
 * is after `now` (future), negative when before (past).
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { instantDeltaNanoseconds } from './to-instant.js';
 *
 * const now = Temporal.Now.instant();
 * instantDeltaNanoseconds(now, now.add({ seconds: 5 })); // 5000000000n
 * ```
 */
export function instantDeltaNanoseconds(now: Temporal.Instant, target: Temporal.Instant): bigint {
  return target.epochNanoseconds - now.epochNanoseconds;
}

/**
 * Seconds-based delta between two wall-clock PlainDateTime values.
 * Uses largestUnit: 'seconds' so the duration never carries calendar
 * month/year components, which would force ambiguous balancing rules.
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { plainDeltaSeconds } from './to-instant.js';
 *
 * const now = Temporal.Now.plainDateTimeISO();
 * plainDeltaSeconds(now, now.add({ minutes: 5 })); // 300
 * ```
 */
export function plainDeltaSeconds(
  now: Temporal.PlainDateTime,
  target: Temporal.PlainDateTime,
): number {
  const duration = now.until(target, { largestUnit: 'seconds' });
  return duration.total({ unit: 'seconds' });
}
