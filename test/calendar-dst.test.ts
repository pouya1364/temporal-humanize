import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { calendar } from '../src/calendar/calendar.js';

describe('calendar DST handling', () => {
  it('keeps the spring-forward gap on the same calendar day for ZonedDateTime', () => {
    // The value's wall clock reads 2.5h later than relativeTo (with the
    // 02:00-02:59 hour skipped entirely that day), but both fall on the
    // same calendar date, so the day bucket is unaffected by the gap.
    const relativeTo = Temporal.ZonedDateTime.from('2024-03-10T01:00:00-05:00[America/New_York]');
    const value = Temporal.ZonedDateTime.from('2024-03-10T03:30:00-04:00[America/New_York]');

    expect(calendar(value, { relativeTo })).toBe('Today at 3:30 AM');
  });

  it('has no DST awareness for a structurally similar PlainDateTime pair', () => {
    const relativeTo = Temporal.PlainDateTime.from('2024-03-10T01:00:00');
    const value = Temporal.PlainDateTime.from('2024-03-10T03:30:00');

    expect(calendar(value, { relativeTo })).toBe('Today at 3:30 AM');
  });

  it('keeps the fall-back repeated hour on the same calendar day for ZonedDateTime', () => {
    // The repeated 01:00-01:59 hour means the same wall-clock time occurs
    // twice, but the day bucket still resolves from the calendar date, not
    // the absolute instant.
    const relativeTo = Temporal.ZonedDateTime.from('2024-11-03T00:30:00-04:00[America/New_York]');
    const value = Temporal.ZonedDateTime.from('2024-11-03T01:30:00-05:00[America/New_York]');

    expect(calendar(value, { relativeTo })).toBe('Today at 1:30 AM');
  });

  it('has no DST awareness for a structurally similar PlainDateTime pair (fall-back)', () => {
    const relativeTo = Temporal.PlainDateTime.from('2024-11-03T00:30:00');
    const value = Temporal.PlainDateTime.from('2024-11-03T01:30:00');

    expect(calendar(value, { relativeTo })).toBe('Today at 1:30 AM');
  });
});
