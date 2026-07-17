# temporal-humanize

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
import { fromNow, toNow } from 'temporal-humanize';

const twoHoursAgo = Temporal.Now.instant().subtract({ hours: 2 });
fromNow(twoHoursAgo); // "2 hours ago"

const inThreeDays = Temporal.Now.instant().add({ hours: 72 });
toNow(inThreeDays); // "in 3 days"
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

`humanizeDuration` and calendar-relative formatting (e.g. "yesterday",
"next Tuesday") are planned but not yet implemented.
