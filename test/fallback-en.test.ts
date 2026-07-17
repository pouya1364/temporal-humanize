import { describe, expect, it } from 'vitest';
import { formatEnFallback } from '../src/internal/fallback-en.js';

describe('formatEnFallback', () => {
  it('renders zero as "now"', () => {
    expect(formatEnFallback(0, 'second')).toBe('now');
  });

  it('renders singular past phrasing', () => {
    expect(formatEnFallback(-1, 'day')).toBe('1 day ago');
  });

  it('renders plural past phrasing', () => {
    expect(formatEnFallback(-3, 'day')).toBe('3 days ago');
  });

  it('renders singular future phrasing', () => {
    expect(formatEnFallback(1, 'week')).toBe('in 1 week');
  });

  it('renders plural future phrasing', () => {
    expect(formatEnFallback(5, 'week')).toBe('in 5 weeks');
  });

  it('covers every unit', () => {
    expect(formatEnFallback(2, 'second')).toBe('in 2 seconds');
    expect(formatEnFallback(2, 'minute')).toBe('in 2 minutes');
    expect(formatEnFallback(2, 'hour')).toBe('in 2 hours');
    expect(formatEnFallback(2, 'day')).toBe('in 2 days');
    expect(formatEnFallback(2, 'week')).toBe('in 2 weeks');
    expect(formatEnFallback(2, 'month')).toBe('in 2 months');
    expect(formatEnFallback(2, 'year')).toBe('in 2 years');
  });
});
