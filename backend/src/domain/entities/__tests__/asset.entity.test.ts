import { Asset } from '../asset.entity';
import { AssetId, UserId } from '../../value-objects/branded';
import { Money } from '../../value-objects/money.vo';

const makeAsset = (overrides: { quantity?: number; purchasePrice?: number; currentValue?: number } = {}) =>
  Asset.create({
    id: AssetId('asset-1'),
    userId: UserId('user-1'),
    type: 'STOCK',
    name: 'Bank BCA',
    symbol: 'BBCA',
    purchasePrice: Money.create(overrides.purchasePrice ?? 9000, 'IDR').unwrap(),
    currentValue: Money.create(overrides.currentValue ?? 10000, 'IDR').unwrap(),
    quantity: overrides.quantity ?? 10,
  }).unwrap();

describe('Asset', () => {
  describe('create', () => {
    it('creates with valid props and sets version to 1', () => {
      const asset = makeAsset();
      expect(asset.version).toBe(1);
      expect(asset.name).toBe('Bank BCA');
      expect(asset.symbol).toBe('BBCA');
      expect(asset.quantity).toBe(10);
    });

    it('returns INVALID_QUANTITY error for quantity <= 0', () => {
      const result = Asset.create({
        id: AssetId('asset-1'),
        userId: UserId('user-1'),
        type: 'STOCK',
        name: 'Bank BCA',
        symbol: 'BBCA',
        purchasePrice: Money.create(9000, 'IDR').unwrap(),
        currentValue: Money.create(10000, 'IDR').unwrap(),
        quantity: 0,
      });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error.type).toBe('INVALID_QUANTITY');
    });

    it('returns INVALID_QUANTITY error for negative quantity', () => {
      const result = Asset.create({
        id: AssetId('asset-1'),
        userId: UserId('user-1'),
        type: 'STOCK',
        name: 'Bank BCA',
        symbol: 'BBCA',
        purchasePrice: Money.create(9000, 'IDR').unwrap(),
        currentValue: Money.create(10000, 'IDR').unwrap(),
        quantity: -5,
      });
      expect(result.isErr()).toBe(true);
    });
  });

  describe('gainLossPercent', () => {
    it('calculates positive gain correctly', () => {
      const asset = makeAsset({ purchasePrice: 8000, currentValue: 10000 });
      // (10000 - 8000) / 8000 * 100 = 25%
      expect(asset.gainLossPercent()).toBeCloseTo(25);
    });

    it('calculates negative loss correctly', () => {
      const asset = makeAsset({ purchasePrice: 10000, currentValue: 8000 });
      // (8000 - 10000) / 10000 * 100 = -20%
      expect(asset.gainLossPercent()).toBeCloseTo(-20);
    });

    it('returns 0 when purchase price is 0', () => {
      const asset = Asset.create({
        id: AssetId('asset-1'),
        userId: UserId('user-1'),
        type: 'STOCK',
        name: 'Bank BCA',
        symbol: 'BBCA',
        purchasePrice: Money.create(0, 'IDR').unwrap(),
        currentValue: Money.create(10000, 'IDR').unwrap(),
        quantity: 10,
      }).unwrap();
      expect(asset.gainLossPercent()).toBe(0);
    });
  });

  describe('isOwnedBy', () => {
    it('returns true for the owner', () => {
      const asset = makeAsset();
      expect(asset.isOwnedBy(UserId('user-1'))).toBe(true);
    });

    it('returns false for a different user', () => {
      const asset = makeAsset();
      expect(asset.isOwnedBy(UserId('user-2'))).toBe(false);
    });
  });

  describe('addShares', () => {
    it('increases quantity', () => {
      const asset = makeAsset({ quantity: 10, purchasePrice: 9000 });
      asset.addShares(5, Money.create(9000, 'IDR').unwrap());
      expect(asset.quantity).toBe(15);
    });

    it('recalculates weighted average purchase price', () => {
      const asset = makeAsset({ quantity: 10, purchasePrice: 8000 });
      // Buy 10 more at 10000 → avg = (10*8000 + 10*10000) / 20 = 180000/20 = 9000
      asset.addShares(10, Money.create(10000, 'IDR').unwrap());
      expect(asset.purchasePrice.amount).toBeCloseTo(9000);
    });

    it('keeps same price when buying at same price', () => {
      const asset = makeAsset({ quantity: 10, purchasePrice: 9000 });
      asset.addShares(5, Money.create(9000, 'IDR').unwrap());
      expect(asset.purchasePrice.amount).toBeCloseTo(9000);
    });
  });

  describe('removeShares', () => {
    it('decreases quantity on success', () => {
      const asset = makeAsset({ quantity: 10 });
      const result = asset.removeShares(4);
      expect(result.isOk()).toBe(true);
      expect(asset.quantity).toBe(6);
    });

    it('allows selling all shares', () => {
      const asset = makeAsset({ quantity: 10 });
      const result = asset.removeShares(10);
      expect(result.isOk()).toBe(true);
      expect(asset.quantity).toBe(0);
    });

    it('returns INSUFFICIENT_QUANTITY when selling more than held', () => {
      const asset = makeAsset({ quantity: 5 });
      const result = asset.removeShares(10);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe('INSUFFICIENT_QUANTITY');
        expect((result.error as any).available).toBe(5);
        expect((result.error as any).requested).toBe(10);
      }
    });

    it('does not mutate quantity on failure', () => {
      const asset = makeAsset({ quantity: 5 });
      asset.removeShares(10);
      expect(asset.quantity).toBe(5);
    });
  });
});
