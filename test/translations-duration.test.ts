import { afterEach, describe, expect, it } from 'vitest';
import { formatDurationParts } from '../src/internal/duration-format.js';
import { clearLocales, registerLocale } from '../src/translations.js';

describe('registerLocale — duration short-style glue words', () => {
  afterEach(() => {
    clearLocales();
  });

  it('uses the registered abbreviation for a translated unit', () => {
    registerLocale('zz', { durationShortUnits: { hours: '<h>' } });
    const result = formatDurationParts([{ unit: 'hours', value: 3 }], {
      style: 'short',
      locale: 'zz',
    });
    expect(result).toBe('3<h>');
  });

  it('leaves untranslated units at the English default abbreviation', () => {
    registerLocale('zz', { durationShortUnits: { hours: '<h>' } });
    const result = formatDurationParts(
      [
        { unit: 'hours', value: 3 },
        { unit: 'minutes', value: 15 },
      ],
      { style: 'short', locale: 'zz' },
    );
    expect(result).toBe('3<h> 15m');
  });

  it('uses the registered join function', () => {
    registerLocale('zz', {
      durationShortJoin: (parts: readonly string[]) => parts.join(', '),
    });
    const result = formatDurationParts(
      [
        { unit: 'hours', value: 3 },
        { unit: 'minutes', value: 15 },
      ],
      { style: 'short', locale: 'zz' },
    );
    expect(result).toBe('3h, 15m');
  });

  it('composes registered units with a registered join', () => {
    registerLocale('zz', {
      durationShortUnits: { hours: '<h>', minutes: '<m>' },
      durationShortJoin: (parts: readonly string[]) => parts.join(' + '),
    });
    const result = formatDurationParts(
      [
        { unit: 'hours', value: 3 },
        { unit: 'minutes', value: 15 },
      ],
      { style: 'short', locale: 'zz' },
    );
    expect(result).toBe('3<h> + 15<m>');
  });

  it('leaves long-style output completely unchanged by registration', () => {
    registerLocale('zz', {
      durationShortUnits: { hours: '<h>' },
      durationShortJoin: (parts: readonly string[]) => parts.join(' + '),
    });
    const result = formatDurationParts([{ unit: 'hours', value: 3 }], {
      style: 'long',
      locale: 'zz',
    });
    expect(result).toBe('3 hours');
  });

  it('does not change zero-duration short-style output', () => {
    registerLocale('zz', { durationShortUnits: { seconds: '<s>' } });
    expect(
      formatDurationParts([{ unit: 'seconds', value: 0 }], { style: 'short', locale: 'zz' }),
    ).toBe('0<s>');
  });

  it('does not affect an unrelated locale', () => {
    registerLocale('zz', { durationShortUnits: { hours: '<h>' } });
    const result = formatDurationParts([{ unit: 'hours', value: 3 }], {
      style: 'short',
      locale: 'yy',
    });
    expect(result).toBe('3h');
  });
});
