import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, formatPercent } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats IDR with no decimals', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1.000.000');
  });

  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('formats large values', () => {
    const result = formatCurrency(1500000000);
    expect(result).toContain('1.500.000.000');
  });

  it('uses provided currency code', () => {
    const result = formatCurrency(100, 'USD', 'en-US');
    expect(result).toContain('100');
    expect(result).toContain('$');
  });
});

describe('formatNumber', () => {
  it('formats with 2 decimal places by default', () => {
    expect(formatNumber(1234.5)).toBe('1,234.50');
  });

  it('formats with custom decimal places', () => {
    expect(formatNumber(1234.5678, 3)).toBe('1,234.568');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0.00');
  });

  it('rounds correctly', () => {
    expect(formatNumber(1.005, 2)).toBe('1.01');
  });
});

describe('formatPercent', () => {
  it('adds + sign for positive values', () => {
    expect(formatPercent(5.5)).toBe('+5.50%');
  });

  it('keeps - sign for negative values', () => {
    expect(formatPercent(-3.25)).toBe('-3.25%');
  });

  it('adds + sign for zero', () => {
    expect(formatPercent(0)).toBe('+0.00%');
  });

  it('respects custom decimal places', () => {
    expect(formatPercent(12.3456, 1)).toBe('+12.3%');
  });
});
