import { Temporal } from 'temporal-polyfill';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('locale passthrough', () => {
  it('formats using a Spanish locale', async () => {
    const { fromNow } = await import('../src/relative/from-now.js');
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    const value = relativeTo.subtract({ hours: 72 });
    expect(fromNow(value, { relativeTo, locale: 'es' })).toBe('hace 3 días');
  });

  it('formats using a French locale', async () => {
    const { fromNow } = await import('../src/relative/from-now.js');
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    const value = relativeTo.subtract({ hours: 72 });
    expect(fromNow(value, { relativeTo, locale: 'fr' })).toBe('il y a 3 jours');
  });

  it('accepts a locale array and falls through to the first supported entry', async () => {
    const { fromNow } = await import('../src/relative/from-now.js');
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    const value = relativeTo.add({ hours: 72 });
    expect(fromNow(value, { relativeTo, locale: ['xx-YY', 'de'] })).toBe('in 3 Tagen');
  });
});

describe('Intl.RelativeTimeFormat unavailable', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('Intl', { ...Intl, RelativeTimeFormat: undefined });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('falls back to English-only phrasing regardless of requested locale', async () => {
    const { fromNow } = await import('../src/relative/from-now.js');
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    const value = relativeTo.subtract({ hours: 72 });
    expect(fromNow(value, { relativeTo, locale: 'es' })).toBe('3 days ago');
  });

  it('still renders "now" for a zero delta', async () => {
    const { fromNow } = await import('../src/relative/from-now.js');
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    expect(fromNow(relativeTo, { relativeTo })).toBe('now');
  });
});
