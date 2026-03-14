import 'reflect-metadata';
import { PerformanceCalculatorService } from '../performance-calculator.service';
import { Asset } from '../../entities/asset.entity';
import { AssetId, UserId } from '../../value-objects/branded';
import { Money } from '../../value-objects/money.vo';

const makeAsset = (purchasePrice: number, currentValue: number, quantity: number): Asset =>
  Asset.create({
    id: AssetId('asset-1'),
    userId: UserId('user-1'),
    type: 'STOCK',
    name: 'Test',
    symbol: 'TST',
    purchasePrice: Money.create(purchasePrice, 'IDR').unwrap(),
    currentValue: Money.create(currentValue, 'IDR').unwrap(),
    quantity,
  }).unwrap();

describe('PerformanceCalculatorService', () => {
  const calculator = new PerformanceCalculatorService();

  it('returns all zeros for empty asset list', () => {
    const result = calculator.calculate([]);
    expect(result).toEqual({
      totalPurchaseValue: 0,
      totalCurrentValue: 0,
      totalGainLoss: 0,
      gainLossPercent: 0,
    });
  });

  it('calculates correctly for a single asset with gain', () => {
    const asset = makeAsset(8000, 10000, 10);
    const result = calculator.calculate([asset]);
    // purchase total = 8000 * 10 = 80000
    // current total = 10000 * 10 = 100000
    // gain = 20000, gainPct = 20000/80000*100 = 25%
    expect(result.totalPurchaseValue).toBe(80000);
    expect(result.totalCurrentValue).toBe(100000);
    expect(result.totalGainLoss).toBe(20000);
    expect(result.gainLossPercent).toBeCloseTo(25);
  });

  it('calculates correctly for a single asset with loss', () => {
    const asset = makeAsset(10000, 8000, 5);
    const result = calculator.calculate([asset]);
    // purchase = 50000, current = 40000, loss = -10000, pct = -20%
    expect(result.totalPurchaseValue).toBe(50000);
    expect(result.totalCurrentValue).toBe(40000);
    expect(result.totalGainLoss).toBe(-10000);
    expect(result.gainLossPercent).toBeCloseTo(-20);
  });

  it('aggregates multiple assets', () => {
    const asset1 = makeAsset(8000, 10000, 10); // purchase=80000, current=100000
    const asset2 = makeAsset(5000, 4000, 5);   // purchase=25000, current=20000
    const result = calculator.calculate([asset1, asset2]);
    // total purchase = 105000, total current = 120000
    // gain = 15000, pct = 15000/105000*100 ≈ 14.28%
    expect(result.totalPurchaseValue).toBe(105000);
    expect(result.totalCurrentValue).toBe(120000);
    expect(result.totalGainLoss).toBe(15000);
    expect(result.gainLossPercent).toBeCloseTo(14.28, 1);
  });

  it('returns gainLossPercent 0 when total purchase value is 0', () => {
    const asset = makeAsset(0, 10000, 10);
    const result = calculator.calculate([asset]);
    expect(result.gainLossPercent).toBe(0);
  });
});
