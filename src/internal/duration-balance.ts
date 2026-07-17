import type { DurationUnit } from '../types.js';

export type LadderUnit = DurationUnit | 'milliseconds';

export interface DurationPart {
  unit: LadderUnit;
  value: number;
}

export interface BalancedDuration {
  sign: -1 | 0 | 1;
  parts: DurationPart[];
}

export interface BalanceOptions {
  largestUnit?: DurationUnit;
  maxUnits: number;
}

const LADDER: readonly LadderUnit[] = [
  'years',
  'months',
  'weeks',
  'days',
  'hours',
  'minutes',
  'seconds',
  'milliseconds',
];

// Same fixed-ratio conversions used by unit-select.ts's threshold ladder,
// expressed in nanoseconds so weeks/months/years can be balanced without a
// `relativeTo` reference point. Calendar-accurate balancing of those units
// requires a real date and is out of scope here — this is an approximation,
// same as day.js/moment's humanize duration output.
const RATIO_NS: Record<LadderUnit, bigint> = {
  years: 31557600000000000n,
  months: 2629800000000000n,
  weeks: 604800000000000n,
  days: 86400000000000n,
  hours: 3600000000000n,
  minutes: 60000000000n,
  seconds: 1000000000n,
  milliseconds: 1000000n,
};

function ladderIndex(unit: LadderUnit): number {
  return LADDER.indexOf(unit);
}

function totalNanoseconds(duration: Temporal.Duration): bigint {
  return (
    BigInt(duration.years) * RATIO_NS.years +
    BigInt(duration.months) * RATIO_NS.months +
    BigInt(duration.weeks) * RATIO_NS.weeks +
    BigInt(duration.days) * RATIO_NS.days +
    BigInt(duration.hours) * RATIO_NS.hours +
    BigInt(duration.minutes) * RATIO_NS.minutes +
    BigInt(duration.seconds) * RATIO_NS.seconds +
    BigInt(duration.milliseconds) * RATIO_NS.milliseconds +
    BigInt(duration.microseconds) * 1000n +
    BigInt(duration.nanoseconds)
  );
}

function ladderFromNanoseconds(
  totalNs: bigint,
  largestUnit: LadderUnit,
): Record<LadderUnit, number> {
  const fields = {} as Record<LadderUnit, number>;
  let remaining = totalNs;
  let started = false;

  for (const unit of LADDER) {
    if (!started) {
      if (unit === largestUnit) {
        started = true;
      } else {
        fields[unit] = 0;
        continue;
      }
    }
    const ratio = RATIO_NS[unit];
    const value = remaining / ratio;
    fields[unit] = Number(value);
    remaining -= value * ratio;
  }

  return fields;
}

function roundNanoseconds(totalNs: bigint, unitNs: bigint): bigint {
  const remainder = totalNs % unitNs;
  const rounded = totalNs - remainder;
  return remainder * 2n >= unitNs ? rounded + unitNs : rounded;
}

function fieldsFromTemporalDuration(duration: Temporal.Duration): Record<LadderUnit, number> {
  return {
    years: duration.years,
    months: duration.months,
    weeks: duration.weeks,
    days: duration.days,
    hours: duration.hours,
    minutes: duration.minutes,
    seconds: duration.seconds,
    milliseconds: duration.milliseconds,
  };
}

/**
 * Resolves the effective largest unit when `options.largestUnit` is
 * omitted: balancing defaults to 'hours' unless the raw (unbalanced)
 * duration already carries a non-zero days/weeks/months/years field, in
 * which case the largest such populated field wins, following the ladder
 * years > months > weeks > days > hours.
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { resolveEffectiveLargestUnit } from './duration-balance.js';
 *
 * resolveEffectiveLargestUnit(Temporal.Duration.from({ hours: 3 })); // 'hours'
 * resolveEffectiveLargestUnit(Temporal.Duration.from({ days: 2, hours: 3 })); // 'days'
 * ```
 */
export function resolveEffectiveLargestUnit(abs: Temporal.Duration): DurationUnit {
  if (abs.years !== 0) return 'years';
  if (abs.months !== 0) return 'months';
  if (abs.weeks !== 0) return 'weeks';
  if (abs.days !== 0) return 'days';
  return 'hours';
}

function balanceToLadder(
  abs: Temporal.Duration,
  largestUnit: DurationUnit,
): { fields: Record<LadderUnit, number>; totalNs: bigint } {
  try {
    const rounded = abs.round({ largestUnit, smallestUnit: 'nanoseconds' });
    return { fields: fieldsFromTemporalDuration(rounded), totalNs: totalNanoseconds(rounded) };
  } catch (err) {
    if (!(err instanceof RangeError)) throw err;
    // Temporal.Duration.round requires a relativeTo reference to balance
    // into weeks/months/years. Fall back to the same fixed-ratio
    // conversion used elsewhere in this package.
    const totalNs = totalNanoseconds(abs);
    return { fields: ladderFromNanoseconds(totalNs, largestUnit), totalNs };
  }
}

/**
 * Balances a Temporal.Duration into a signed, capped, rounded list of
 * ladder parts ready for formatting: sign is extracted once, magnitude is
 * balanced up to an effective largest unit, a window of at most
 * `maxUnits` non-zero-leading units is selected, and the smallest shown
 * unit is re-rounded with half-expand semantics so the last displayed
 * unit reflects any carry (e.g. 1h59m40s capped at minutes becomes 2h).
 *
 * @example
 * ```ts
 * import { Temporal } from 'temporal-polyfill';
 * import { balanceDuration } from './duration-balance.js';
 *
 * balanceDuration(Temporal.Duration.from({ hours: 26, minutes: 5 }), { largestUnit: 'days', maxUnits: 3 });
 * // { sign: 1, parts: [{ unit: 'days', value: 1 }, { unit: 'hours', value: 2 }, { unit: 'minutes', value: 5 }] }
 * ```
 */
export function balanceDuration(
  duration: Temporal.Duration,
  options: BalanceOptions,
): BalancedDuration {
  const sign = duration.sign as -1 | 0 | 1;
  if (sign === 0) {
    return { sign: 0, parts: [{ unit: 'seconds', value: 0 }] };
  }

  const abs = duration.abs();
  const largestUnit = options.largestUnit ?? resolveEffectiveLargestUnit(abs);
  const { fields, totalNs } = balanceToLadder(abs, largestUnit);

  const startIndex = ladderIndex(largestUnit);
  const windowed = LADDER.slice(startIndex);

  let firstNonZero = windowed.findIndex((unit) => fields[unit] !== 0);
  if (firstNonZero === -1) firstNonZero = windowed.length - 1;

  const available = windowed.slice(firstNonZero);
  const capped = options.maxUnits === Infinity ? available : available.slice(0, options.maxUnits);

  let trimmedEnd = capped.length;
  while (trimmedEnd > 1 && fields[capped[trimmedEnd - 1] as LadderUnit] === 0) {
    trimmedEnd -= 1;
  }
  const selectedUnits = capped.slice(0, trimmedEnd);

  const smallestUnit = selectedUnits[selectedUnits.length - 1] as LadderUnit;
  const roundedTotalNs = roundNanoseconds(totalNs, RATIO_NS[smallestUnit]);
  const finalFields = ladderFromNanoseconds(roundedTotalNs, largestUnit);

  let finalEnd = selectedUnits.length;
  while (finalEnd > 1 && finalFields[selectedUnits[finalEnd - 1] as LadderUnit] === 0) {
    finalEnd -= 1;
  }

  const parts: DurationPart[] = selectedUnits
    .slice(0, finalEnd)
    .map((unit) => ({ unit, value: finalFields[unit as LadderUnit] }));

  return { sign, parts };
}
