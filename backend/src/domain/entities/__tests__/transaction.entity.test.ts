import { Transaction } from '../transaction.entity';
import { AssetId, TransactionId, UserId } from '../../value-objects/branded';
import { Money } from '../../value-objects/money.vo';

const makeTx = (overrides: { quantity?: number; price?: number; type?: 'BUY' | 'SELL' } = {}) =>
  Transaction.create({
    id: TransactionId('tx-1'),
    userId: UserId('user-1'),
    assetId: AssetId('asset-1'),
    type: overrides.type ?? 'BUY',
    quantity: overrides.quantity ?? 10,
    price: Money.create(overrides.price ?? 9000, 'IDR').unwrap(),
    date: new Date('2025-01-01'),
  }).unwrap();

describe('Transaction', () => {
  describe('create', () => {
    it('creates a valid BUY transaction', () => {
      const tx = makeTx({ type: 'BUY' });
      expect(tx.type).toBe('BUY');
      expect(tx.quantity).toBe(10);
      expect(tx.price.amount).toBe(9000);
    });

    it('creates a valid SELL transaction', () => {
      const tx = makeTx({ type: 'SELL' });
      expect(tx.type).toBe('SELL');
    });

    it('sets createdAt automatically', () => {
      const before = new Date();
      const tx = makeTx();
      expect(tx.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('returns INVALID_QUANTITY error for quantity <= 0', () => {
      const result = Transaction.create({
        id: TransactionId('tx-1'),
        userId: UserId('user-1'),
        assetId: AssetId('asset-1'),
        type: 'BUY',
        quantity: 0,
        price: Money.create(9000, 'IDR').unwrap(),
        date: new Date(),
      });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error.type).toBe('INVALID_QUANTITY');
    });

    it('returns INVALID_QUANTITY error for negative quantity', () => {
      const result = Transaction.create({
        id: TransactionId('tx-1'),
        userId: UserId('user-1'),
        assetId: AssetId('asset-1'),
        type: 'BUY',
        quantity: -5,
        price: Money.create(9000, 'IDR').unwrap(),
        date: new Date(),
      });
      expect(result.isErr()).toBe(true);
    });
  });

  describe('totalValue', () => {
    it('calculates totalValue as price * quantity', () => {
      const tx = makeTx({ quantity: 5, price: 9000 });
      expect(tx.totalValue).toBe(45000);
    });

    it('calculates correctly for large values', () => {
      const tx = makeTx({ quantity: 100, price: 50000 });
      expect(tx.totalValue).toBe(5000000);
    });
  });

  describe('isOwnedBy', () => {
    it('returns true for the owner', () => {
      const tx = makeTx();
      expect(tx.isOwnedBy(UserId('user-1'))).toBe(true);
    });

    it('returns false for a different user', () => {
      const tx = makeTx();
      expect(tx.isOwnedBy(UserId('user-2'))).toBe(false);
    });
  });
});
