import { Temporal } from 'temporal-polyfill';
import { afterEach, describe, expect, it } from 'vitest';
import { fromNow } from '../src/relative/from-now.js';
import { toNow } from '../src/relative/to-now.js';
import { clearLocales, registerLocale, unregisterLocale } from '../src/translations.js';

describe('registerLocale — "now" translation', () => {
  afterEach(() => {
    clearLocales();
  });

  it('applies the registered "now" translation for a zero delta', () => {
    registerLocale('zz', { now: '<now>' });
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    expect(fromNow(relativeTo, { relativeTo, locale: 'zz' })).toBe('<now>');
  });

  it('applies to toNow as well', () => {
    registerLocale('zz', { now: '<now>' });
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    expect(toNow(relativeTo, { relativeTo, locale: 'zz' })).toBe('<now>');
  });

  it('reverts to the English "now" after unregisterLocale', () => {
    registerLocale('zz', { now: '<now>' });
    unregisterLocale('zz');
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    expect(fromNow(relativeTo, { relativeTo, locale: 'zz' })).toBe('now');
  });

  it('does not affect an unrelated locale', () => {
    registerLocale('zz', { now: '<now>' });
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    expect(fromNow(relativeTo, { relativeTo, locale: 'yy' })).toBe('now');
  });

  it('resolves a subtag of a registered locale', () => {
    registerLocale('zz', { now: '<now>' });
    const relativeTo = Temporal.Instant.from('2024-06-01T12:00:00Z');
    expect(fromNow(relativeTo, { relativeTo, locale: 'zz-XX' })).toBe('<now>');
  });
});
