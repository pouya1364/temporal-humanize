import { Temporal } from 'temporal-polyfill';
import { describe, expect, it } from 'vitest';
import { calendar } from '../src/calendar/calendar.js';

// All non-DST scenarios below use PlainDateTime with a fixed "now" of
// 2024-06-03T09:00:00 (a Monday), so bucket boundaries are exercised as
// plain calendar-date arithmetic.
const relativeTo = Temporal.PlainDateTime.from('2024-06-03T09:00:00');

function value(dateStr: string): Temporal.PlainDateTime {
  return Temporal.PlainDateTime.from(`${dateStr}T15:00:00`);
}

describe('calendar — bucket ladder (PlainDateTime)', () => {
  it('renders the same-day bucket', () => {
    expect(calendar(value('2024-06-03'), { relativeTo })).toBe('Today at 3:00 PM');
  });

  it('renders the previous-day bucket', () => {
    expect(calendar(value('2024-06-02'), { relativeTo })).toBe('Yesterday at 3:00 PM');
  });

  it('renders the next-day bucket', () => {
    expect(calendar(value('2024-06-04'), { relativeTo })).toBe('Tomorrow at 3:00 PM');
  });

  it('renders the last-week bucket for a -3 day difference', () => {
    expect(calendar(value('2024-05-31'), { relativeTo })).toBe('Last Friday at 3:00 PM');
  });

  it('renders the next-week bucket for a +3 day difference', () => {
    expect(calendar(value('2024-06-06'), { relativeTo })).toBe('Thursday at 3:00 PM');
  });

  it('still uses the weekday bucket at the -6 day boundary', () => {
    expect(calendar(value('2024-05-28'), { relativeTo })).toBe('Last Tuesday at 3:00 PM');
  });

  it('still uses the weekday bucket at the +6 day boundary', () => {
    expect(calendar(value('2024-06-09'), { relativeTo })).toBe('Sunday at 3:00 PM');
  });

  it('falls through to the fallback date string at -7 days', () => {
    expect(calendar(value('2024-05-27'), { relativeTo })).toBe('May 27, 2024');
  });

  it('falls through to the fallback date string at +7 days', () => {
    expect(calendar(value('2024-06-10'), { relativeTo })).toBe('Jun 10, 2024');
  });

  it('renders the sameElse fallback as a locale date string with no time portion', () => {
    const result = calendar(value('2024-01-01'), { relativeTo });
    expect(result).toBe('Jan 1, 2024');
    expect(result).not.toContain('at');
  });
});

describe('calendar — timeFormat', () => {
  it('defaults to short time style', () => {
    expect(calendar(value('2024-06-03'), { relativeTo })).toBe('Today at 3:00 PM');
  });

  it('overrides only the time portion with medium style', () => {
    expect(calendar(value('2024-06-03'), { relativeTo, timeFormat: 'medium' })).toBe(
      'Today at 3:00:00 PM',
    );
  });

  it('overrides only the time portion with long style', () => {
    expect(calendar(value('2024-06-03'), { relativeTo, timeFormat: 'long' })).toBe(
      'Today at 3:00:00 PM',
    );
  });
});

describe('calendar — thresholdDays', () => {
  it('falls through to sameElse when a custom threshold is exceeded', () => {
    // dayDiff is +4, which is within the default threshold (nextWeek) but
    // outside a custom thresholdDays: 3.
    expect(calendar(value('2024-06-07'), { relativeTo, thresholdDays: 3 })).toBe('Jun 7, 2024');
  });

  it('still uses the weekday bucket within the custom threshold', () => {
    expect(calendar(value('2024-06-06'), { relativeTo, thresholdDays: 3 })).toBe(
      'Thursday at 3:00 PM',
    );
  });
});

describe('calendar — locale passthrough', () => {
  it('localizes the day word and weekday for Spanish, keeping structural words English', () => {
    // Spanish also renders the time in 24-hour form via Intl.DateTimeFormat
    // — the time portion is localized too, only "at"/"Last" stay English.
    expect(calendar(value('2024-06-02'), { relativeTo, locale: 'es' })).toBe('Ayer at 15:00');
    expect(calendar(value('2024-06-06'), { relativeTo, locale: 'es' })).toBe('jueves at 15:00');
  });

  it('localizes the day word and weekday for French, keeping structural words English', () => {
    expect(calendar(value('2024-06-02'), { relativeTo, locale: 'fr' })).toBe('Hier at 15:00');
    expect(calendar(value('2024-05-31'), { relativeTo, locale: 'fr' })).toBe(
      'Last vendredi at 15:00',
    );
  });
});

describe('calendar — ZonedDateTime vs PlainDateTime divergence', () => {
  it('converts "now" into the value\'s own zone before computing the day bucket', () => {
    // "now" is 2024-06-03T03:00 UTC, which is still 2024-06-02T23:00 in
    // America/New_York — converting into the value's zone flips which
    // calendar day "now" falls on relative to the naive UTC date.
    const zonedRelativeTo = Temporal.ZonedDateTime.from('2024-06-03T03:00:00+00:00[UTC]');
    const zonedValue = Temporal.ZonedDateTime.from('2024-06-03T00:30:00-04:00[America/New_York]');
    expect(calendar(zonedValue, { relativeTo: zonedRelativeTo })).toBe('Tomorrow at 12:30 AM');
  });

  it('has no zone to convert for a structurally similar PlainDateTime pair', () => {
    const plainRelativeTo = Temporal.PlainDateTime.from('2024-06-03T03:00:00');
    const plainValue = Temporal.PlainDateTime.from('2024-06-03T00:30:00');
    expect(calendar(plainValue, { relativeTo: plainRelativeTo })).toBe('Today at 12:30 AM');
  });
});
