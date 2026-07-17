import { afterEach, describe, expect, it } from 'vitest';
import {
  clearRegistry,
  registeredLocaleKeys,
  resolveField,
  setLocale,
} from '../src/internal/locale-registry.js';

describe('resolveField — candidate resolution', () => {
  afterEach(() => {
    clearRegistry();
  });

  it('returns the fallback when no locale is registered', () => {
    expect(resolveField('zz', 'now', 'now')).toBe('now');
  });

  it('returns the fallback when locale is undefined', () => {
    expect(resolveField(undefined, 'now', 'now')).toBe('now');
  });

  it('returns the registered value for an exact locale match', () => {
    setLocale('zz', { now: '<now>' });
    expect(resolveField('zz', 'now', 'now')).toBe('<now>');
  });

  it('falls back to the base language subtag when the full tag is unregistered', () => {
    setLocale('zz', { now: '<now>' });
    expect(resolveField('zz-XX', 'now', 'now')).toBe('<now>');
  });

  it('prefers an exact subtag match over the base-language fallback', () => {
    setLocale('zz', { now: '<base>' });
    setLocale('zz-XX', { now: '<exact>' });
    expect(resolveField('zz-XX', 'now', 'now')).toBe('<exact>');
  });

  it('resolves array locales in order, first match wins', () => {
    setLocale('yy', { now: '<yy>' });
    expect(resolveField(['xx', 'yy'], 'now', 'now')).toBe('<yy>');
  });

  it('checks each array entry then its subtag before moving to the next entry', () => {
    setLocale('xx', { now: '<xx-base>' });
    expect(resolveField(['xx-XX', 'yy'], 'now', 'now')).toBe('<xx-base>');
  });

  it('leaves unregistered fields at the fallback for a partially registered locale', () => {
    setLocale('zz', { now: '<now>' });
    expect(
      resolveField(
        'zz',
        'calendarDay',
        (w: string, t: string) => `${w} at ${t}`,
      )('Today', '3:00 PM'),
    ).toBe('Today at 3:00 PM');
  });
});

describe('setLocale — merge behavior', () => {
  afterEach(() => {
    clearRegistry();
  });

  it('merges a second call for the same locale rather than replacing it', () => {
    setLocale('zz', { now: '<now>' });
    setLocale('zz', { durationShortUnits: { hours: '<h>' } });

    expect(resolveField('zz', 'now', 'now')).toBe('<now>');
    expect(resolveField('zz', 'durationShortUnits', {})).toEqual({ hours: '<h>' });
  });

  it('lets a later call override a field set by an earlier call', () => {
    setLocale('zz', { now: '<first>' });
    setLocale('zz', { now: '<second>' });
    expect(resolveField('zz', 'now', 'now')).toBe('<second>');
  });
});

describe('registeredLocaleKeys / clearRegistry', () => {
  afterEach(() => {
    clearRegistry();
  });

  it('reflects currently registered locale keys', () => {
    setLocale('zz', { now: '<now>' });
    setLocale('yy', { now: '<now>' });
    expect(registeredLocaleKeys().sort()).toEqual(['yy', 'zz']);
  });

  it('empties the registry', () => {
    setLocale('zz', { now: '<now>' });
    clearRegistry();
    expect(registeredLocaleKeys()).toEqual([]);
    expect(resolveField('zz', 'now', 'now')).toBe('now');
  });
});
