import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { humanizeDuration } from '../src/duration/humanize-duration.js';

describe('humanizeDuration', () => {
  it('renders a zero duration', () => {
    expect(humanizeDuration(new Temporal.Duration())).toBe('0 seconds');
    expect(humanizeDuration(new Temporal.Duration(), { style: 'short' })).toBe('0s');
  });

  it('renders a single unit', () => {
    expect(humanizeDuration(Temporal.Duration.from({ hours: 3 }))).toBe('3 hours');
  });

  it('caps at the default maxUnits of 3, rounding the last shown unit', () => {
    const duration = Temporal.Duration.from({ days: 1, hours: 26, minutes: 5, seconds: 30 });
    expect(humanizeDuration(duration)).toBe('2 days, 2 hours, 6 minutes');
  });

  it('renders full precision with maxUnits: Infinity', () => {
    const duration = Temporal.Duration.from({ days: 1, hours: 26, minutes: 5, seconds: 30 });
    expect(humanizeDuration(duration, { maxUnits: Infinity })).toBe(
      '2 days, 2 hours, 5 minutes, 30 seconds',
    );
  });

  it('renders long and short styles for the same input', () => {
    const duration = Temporal.Duration.from({ hours: 3, minutes: 15 });
    expect(humanizeDuration(duration)).toBe('3 hours, 15 minutes');
    expect(humanizeDuration(duration, { style: 'short' })).toBe('3h 15m');
  });

  it('prefixes a negative duration with a single leading minus sign, long style', () => {
    expect(humanizeDuration(Temporal.Duration.from({ hours: -3 }))).toBe('-3 hours');
  });

  it('prefixes a negative duration with a single leading minus sign, short style', () => {
    expect(humanizeDuration(Temporal.Duration.from({ hours: -3 }), { style: 'short' })).toBe('-3h');
  });

  it('balances using an explicit largestUnit override', () => {
    const duration = Temporal.Duration.from({ days: 2, hours: 3 });
    expect(humanizeDuration(duration, { largestUnit: 'hours' })).toBe('51 hours');
  });

  it('truncates the tail when largestUnit clamps the ladder to minutes', () => {
    const duration = Temporal.Duration.from({ hours: 2, minutes: 3, seconds: 45 });
    expect(humanizeDuration(duration, { largestUnit: 'minutes' })).toBe('123 minutes, 45 seconds');
  });
});
