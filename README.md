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
import { calendar, fromNow, humanizeDuration, toNow } from 'temporal-humanize';

const twoHoursAgo = Temporal.Now.instant().subtract({ hours: 2 });
fromNow(twoHoursAgo); // "2 hours ago"

const inThreeDays = Temporal.Now.instant().add({ hours: 72 });
toNow(inThreeDays); // "in 3 days"

const duration = Temporal.Duration.from({ days: 1, hours: 26, minutes: 5 });
humanizeDuration(duration); // "2 days, 2 hours, 5 minutes"

const yesterday = Temporal.Now.zonedDateTimeISO().subtract({ days: 1 });
calendar(yesterday); // "Yesterday at 3:00 PM"
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

### `calendar(value, options?)`

Formats a Temporal value as a calendar-relative string — day.js's
`calendar()` plugin, essentially: "Today at 3:00 PM", "Yesterday at 9:15
AM", "Last Monday at 3:00 PM", "Wednesday at 3:00 PM" — falling back to a
locale date string (e.g. "Jun 3, 2024") once the value is more than
`thresholdDays` (6 by default) away from now.

```ts
function calendar(value: CalendarInput, options?: CalendarOptions): string;
```

`value` accepts `Temporal.ZonedDateTime` or `Temporal.PlainDateTime`
(`Temporal.Instant` isn't accepted directly — convert it to a
`ZonedDateTime` with a timezone first, since a calendar day only makes
sense relative to a specific zone).

```ts
// output below varies with the current date/time and weekday
const now = Temporal.Now.zonedDateTimeISO();
calendar(now); // "Today at 3:00 PM"
calendar(now.subtract({ days: 1 })); // "Yesterday at 3:00 PM"
calendar(now.subtract({ days: 3 })); // "Last Sunday at 3:00 PM"
calendar(now.subtract({ days: 30 })); // "Jun 17, 2026" (dateStyle 'medium')
```

### `CalendarOptions`

```ts
interface CalendarOptions {
  locale?: string | readonly string[];
  relativeTo?: Temporal.ZonedDateTime | Temporal.PlainDateTime;
  timeFormat?: 'short' | 'medium' | 'long' | 'full';
  thresholdDays?: number;
}
```

- `locale` — passed through to `Intl.RelativeTimeFormat` (day word) and
  `Intl.DateTimeFormat` (weekday, time, fallback date). Falls back to
  English-only rendering for whichever formatter isn't available in the
  runtime.
- `relativeTo` — the reference point to compare against, instead of the
  current moment. Must match the timezone-awareness of `value`: pairing a
  `PlainDateTime` value with a `ZonedDateTime` `relativeTo` (or vice versa)
  throws a `RangeError`.
- `timeFormat` — maps to `Intl.DateTimeFormat`'s `timeStyle`. Defaults to
  `'short'` (e.g. "3:00 PM").
- `thresholdDays` — how many days away from now a value can be and still
  get relative (day/weekday) phrasing instead of falling back to a plain
  date string. Defaults to 6, applied symmetrically in both directions.

For `Temporal.ZonedDateTime` input, "today" means today in **the value's
own timezone** — `now` (or `relativeTo`) is converted into that zone before
the day difference is computed, the same way `fromNow`/`toNow` treat
`ZonedDateTime` as timezone-aware. For `Temporal.PlainDateTime` input,
there's no timezone to convert into: "today" is whatever day `now` happens
to be on as wall-clock time. The day boundary itself is always computed as
plain calendar-date arithmetic, so DST transitions never shift which
bucket a `ZonedDateTime` value lands in.

The structural words "at" and "Last" render in English by default — only
the day/weekday word and the time portion are localized through Intl. This
package ships no built-in non-English glue words for these, but they can be
overridden per locale — see [Adding a translation](#adding-a-translation)
below.

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

## Adding a translation

Most of what this package renders is already localized through `Intl` —
day words, weekday names, times, numbers, and long-style duration wording
all follow `options.locale` with no extra setup. A small number of
structural "glue" strings aren't produced by any `Intl` formatter, though,
and this package doesn't ship non-English wording for them: shipping and
maintaining accurate translations for arbitrary locales is out of scope
for a library this size, and getting it subtly wrong is worse than not
having it. Instead, `registerLocale` lets any consumer — an app, or a
separate npm package — supply exactly these strings for whichever locales
it cares about.

**What's registerable** (all fields optional, via `LocaleTranslations`):

| Field                 | Default                             | Used by                                          |
| --------------------- | ----------------------------------- | ------------------------------------------------ |
| `now`                 | `'now'`                             | `fromNow`/`toNow`, zero-delta case               |
| `calendarDay`         | `` (w, t) => `${w} at ${t}` ``      | `calendar()`, today/yesterday/tomorrow bucket    |
| `calendarLastWeekday` | `` (w, t) => `Last ${w} at ${t}` `` | `calendar()`, last-week bucket                   |
| `calendarWeekday`     | `` (w, t) => `${w} at ${t}` ``      | `calendar()`, next-week bucket                   |
| `durationShortUnits`  | `{ y, mo, w, d, h, m, s, ms }`      | `humanizeDuration()`, short style, per unit      |
| `durationShortJoin`   | `(parts) => parts.join(' ')`        | `humanizeDuration()`, short style, joining parts |

Everything **not** in this table — the day/weekday word itself, the time
portion, number formatting, and all of long-style duration wording — comes
from `Intl` and is **not** overridable through this API; pass a `locale`
to the relevant function as usual for those.

```ts
function registerLocale(locale: string, translations: Partial<LocaleTranslations>): void;
function unregisterLocale(locale: string): void;
function clearLocales(): void;
function getRegisteredLocales(): string[];
```

- `registerLocale(locale, translations)` — registers translations for a
  locale key. Calling it more than once for the same `locale` **merges**
  with whatever was registered previously rather than replacing it, so
  fields can be supplied incrementally across multiple calls without
  clobbering earlier ones.
- `unregisterLocale(locale)` — removes everything registered for a single
  locale key. A no-op if nothing was registered for it.
- `clearLocales()` — removes every registered locale, restoring English
  defaults everywhere. Mainly useful for test teardown.
- `getRegisteredLocales()` — returns the currently registered locale keys.

Locale keys resolve the same way `Intl` locale matching intuitively
suggests: a request for `'es-MX'` checks `'es-MX'` first, then falls back
to the base language subtag `'es'` if `'es-MX'` itself isn't registered.
The same applies to each entry when `locale` is an array.

The example below uses only placeholder text — swap `'<...>'` for whatever
your own locale's wording should be; this package intentionally doesn't
suggest real translations:

```ts
import { registerLocale } from 'temporal-humanize';

registerLocale('xx', {
  now: '<your now word>',
  calendarDay: (dayWord, time) => `${dayWord} <at> ${time}`,
  calendarLastWeekday: (weekday, time) => `<last> ${weekday} <at> ${time}`,
  calendarWeekday: (weekday, time) => `${weekday} <at> ${time}`,
  durationShortUnits: { hours: '<h>' },
  durationShortJoin: (parts) => parts.join(' '),
});
```

`registerLocale`/`unregisterLocale`/`clearLocales`/`getRegisteredLocales`
are named exports the rest of the package never calls internally on your
behalf — if an app never imports them, a bundler can tree-shake them away
entirely (this package sets `"sideEffects": false` and ships only named
exports).

## Roadmap

Nothing currently planned beyond what's documented above.
