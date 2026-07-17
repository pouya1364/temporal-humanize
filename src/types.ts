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
