export type TemporalInput = Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDateTime;

export type LocaleInput = string | readonly string[];

export type NowReference = Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDateTime;

export interface RelativeTimeOptions {
  locale?: LocaleInput;
  relativeTo?: NowReference;
  style?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
}

export type DurationUnit = 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds';

export interface HumanizeDurationOptions {
  largestUnit?: DurationUnit;
  style?: 'long' | 'short';
  locale?: LocaleInput;
  maxUnits?: number;
}

export type CalendarInput = Temporal.ZonedDateTime | Temporal.PlainDateTime;

export type CalendarNowReference = Temporal.ZonedDateTime | Temporal.PlainDateTime;

export interface CalendarOptions {
  locale?: LocaleInput;
  relativeTo?: CalendarNowReference;
  timeFormat?: 'short' | 'medium' | 'long' | 'full';
  thresholdDays?: number;
}

export type ShortDurationUnit = DurationUnit | 'milliseconds';

/**
 * Glue-word translations for the handful of strings this package renders
 * without going through Intl (structural calendar wording, the zero-delta
 * "now", and short-style duration unit abbreviations/joins). Every field is
 * optional — an unregistered field keeps its English default. See
 * `registerLocale` in `temporal-humanize` for how to supply these.
 */
export interface LocaleTranslations {
  now?: string;
  calendarDay?: (dayWord: string, time: string) => string;
  calendarLastWeekday?: (weekday: string, time: string) => string;
  calendarWeekday?: (weekday: string, time: string) => string;
  durationShortUnits?: Partial<Record<ShortDurationUnit, string>>;
  durationShortJoin?: (parts: readonly string[]) => string;
}
