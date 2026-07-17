import type { NowReference, TemporalInput } from '../types.js';

export type ResolvedNow =
  { kind: 'instant'; now: Temporal.Instant } | { kind: 'plain'; now: Temporal.PlainDateTime };

function isTzAware(value: TemporalInput | NowReference): boolean {
  return value instanceof Temporal.Instant || value instanceof Temporal.ZonedDateTime;
}

/**
 * Determines what "now" means for a given input, and produces it as either
 * an Instant (for tz-aware input) or a PlainDateTime (for wall-clock input).
 *
 * `Temporal.Now.instant()` / `Temporal.Now.plainDateTimeISO()` are called
 * only here, and only when `relativeTo` is omitted — this is the single
 * place in the package that touches the ambient clock.
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { resolveNow } from './resolve-now.js';
 *
 * resolveNow(Temporal.Now.instant()); // { kind: 'instant', now: Temporal.Instant }
 * ```
 *
 * @throws {RangeError} if `relativeTo` is tz-aware while `input` is a
 * PlainDateTime, or vice versa.
 */
export function resolveNow(input: TemporalInput, relativeTo?: NowReference): ResolvedNow {
  const inputIsTzAware = isTzAware(input);

  if (relativeTo !== undefined) {
    const relativeToIsTzAware = isTzAware(relativeTo);
    if (inputIsTzAware !== relativeToIsTzAware) {
      throw new RangeError(
        'relativeTo must match the timezone-awareness of the input value: ' +
          'both must be tz-aware (Instant/ZonedDateTime) or both must be PlainDateTime',
      );
    }

    if (inputIsTzAware) {
      const now =
        relativeTo instanceof Temporal.ZonedDateTime ? relativeTo.toInstant() : relativeTo;
      return { kind: 'instant', now: now as Temporal.Instant };
    }

    return { kind: 'plain', now: relativeTo as Temporal.PlainDateTime };
  }

  if (inputIsTzAware) {
    return { kind: 'instant', now: Temporal.Now.instant() };
  }

  return { kind: 'plain', now: Temporal.Now.plainDateTimeISO() };
}
