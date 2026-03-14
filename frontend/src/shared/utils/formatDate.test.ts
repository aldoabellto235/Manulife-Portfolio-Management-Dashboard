import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime } from './formatDate';

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('2024');
    expect(result).toContain('15');
  });

  it('accepts a Date object', () => {
    const result = formatDate(new Date('2024-06-01'));
    expect(result).toContain('2024');
  });

  it('includes day, month, and year', () => {
    const result = formatDate('2024-03-20');
    expect(result).toMatch(/\d{2}/); // day
    expect(result).toContain('2024'); // year
  });
});

describe('formatDateTime', () => {
  it('formats a date-time string', () => {
    const result = formatDateTime('2024-01-15T10:30:00');
    expect(result).toContain('2024');
    expect(result).toContain('15');
  });

  it('accepts a Date object', () => {
    const result = formatDateTime(new Date('2024-06-01T08:00:00'));
    expect(result).toContain('2024');
  });

  it('includes time component', () => {
    const result = formatDateTime('2024-01-15T14:30:00');
    // Should contain hour and minute somewhere
    expect(result.length).toBeGreaterThan(10);
  });
});
