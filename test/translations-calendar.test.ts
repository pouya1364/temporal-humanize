import { Temporal } from 'temporal-polyfill';
import { afterEach, describe, expect, it } from 'vitest';
import { calendar } from '../src/calendar/calendar.js';
import { clearLocales, registerLocale } from '../src/translations.js';

const relativeTo = Temporal.PlainDateTime.from('2024-06-03T09:00:00');

function value(dateStr: string): Temporal.PlainDateTime {
  return Temporal.PlainDateTime.from(`${dateStr}T15:00:00`);
}

describe('registerLocale — calendar glue words', () => {
  afterEach(() => {
    clearLocales();
  });

  it('uses the registered calendarDay builder with the Intl day word interpolated in', () => {
    registerLocale('zz', {
      calendarDay: (dayWord: string, time: string) => `${dayWord} <glue> ${time}`,
    });
    expect(calendar(value('2024-06-03'), { relativeTo, locale: 'zz' })).toBe(
      'Today <glue> 3:00 PM',
    );
  });

  it('uses the registered calendarLastWeekday builder', () => {
    registerLocale('zz', {
      calendarLastWeekday: (weekday: string, time: string) => `<last> ${weekday} <glue> ${time}`,
    });
    expect(calendar(value('2024-05-31'), { relativeTo, locale: 'zz' })).toBe(
      '<last> Friday <glue> 3:00 PM',
    );
  });

  it('uses the registered calendarWeekday builder', () => {
    registerLocale('zz', {
      calendarWeekday: (weekday: string, time: string) => `${weekday} <glue> ${time}`,
    });
    expect(calendar(value('2024-06-06'), { relativeTo, locale: 'zz' })).toBe(
      'Thursday <glue> 3:00 PM',
    );
  });

  it('leaves the other two builders at the English default when only one is registered', () => {
    registerLocale('zz', {
      calendarDay: (dayWord: string, time: string) => `${dayWord} <glue> ${time}`,
    });
    expect(calendar(value('2024-05-31'), { relativeTo, locale: 'zz' })).toBe(
      'Last Friday at 3:00 PM',
    );
    expect(calendar(value('2024-06-06'), { relativeTo, locale: 'zz' })).toBe('Thursday at 3:00 PM');
  });

  it('reverts all builders to English defaults after clearLocales', () => {
    registerLocale('zz', {
      calendarDay: (dayWord: string, time: string) => `${dayWord} <glue> ${time}`,
    });
    clearLocales();
    expect(calendar(value('2024-06-03'), { relativeTo, locale: 'zz' })).toBe('Today at 3:00 PM');
  });

  it('does not affect an unrelated locale', () => {
    registerLocale('zz', {
      calendarDay: (dayWord: string, time: string) => `${dayWord} <glue> ${time}`,
    });
    expect(calendar(value('2024-06-03'), { relativeTo, locale: 'yy' })).toBe('Today at 3:00 PM');
  });
});
