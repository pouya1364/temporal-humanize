import { Temporal } from 'temporal-polyfill';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const relativeTo = Temporal.PlainDateTime.from('2024-06-03T09:00:00');

function value(dateStr: string): Temporal.PlainDateTime {
  return Temporal.PlainDateTime.from(`${dateStr}T15:00:00`);
}

describe('Intl.RelativeTimeFormat unavailable', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('Intl', { ...Intl, RelativeTimeFormat: undefined });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('falls back to literal English Today/Yesterday/Tomorrow regardless of requested locale', async () => {
    const { calendar } = await import('../src/calendar/calendar.js');
    expect(calendar(value('2024-06-03'), { relativeTo, locale: 'es' })).toBe('Today at 3:00 PM');
    expect(calendar(value('2024-06-02'), { relativeTo, locale: 'es' })).toBe(
      'Yesterday at 3:00 PM',
    );
    expect(calendar(value('2024-06-04'), { relativeTo, locale: 'es' })).toBe('Tomorrow at 3:00 PM');
  });
});

describe('Intl.DateTimeFormat unavailable', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('Intl', { ...Intl, DateTimeFormat: undefined });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('falls back to an English weekday name', async () => {
    const { calendar } = await import('../src/calendar/calendar.js');
    expect(calendar(value('2024-06-06'), { relativeTo })).toBe('Thursday at 3:00 PM');
  });

  it('falls back to a plain 12-hour time rendering', async () => {
    const { calendar } = await import('../src/calendar/calendar.js');
    expect(calendar(value('2024-06-03'), { relativeTo })).toBe('Today at 3:00 PM');
  });

  it('falls back to a plain fallback date string', async () => {
    const { calendar } = await import('../src/calendar/calendar.js');
    expect(calendar(value('2024-01-01'), { relativeTo })).toBe('Jan 1, 2024');
  });
});
