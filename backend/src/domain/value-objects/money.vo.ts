import { err, ok, Result } from '../../shared/result';

export class Money {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: string,
  ) {}

  static create(amount: number, currency: string): Result<Money, 'INVALID_MONEY'> {
    if (!Number.isFinite(amount) || amount < 0) return err('INVALID_MONEY');
    if (!currency || currency.trim().length !== 3) return err('INVALID_MONEY');
    return ok(new Money(amount, currency.toUpperCase()));
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }
}
