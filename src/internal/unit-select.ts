export type RelativeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface SelectedUnit {
  unit: RelativeUnit;
  value: number;
}

/**
 * Picks the coarsest sensible unit for a magnitude of seconds, following the
 * same threshold ladder used by day.js / moment's humanize. Returns an
 * unsigned value; the caller reapplies the sign of the original delta.
 *
 * @example
 * ```ts
 * import { selectUnit } from './unit-select.js';
 *
 * selectUnit(90000); // { unit: 'day', value: 1 }
 * ```
 */
export function selectUnit(deltaSeconds: number): SelectedUnit {
  const s = Math.abs(deltaSeconds);

  if (s < 0.5) return { unit: 'second', value: 0 };
  if (s < 45) return { unit: 'second', value: Math.round(s) };
  if (s < 90) return { unit: 'minute', value: 1 };
  if (s < 45 * 60) return { unit: 'minute', value: Math.round(s / 60) };
  if (s < 90 * 60) return { unit: 'hour', value: 1 };
  if (s < 22 * 3600) return { unit: 'hour', value: Math.round(s / 3600) };
  if (s < 36 * 3600) return { unit: 'day', value: 1 };
  if (s < 6 * 86400) return { unit: 'day', value: Math.round(s / 86400) };
  if (s < 11 * 86400) return { unit: 'week', value: 1 };
  if (s < 3.5 * 604800) return { unit: 'week', value: Math.round(s / 604800) };
  if (s < 45 * 86400) return { unit: 'month', value: 1 };
  if (s < 11 * 2629800) return { unit: 'month', value: Math.round(s / 2629800) };
  if (s < 18 * 2629800) return { unit: 'year', value: 1 };
  return { unit: 'year', value: Math.round(s / 31557600) };
}
