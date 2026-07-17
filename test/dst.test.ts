import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { fromNow } from '../src/relative/from-now.js';

describe('DST handling', () => {
  it('accounts for the America/New_York spring-forward gap for ZonedDateTime', () => {
    const relativeTo = Temporal.ZonedDateTime.from('2024-03-10T01:00:00-05:00[America/New_York]');
    const value = Temporal.ZonedDateTime.from('2024-03-10T03:30:00-04:00[America/New_York]');

    // Wall clock reads a 2.5h gap, but only 1.5h of absolute time elapsed
    // because the 02:00-02:59 hour never happened that day.
    expect(fromNow(value, { relativeTo })).toBe('in 2 hours');
  });

  it('ignores the DST gap entirely for PlainDateTime (wall-clock, tz-naive)', () => {
    const relativeTo = Temporal.PlainDateTime.from('2024-03-10T01:00:00');
    const value = Temporal.PlainDateTime.from('2024-03-10T03:30:00');

    expect(fromNow(value, { relativeTo })).toBe('in 3 hours');
  });

  it('accounts for the America/New_York fall-back repeated hour for ZonedDateTime', () => {
    const relativeTo = Temporal.ZonedDateTime.from('2024-11-03T00:30:00-04:00[America/New_York]');
    const value = Temporal.ZonedDateTime.from('2024-11-03T01:30:00-05:00[America/New_York]');

    // Wall clock reads a 1h gap, but 2h of absolute time elapsed because
    // 01:00-01:59 happens twice that day.
    expect(fromNow(value, { relativeTo })).toBe('in 2 hours');
  });

  it('ignores the repeated hour entirely for PlainDateTime (wall-clock, tz-naive)', () => {
    const relativeTo = Temporal.PlainDateTime.from('2024-11-03T00:30:00');
    const value = Temporal.PlainDateTime.from('2024-11-03T01:30:00');

    expect(fromNow(value, { relativeTo })).toBe('in 1 hour');
  });
});
