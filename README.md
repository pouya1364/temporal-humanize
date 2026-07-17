# temporal-humanize

[![npm version](https://img.shields.io/npm/v/temporal-humanize.svg)](https://www.npmjs.com/package/temporal-humanize)
[![bundle size](https://img.shields.io/bundlephobia/minzip/temporal-humanize)](https://bundlephobia.com/package/temporal-humanize)
[![license](https://img.shields.io/npm/l/temporal-humanize.svg)](./LICENSE)
[![downloads](https://img.shields.io/npm/dm/temporal-humanize.svg)](https://www.npmjs.com/package/temporal-humanize)

Human-readable relative time formatting built on the [Temporal API](https://tc39.es/proposal-temporal/docs/).

## Install

```sh
npm install temporal-humanize
```

`Temporal` is available natively in newer JS engines. If you're targeting a
runtime without it yet, also install the polyfill as a peer dependency:

```sh
npm install temporal-polyfill
```

`temporal-polyfill` is an optional peer dependency — install it only if
`globalThis.Temporal` isn't already available.

## Quickstart

```ts
import { Temporal } from 'temporal-polyfill';
import { fromNow, humanizeDuration, toNow } from 'temporal-humanize';

const twoHoursAgo = Temporal.Now.instant().subtract({ hours: 2 });
fromNow(twoHoursAgo); // "2 hours ago"

const inThreeDays = Temporal.Now.instant().add({ hours: 72 });
toNow(inThreeDays); // "in 3 days"

const duration = Temporal.Duration.from({ days: 1, hours: 26, minutes: 5 });
humanizeDuration(duration); // "2 days, 2 hours, 5 minutes"
```

## API

### `fromNow(value, options?)` / `toNow(value, options?)`

Both format a Temporal value relative to now (or an explicit reference
point) and auto-detect direction from the sign of the difference. In this
version they're behaviorally identical — kept as separate exports so call
sites can express intent, even though the output doesn't currently diverge.

```ts
function fromNow(value: TemporalInput, options?: RelativeTimeOptions): string;
function toNow(value: TemporalInput, options?: RelativeTimeOptions): string;
```

`value` accepts `Temporal.Instant`, `Temporal.ZonedDateTime`, or
`Temporal.PlainDateTime`.

### `RelativeTimeOptions`

```ts
interface RelativeTimeOptions {
  locale?: string | readonly string[];
  relativeTo?: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDateTime;
  style?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
}
```

- `locale` — passed through to `Intl.RelativeTimeFormat`. Falls back to an
  English-only formatter if `Intl.RelativeTimeFormat` isn't available in the
  runtime.
- `relativeTo` — the reference point to compare against, instead of the
  current moment. Must match the timezone-awareness of `value`: pairing a
  `PlainDateTime` value with a tz-aware `relativeTo` (or vice versa) throws a
  `RangeError`.
- `style` / `numeric` — forwarded to `Intl.RelativeTimeFormat`.

### `humanizeDuration(duration, options?)`

Formats a `Temporal.Duration` as a human-readable string. The magnitude is
balanced up into a small ladder of units (years down to milliseconds) and
capped to a handful of units by default, rounding the last unit shown.

```ts
function humanizeDuration(duration: Temporal.Duration, options?: HumanizeDurationOptions): string;
```

```ts
const duration = Temporal.Duration.from({ hours: 3, minutes: 15 });
humanizeDuration(duration); // "3 hours, 15 minutes"
humanizeDuration(duration, { style: 'short' }); // "3h 15m"
```

### `HumanizeDurationOptions`

```ts
interface HumanizeDurationOptions {
  largestUnit?: 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds';
  style?: 'long' | 'short';
  locale?: string | readonly string[];
  maxUnits?: number;
}
```

- `largestUnit` — the unit to balance up to. If omitted, balancing defaults
  to `'hours'` unless the duration's own fields already carry a non-zero
  days/weeks/months/years value, in which case the largest such populated
  field is used. Balancing into weeks/months/years uses a fixed-ratio
  approximation (a week is 7 days, a month 30.44 days, a year 365.25 days) —
  the same convention `fromNow`/`toNow` use for their unit thresholds —
  since `Temporal.Duration` needs a `relativeTo` date to balance calendar
  units exactly.
- `style` — `'long'` uses `Intl.DurationFormat` when available (English-only
  fallback otherwise); `'short'` always uses a compact renderer (`1d 2h 15m`)
  regardless of `Intl.DurationFormat` support.
- `locale` — passed through to `Intl.DurationFormat` (long style) and
  `Intl.NumberFormat` (short style, for digit shaping).
- `maxUnits` — the maximum number of units shown, defaulting to 3. Pass
  `Infinity` to disable capping and render full precision down to
  milliseconds.

A negative duration is rendered with a single leading `-` on the whole
string, e.g. `"-3 hours, 15 minutes"`, rather than negating each unit.

### PlainDateTime vs ZonedDateTime / Instant

- `Temporal.PlainDateTime` is wall-clock time with no timezone attached.
  Differences are computed as plain calendar/clock math, with no notion of
  DST — a PlainDateTime 24 hours later is always "in 1 day" even across a
  DST transition in some timezone, because there is no timezone in the
  calculation at all.
- `Temporal.Instant` and `Temporal.ZonedDateTime` are timezone-aware.
  Differences are computed from absolute instants, so results stay correct
  across DST transitions — the same wall-clock offset can resolve to a
  different elapsed duration depending on the zone's DST rules.

## Roadmap

Calendar-relative formatting (e.g. "yesterday", "next Tuesday") is planned
but not yet implemented.
