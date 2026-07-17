import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { fromNow } from '../src/relative/from-now.js';
import { toNow } from '../src/relative/to-now.js';

describe('toNow', () => {
  it('formats a past instant identically to fromNow', () => {
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    const value = relativeTo.subtract({ hours: 3 });
    expect(toNow(value, { relativeTo })).toBe('3 hours ago');
    expect(toNow(value, { relativeTo })).toBe(fromNow(value, { relativeTo }));
  });

  it('formats a future instant identically to fromNow', () => {
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    const value = relativeTo.add({ hours: 3 });
    expect(toNow(value, { relativeTo })).toBe('in 3 hours');
    expect(toNow(value, { relativeTo })).toBe(fromNow(value, { relativeTo }));
  });

  it('formats a PlainDateTime identically to fromNow', () => {
    const relativeTo = Temporal.PlainDateTime.from('2024-06-01T12:00:00');
    const value = relativeTo.add({ days: 5 });
    expect(toNow(value, { relativeTo })).toBe('in 5 days');
    expect(toNow(value, { relativeTo })).toBe(fromNow(value, { relativeTo }));
  });

  it('renders "now" for a zero delta', () => {
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    expect(toNow(relativeTo, { relativeTo })).toBe('now');
  });

  it('throws RangeError on tz-awareness mismatch', () => {
    expect(() =>
      toNow(Temporal.Now.instant(), {
        relativeTo: Temporal.PlainDateTime.from('2024-01-01T00:00:00'),
      }),
    ).toThrow(RangeError);
  });
});
