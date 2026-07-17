import { describe, expect, it } from 'vitest';
import { selectUnit } from '../src/internal/unit-select.js';

describe('selectUnit', () => {
  it('returns zero-value second for sub-0.5s magnitude', () => {
    expect(selectUnit(0)).toEqual({ unit: 'second', value: 0 });
    expect(selectUnit(0.4)).toEqual({ unit: 'second', value: 0 });
    expect(selectUnit(-0.4)).toEqual({ unit: 'second', value: 0 });
  });

  it('rounds seconds under 45s', () => {
    expect(selectUnit(1)).toEqual({ unit: 'second', value: 1 });
    expect(selectUnit(44)).toEqual({ unit: 'second', value: 44 });
  });

  it('treats exactly 60s as 1 minute', () => {
    expect(selectUnit(60)).toEqual({ unit: 'minute', value: 1 });
  });

  it('handles the 45s-90s single-minute band', () => {
    expect(selectUnit(45)).toEqual({ unit: 'minute', value: 1 });
    expect(selectUnit(89)).toEqual({ unit: 'minute', value: 1 });
  });

  it('rounds minutes between 90s and 45min', () => {
    expect(selectUnit(90)).toEqual({ unit: 'minute', value: 2 });
    expect(selectUnit(45 * 60 - 1)).toEqual({ unit: 'minute', value: 45 });
  });

  it('handles the 45min-90min single-hour band', () => {
    expect(selectUnit(45 * 60)).toEqual({ unit: 'hour', value: 1 });
    expect(selectUnit(90 * 60 - 1)).toEqual({ unit: 'hour', value: 1 });
  });

  it('rounds hours between 90min and 22h', () => {
    expect(selectUnit(90 * 60)).toEqual({ unit: 'hour', value: 2 });
    expect(selectUnit(22 * 3600 - 1)).toEqual({ unit: 'hour', value: 22 });
  });

  it('treats exactly 24h as 1 day', () => {
    expect(selectUnit(24 * 3600)).toEqual({ unit: 'day', value: 1 });
  });

  it('handles the 22h-36h single-day band', () => {
    expect(selectUnit(22 * 3600)).toEqual({ unit: 'day', value: 1 });
    expect(selectUnit(36 * 3600 - 1)).toEqual({ unit: 'day', value: 1 });
  });

  it('rounds days between 36h and 6 days', () => {
    expect(selectUnit(36 * 3600)).toEqual({ unit: 'day', value: 2 });
    expect(selectUnit(6 * 86400 - 1)).toEqual({ unit: 'day', value: 6 });
  });

  it('handles the 6day-11day single-week band', () => {
    expect(selectUnit(6 * 86400)).toEqual({ unit: 'week', value: 1 });
    expect(selectUnit(11 * 86400 - 1)).toEqual({ unit: 'week', value: 1 });
  });

  it('rounds weeks between 11 days and 3.5 weeks', () => {
    expect(selectUnit(11 * 86400)).toEqual({ unit: 'week', value: 2 });
    expect(selectUnit(3.5 * 604800 - 1)).toEqual({ unit: 'week', value: 3 });
  });

  it('handles the 3.5week-45day single-month band', () => {
    expect(selectUnit(3.5 * 604800)).toEqual({ unit: 'month', value: 1 });
    expect(selectUnit(45 * 86400 - 1)).toEqual({ unit: 'month', value: 1 });
  });

  it('rounds months between 45 days and 11 months', () => {
    expect(selectUnit(45 * 86400)).toEqual({ unit: 'month', value: 1 });
    expect(selectUnit(4000000)).toEqual({ unit: 'month', value: 2 });
    expect(selectUnit(11 * 2629800 - 1)).toEqual({ unit: 'month', value: 11 });
  });

  it('handles the 11month-18month single-year band', () => {
    expect(selectUnit(11 * 2629800)).toEqual({ unit: 'year', value: 1 });
    expect(selectUnit(18 * 2629800 - 1)).toEqual({ unit: 'year', value: 1 });
  });

  it('rounds years at 18 months and beyond', () => {
    expect(selectUnit(18 * 2629800)).toEqual({ unit: 'year', value: 2 });
    expect(selectUnit(31557600 * 5)).toEqual({ unit: 'year', value: 5 });
  });

  it('ignores sign, operating on magnitude only', () => {
    expect(selectUnit(-90000)).toEqual({ unit: 'day', value: 1 });
    expect(selectUnit(90000)).toEqual({ unit: 'day', value: 1 });
  });
});
