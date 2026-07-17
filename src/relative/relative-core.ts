import { formatUnit } from '../internal/relative-time-format.js';
import { resolveNow } from '../internal/resolve-now.js';
import { instantDeltaNanoseconds, plainDeltaSeconds, toInstant } from '../internal/to-instant.js';
import { selectUnit } from '../internal/unit-select.js';
import type { RelativeTimeOptions, TemporalInput } from '../types.js';

/**
 * Shared implementation behind `fromNow` and `toNow`: resolves the
 * reference point, computes a signed delta, selects a unit, and formats it.
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { formatRelative } from './relative-core.js';
 *
 * formatRelative(Temporal.Now.instant().subtract({ hours: 2 })); // "2 hours ago"
 * ```
 */
export function formatRelative(value: TemporalInput, options: RelativeTimeOptions = {}): string {
  const resolved = resolveNow(value, options.relativeTo);

  let deltaSeconds: number;
  if (resolved.kind === 'instant') {
    const target = toInstant(value as Temporal.Instant | Temporal.ZonedDateTime);
    const deltaNs = instantDeltaNanoseconds(resolved.now, target);
    deltaSeconds = Number(deltaNs) / 1e9;
  } else {
    deltaSeconds = plainDeltaSeconds(resolved.now, value as Temporal.PlainDateTime);
  }

  const { unit, value: magnitude } = selectUnit(deltaSeconds);
  const signedValue = magnitude === 0 ? 0 : Math.sign(deltaSeconds) * magnitude;

  return formatUnit(signedValue, unit, {
    locale: options.locale,
    style: options.style,
    numeric: options.numeric,
  });
}
