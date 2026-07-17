import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDurationParts } from '../src/internal/duration-format.js';

const HAS_DF =
  typeof Intl !== 'undefined' &&
  typeof (Intl as Record<string, unknown>).DurationFormat === 'function';

describe('formatDurationParts — short style', () => {
  it('disambiguates months (mo) from minutes (m)', () => {
    const result = formatDurationParts(
      [
        { unit: 'months', value: 1 },
        { unit: 'minutes', value: 1 },
      ],
      { style: 'short' },
    );
    expect(result).toBe('1mo 1m');
  });

  it('renders a zero duration as "0s"', () => {
    expect(formatDurationParts([{ unit: 'seconds', value: 0 }], { style: 'short' })).toBe('0s');
  });

  it('applies Intl.NumberFormat digit shaping for a non-Latin-digit locale', () => {
    const result = formatDurationParts([{ unit: 'hours', value: 3 }], {
      style: 'short',
      locale: 'ar-SA',
    });
    expect(result).toBe('٣h');
  });
});

describe('formatDurationParts — long style', () => {
  it('renders a zero duration as "0 seconds"', () => {
    expect(formatDurationParts([{ unit: 'seconds', value: 0 }], { style: 'long' })).toBe(
      '0 seconds',
    );
  });

  it.skipIf(!HAS_DF)('passes the locale through to Intl.DurationFormat', () => {
    const result = formatDurationParts([{ unit: 'hours', value: 3 }], {
      style: 'long',
      locale: 'es',
    });
    expect(result).toBe('3 horas');
  });
});

describe('formatDurationParts — Intl.DurationFormat unavailable', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('Intl', { ...Intl, DurationFormat: undefined });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('falls back to English-only long-style phrasing', async () => {
    const { formatDurationParts: format } = await import('../src/internal/duration-format.js');
    const result = format(
      [
        { unit: 'days', value: 2 },
        { unit: 'hours', value: 3 },
      ],
      { style: 'long' },
    );
    expect(result).toBe('2 days, 3 hours');
  });

  it('still renders a zero duration as "0 seconds"', async () => {
    const { formatDurationParts: format } = await import('../src/internal/duration-format.js');
    expect(format([{ unit: 'seconds', value: 0 }], { style: 'long' })).toBe('0 seconds');
  });
});
