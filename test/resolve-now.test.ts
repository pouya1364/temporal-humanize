import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { resolveNow } from '../src/internal/resolve-now.js';

describe('resolveNow', () => {
  it('resolves an instant kind for Instant input with no relativeTo', () => {
    const result = resolveNow(Temporal.Now.instant());
    expect(result.kind).toBe('instant');
    expect(result.now).toBeInstanceOf(Temporal.Instant);
  });

  it('resolves an instant kind for ZonedDateTime input with no relativeTo', () => {
    const result = resolveNow(Temporal.Now.zonedDateTimeISO('UTC'));
    expect(result.kind).toBe('instant');
    expect(result.now).toBeInstanceOf(Temporal.Instant);
  });

  it('resolves a plain kind for PlainDateTime input with no relativeTo', () => {
    const result = resolveNow(Temporal.Now.plainDateTimeISO());
    expect(result.kind).toBe('plain');
    expect(result.now).toBeInstanceOf(Temporal.PlainDateTime);
  });

  it('uses an explicit Instant relativeTo for Instant input', () => {
    const relativeTo = Temporal.Instant.from('2024-01-01T00:00:00Z');
    const result = resolveNow(Temporal.Instant.from('2024-01-02T00:00:00Z'), relativeTo);
    expect(result.kind).toBe('instant');
    expect((result.now as Temporal.Instant).equals(relativeTo)).toBe(true);
  });

  it('converts an explicit ZonedDateTime relativeTo to an Instant', () => {
    const relativeTo = Temporal.ZonedDateTime.from('2024-01-01T00:00:00-05:00[America/New_York]');
    const result = resolveNow(Temporal.Now.instant(), relativeTo);
    expect(result.kind).toBe('instant');
    expect((result.now as Temporal.Instant).equals(relativeTo.toInstant())).toBe(true);
  });

  it('uses an explicit PlainDateTime relativeTo for PlainDateTime input', () => {
    const relativeTo = Temporal.PlainDateTime.from('2024-01-01T00:00:00');
    const result = resolveNow(Temporal.PlainDateTime.from('2024-01-02T00:00:00'), relativeTo);
    expect(result.kind).toBe('plain');
    expect((result.now as Temporal.PlainDateTime).equals(relativeTo)).toBe(true);
  });

  it('throws RangeError when input is tz-aware but relativeTo is a PlainDateTime', () => {
    expect(() =>
      resolveNow(Temporal.Now.instant(), Temporal.PlainDateTime.from('2024-01-01T00:00:00')),
    ).toThrow(RangeError);
  });

  it('throws RangeError when input is PlainDateTime but relativeTo is tz-aware', () => {
    expect(() =>
      resolveNow(Temporal.PlainDateTime.from('2024-01-01T00:00:00'), Temporal.Now.instant()),
    ).toThrow(RangeError);
  });
});
