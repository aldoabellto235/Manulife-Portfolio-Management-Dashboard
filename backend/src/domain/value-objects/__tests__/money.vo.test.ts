import { Money } from '../money.vo';

describe('Money', () => {
  describe('create', () => {
    it('creates with valid amount and currency', () => {
      const result = Money.create(1000, 'IDR');
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().amount).toBe(1000);
      expect(result.unwrap().currency).toBe('IDR');
    });

    it('uppercases currency', () => {
      const result = Money.create(500, 'idr');
      expect(result.unwrap().currency).toBe('IDR');
    });

    it('accepts zero amount', () => {
      expect(Money.create(0, 'IDR').isOk()).toBe(true);
    });

    it('rejects negative amount', () => {
      const result = Money.create(-1, 'IDR');
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBe('INVALID_MONEY');
    });

    it('rejects Infinity', () => {
      expect(Money.create(Infinity, 'IDR').isErr()).toBe(true);
    });

    it('rejects NaN', () => {
      expect(Money.create(NaN, 'IDR').isErr()).toBe(true);
    });

    it('rejects currency shorter than 3 chars', () => {
      expect(Money.create(100, 'ID').isErr()).toBe(true);
    });

    it('rejects currency longer than 3 chars', () => {
      expect(Money.create(100, 'IDRA').isErr()).toBe(true);
    });

    it('rejects empty currency', () => {
      expect(Money.create(100, '').isErr()).toBe(true);
    });
  });

  describe('equals', () => {
    it('returns true for same amount and currency', () => {
      const a = Money.create(1000, 'IDR').unwrap();
      const b = Money.create(1000, 'IDR').unwrap();
      expect(a.equals(b)).toBe(true);
    });

    it('returns false for different amount', () => {
      const a = Money.create(1000, 'IDR').unwrap();
      const b = Money.create(2000, 'IDR').unwrap();
      expect(a.equals(b)).toBe(false);
    });

    it('returns false for different currency', () => {
      const a = Money.create(1000, 'IDR').unwrap();
      const b = Money.create(1000, 'USD').unwrap();
      expect(a.equals(b)).toBe(false);
    });
  });
});
