import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { fromNow } from '../src/relative/from-now.js';

describe('fromNow', () => {
  it('formats a past instant', () => {
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    const value = relativeTo.subtract({ hours: 3 });
    expect(fromNow(value, { relativeTo })).toBe('3 hours ago');
  });

  it('formats a future instant', () => {
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    const value = relativeTo.add({ hours: 3 });
    expect(fromNow(value, { relativeTo })).toBe('in 3 hours');
  });

  it('formats a past ZonedDateTime', () => {
    const relativeTo = Temporal.ZonedDateTime.from('2024-06-01T12:00:00-04:00[America/New_York]');
    const value = relativeTo.subtract({ days: 2 });
    expect(fromNow(value, { relativeTo })).toBe('2 days ago');
  });

  it('formats a past PlainDateTime', () => {
    const relativeTo = Temporal.PlainDateTime.from('2024-06-01T12:00:00');
    const value = relativeTo.subtract({ minutes: 10 });
    expect(fromNow(value, { relativeTo })).toBe('10 minutes ago');
  });

  it('formats a future PlainDateTime', () => {
    const relativeTo = Temporal.PlainDateTime.from('2024-06-01T12:00:00');
    const value = relativeTo.add({ minutes: 10 });
    expect(fromNow(value, { relativeTo })).toBe('in 10 minutes');
  });

  it('treats an exactly-60s past delta as 1 minute ago', () => {
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    const value = relativeTo.subtract({ seconds: 60 });
    expect(fromNow(value, { relativeTo })).toBe('1 minute ago');
  });

  it('treats an exactly-24h future delta as in 1 day', () => {
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    const value = relativeTo.add({ hours: 24 });
    expect(fromNow(value, { relativeTo })).toBe('in 1 day');
  });

  it('renders "now" for a zero delta', () => {
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    expect(fromNow(relativeTo, { relativeTo })).toBe('now');
  });

  it('defaults relativeTo to the current instant when omitted', () => {
    const value = Temporal.Now.instant().subtract({ hours: 2 });
    expect(fromNow(value)).toBe('2 hours ago');
  });

  it('throws RangeError on tz-awareness mismatch', () => {
    expect(() =>
      fromNow(Temporal.Now.instant(), {
        relativeTo: Temporal.PlainDateTime.from('2024-01-01T00:00:00'),
      }),
    ).toThrow(RangeError);
  });
});
