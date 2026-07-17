export type TemporalInput = Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDateTime;

export type LocaleInput = string | readonly string[];

export type NowReference = Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDateTime;

export interface RelativeTimeOptions {
  locale?: LocaleInput;
  relativeTo?: NowReference;
  style?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
}
