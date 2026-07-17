import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { balanceDuration, resolveEffectiveLargestUnit } from '../src/internal/duration-balance.js';

describe('resolveEffectiveLargestUnit', () => {
  it('defaults to hours when no calendar field is populated', () => {
    expect(resolveEffectiveLargestUnit(Temporal.Duration.from({ hours: 3 }))).toBe('hours');
  });

  it('uses days when the raw duration already carries a days field', () => {
    expect(resolveEffectiveLargestUnit(Temporal.Duration.from({ days: 2, hours: 3 }))).toBe('days');
  });

  it('uses weeks when the raw duration already carries a weeks field', () => {
    expect(resolveEffectiveLargestUnit(Temporal.Duration.from({ weeks: 1, days: 2 }))).toBe(
      'weeks',
    );
  });

  it('uses months when the raw duration already carries a months field', () => {
    expect(resolveEffectiveLargestUnit(Temporal.Duration.from({ months: 2, days: 3 }))).toBe(
      'months',
    );
  });

  it('uses years when the raw duration already carries a years field, taking priority over months', () => {
    expect(resolveEffectiveLargestUnit(Temporal.Duration.from({ years: 1, months: 2 }))).toBe(
      'years',
    );
  });
});

describe('balanceDuration — sign extraction', () => {
  it('returns sign 0 and a single zero part for a zero duration', () => {
    expect(balanceDuration(new Temporal.Duration(), { maxUnits: 3 })).toEqual({
      sign: 0,
      parts: [{ unit: 'seconds', value: 0 }],
    });
  });

  it('returns sign 1 with unsigned magnitude for a positive duration', () => {
    expect(balanceDuration(Temporal.Duration.from({ hours: 3 }), { maxUnits: 3 })).toEqual({
      sign: 1,
      parts: [{ unit: 'hours', value: 3 }],
    });
  });

  it('returns sign -1 with unsigned magnitude for a negative duration', () => {
    expect(balanceDuration(Temporal.Duration.from({ hours: -3 }), { maxUnits: 3 })).toEqual({
      sign: -1,
      parts: [{ unit: 'hours', value: 3 }],
    });
  });
});

describe('balanceDuration — omitted largestUnit resolution', () => {
  it('balances to hours when no calendar field is populated', () => {
    expect(balanceDuration(Temporal.Duration.from({ hours: 3 }), { maxUnits: 3 })).toEqual({
      sign: 1,
      parts: [{ unit: 'hours', value: 3 }],
    });
  });

  it('balances to days when the raw duration already carries a days field', () => {
    expect(balanceDuration(Temporal.Duration.from({ days: 2, hours: 3 }), { maxUnits: 3 })).toEqual(
      {
        sign: 1,
        parts: [
          { unit: 'days', value: 2 },
          { unit: 'hours', value: 3 },
        ],
      },
    );
  });

  it('balances to weeks via the fixed-ratio fallback when the raw duration carries a weeks field', () => {
    expect(balanceDuration(Temporal.Duration.from({ weeks: 1, days: 2 }), { maxUnits: 3 })).toEqual(
      {
        sign: 1,
        parts: [
          { unit: 'weeks', value: 1 },
          { unit: 'days', value: 2 },
        ],
      },
    );
  });

  it('balances to years via the fixed-ratio fallback when the raw duration carries a years field', () => {
    expect(
      balanceDuration(Temporal.Duration.from({ years: 1, months: 2 }), { maxUnits: 3 }),
    ).toEqual({
      sign: 1,
      parts: [
        { unit: 'years', value: 1 },
        { unit: 'months', value: 2 },
      ],
    });
  });
});

describe('balanceDuration — unit-boundary rounding carry', () => {
  it('carries 1h59m40s all the way up to 2h when capped at minutes', () => {
    const result = balanceDuration(Temporal.Duration.from({ hours: 1, minutes: 59, seconds: 40 }), {
      maxUnits: 2,
    });
    expect(result).toEqual({ sign: 1, parts: [{ unit: 'hours', value: 2 }] });
  });
});

describe('balanceDuration — trailing and intermediate zero handling', () => {
  it('trims trailing zero units down to a single part', () => {
    const result = balanceDuration(Temporal.Duration.from({ hours: 2, minutes: 0, seconds: 0 }), {
      maxUnits: 3,
    });
    expect(result).toEqual({ sign: 1, parts: [{ unit: 'hours', value: 2 }] });
  });

  it('keeps an intermediate zero unit within the selected window', () => {
    const result = balanceDuration(Temporal.Duration.from({ hours: 2, minutes: 0, seconds: 5 }), {
      maxUnits: 3,
    });
    expect(result).toEqual({
      sign: 1,
      parts: [
        { unit: 'hours', value: 2 },
        { unit: 'minutes', value: 0 },
        { unit: 'seconds', value: 5 },
      ],
    });
  });
});

describe('balanceDuration — fixed-ratio fallback for an explicit calendar largestUnit', () => {
  it('balances into months with an explicit largestUnit override, keeping an intermediate zero weeks part', () => {
    const result = balanceDuration(Temporal.Duration.from({ days: 400 }), {
      largestUnit: 'months',
      maxUnits: 3,
    });
    expect(result).toEqual({
      sign: 1,
      parts: [
        { unit: 'months', value: 13 },
        { unit: 'weeks', value: 0 },
        { unit: 'days', value: 4 },
      ],
    });
  });
});

describe('balanceDuration — maxUnits Infinity', () => {
  it('renders full precision down to milliseconds', () => {
    const result = balanceDuration(Temporal.Duration.from({ hours: 1, milliseconds: 500 }), {
      maxUnits: Infinity,
    });
    expect(result).toEqual({
      sign: 1,
      parts: [
        { unit: 'hours', value: 1 },
        { unit: 'minutes', value: 0 },
        { unit: 'seconds', value: 0 },
        { unit: 'milliseconds', value: 500 },
      ],
    });
  });
});
