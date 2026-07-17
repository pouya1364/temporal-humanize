import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { resolveCalendarNow } from '../src/internal/resolve-calendar-now.js';

describe('resolveCalendarNow', () => {
  it('resolves a zoned kind for ZonedDateTime input with no relativeTo', () => {
    const result = resolveCalendarNow(Temporal.Now.zonedDateTimeISO());
    expect(result.kind).toBe('zoned');
    expect(result.now).toBeInstanceOf(Temporal.ZonedDateTime);
  });

  it('resolves a plain kind for PlainDateTime input with no relativeTo', () => {
    const result = resolveCalendarNow(Temporal.Now.plainDateTimeISO());
    expect(result.kind).toBe('plain');
    expect(result.now).toBeInstanceOf(Temporal.PlainDateTime);
  });

  it('uses an explicit ZonedDateTime relativeTo verbatim, not recomputed', () => {
    const relativeTo = Temporal.ZonedDateTime.from('2024-01-01T00:00:00-05:00[America/New_York]');
    const value = Temporal.ZonedDateTime.from('2024-01-02T00:00:00-05:00[America/New_York]');
    const result = resolveCalendarNow(value, relativeTo);
    expect(result.kind).toBe('zoned');
    expect((result.now as Temporal.ZonedDateTime).equals(relativeTo)).toBe(true);
  });

  it('uses an explicit PlainDateTime relativeTo verbatim, not recomputed', () => {
    const relativeTo = Temporal.PlainDateTime.from('2024-01-01T00:00:00');
    const value = Temporal.PlainDateTime.from('2024-01-02T00:00:00');
    const result = resolveCalendarNow(value, relativeTo);
    expect(result.kind).toBe('plain');
    expect((result.now as Temporal.PlainDateTime).equals(relativeTo)).toBe(true);
  });

  it('throws RangeError when input is a ZonedDateTime but relativeTo is a PlainDateTime', () => {
    expect(() =>
      resolveCalendarNow(
        Temporal.Now.zonedDateTimeISO(),
        Temporal.PlainDateTime.from('2024-01-01T00:00:00'),
      ),
    ).toThrow(RangeError);
  });

  it('throws RangeError when input is a PlainDateTime but relativeTo is a ZonedDateTime', () => {
    expect(() =>
      resolveCalendarNow(
        Temporal.PlainDateTime.from('2024-01-01T00:00:00'),
        Temporal.Now.zonedDateTimeISO(),
      ),
    ).toThrow(RangeError);
  });
});
