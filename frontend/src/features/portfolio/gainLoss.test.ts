import { describe, it, expect } from 'vitest';

// Pure gain/loss calculation logic mirrored from InvestmentForm.tsx
function calcGainLoss(purchasePrice: number, currentValue: number, quantity: number) {
  const totalCost = purchasePrice * quantity;
  const totalCurrent = currentValue * quantity;
  const gainLoss = totalCurrent - totalCost;
  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
  return { totalCost, totalCurrent, gainLoss, gainLossPercent };
}

describe('gain/loss calculation', () => {
  it('calculates gain correctly', () => {
    const result = calcGainLoss(9_500, 10_200, 100);
    expect(result.totalCost).toBe(950_000);
    expect(result.totalCurrent).toBe(1_020_000);
    expect(result.gainLoss).toBe(70_000);
    expect(result.gainLossPercent).toBeCloseTo(7.368, 2);
  });

  it('calculates loss correctly', () => {
    const result = calcGainLoss(10_000, 8_000, 50);
    expect(result.totalCost).toBe(500_000);
    expect(result.totalCurrent).toBe(400_000);
    expect(result.gainLoss).toBe(-100_000);
    expect(result.gainLossPercent).toBe(-20);
  });

  it('returns zero percent when totalCost is zero', () => {
    const result = calcGainLoss(0, 5_000, 10);
    expect(result.gainLossPercent).toBe(0);
  });

  it('returns zero gain when purchase equals current', () => {
    const result = calcGainLoss(5_000, 5_000, 10);
    expect(result.gainLoss).toBe(0);
    expect(result.gainLossPercent).toBe(0);
  });

  it('scales linearly with quantity', () => {
    const single = calcGainLoss(1_000, 1_200, 1);
    const multiple = calcGainLoss(1_000, 1_200, 10);
    expect(multiple.totalCost).toBe(single.totalCost * 10);
    expect(multiple.gainLoss).toBe(single.gainLoss * 10);
    expect(multiple.gainLossPercent).toBe(single.gainLossPercent);
  });
});
