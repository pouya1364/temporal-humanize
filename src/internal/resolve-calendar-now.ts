import type { CalendarInput, CalendarNowReference } from '../types.js';

export type ResolvedCalendarNow =
  { kind: 'zoned'; now: Temporal.ZonedDateTime } | { kind: 'plain'; now: Temporal.PlainDateTime };

/**
 * Determines what "now" means for a given calendar input, and produces it
 * as either a ZonedDateTime (for tz-aware input) or a PlainDateTime (for
 * wall-clock input).
 *
 * `Temporal.Now.zonedDateTimeISO()` / `Temporal.Now.plainDateTimeISO()` are
 * called only here, and only when `relativeTo` is omitted — this is the
 * only calendar code that touches the ambient clock.
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { resolveCalendarNow } from './resolve-calendar-now.js';
 *
 * resolveCalendarNow(Temporal.Now.zonedDateTimeISO()); // { kind: 'zoned', now: Temporal.ZonedDateTime }
 * ```
 *
 * @throws {RangeError} if `relativeTo` is a ZonedDateTime while `input` is
 * a PlainDateTime, or vice versa.
 */
export function resolveCalendarNow(
  input: CalendarInput,
  relativeTo?: CalendarNowReference,
): ResolvedCalendarNow {
  const inputIsZoned = input instanceof Temporal.ZonedDateTime;

  if (relativeTo !== undefined) {
    const relativeToIsZoned = relativeTo instanceof Temporal.ZonedDateTime;
    if (inputIsZoned !== relativeToIsZoned) {
      throw new RangeError(
        'relativeTo must match the timezone-awareness of the input value: ' +
          'both must be ZonedDateTime or both must be PlainDateTime',
      );
    }

    if (inputIsZoned) {
      return { kind: 'zoned', now: relativeTo as Temporal.ZonedDateTime };
    }

    return { kind: 'plain', now: relativeTo as Temporal.PlainDateTime };
  }

  if (inputIsZoned) {
    return { kind: 'zoned', now: Temporal.Now.zonedDateTimeISO() };
  }

  return { kind: 'plain', now: Temporal.Now.plainDateTimeISO() };
}
