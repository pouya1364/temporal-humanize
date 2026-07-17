import { Temporal } from 'temporal-polyfill';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('registered translations compose with the Intl.RelativeTimeFormat-absent fallback', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('Intl', { ...Intl, RelativeTimeFormat: undefined });
  });

  afterEach(async () => {
    const { clearLocales } = await import('../src/translations.js');
    clearLocales();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('applies the registered "now" translation even when Intl.RelativeTimeFormat is absent', async () => {
    const { fromNow } = await import('../src/relative/from-now.js');
    const { registerLocale } = await import('../src/translations.js');
    registerLocale('zz', { now: '<now>' });

    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    expect(fromNow(relativeTo, { relativeTo, locale: 'zz' })).toBe('<now>');
  });

  it('leaves the non-zero "ago"/"in" fallback-en phrasing untouched by the registry', async () => {
    const { fromNow } = await import('../src/relative/from-now.js');
    const { registerLocale } = await import('../src/translations.js');
    registerLocale('zz', { now: '<now>' });

    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    const value = relativeTo.subtract({ hours: 72 });
    expect(fromNow(value, { relativeTo, locale: 'zz' })).toBe('3 days ago');
  });
});
