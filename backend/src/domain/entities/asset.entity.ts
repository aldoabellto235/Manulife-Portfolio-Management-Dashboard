import { err, ok, Result } from '../../shared/result';
import { AssetId, UserId } from '../value-objects/branded';
import { Money } from '../value-objects/money.vo';
import { AssetError } from '../errors/asset.errors';


export type AssetType = 'STOCK' | 'BOND' | 'MUTUAL_FUND';

interface AssetProps {
  id: AssetId;
  userId: UserId;
  type: AssetType;
  name: string;
  symbol: string;
  purchasePrice: Money;
  currentValue: Money;
  quantity: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Asset {
  private constructor(private readonly props: AssetProps) {}

  static create(
    props: Omit<AssetProps, 'version' | 'createdAt' | 'updatedAt'>,
  ): Result<Asset, AssetError> {
    if (props.quantity <= 0) {
      return err({ type: 'INVALID_QUANTITY', provided: props.quantity });
    }
    const now = new Date();
    return ok(new Asset({ ...props, version: 1, createdAt: now, updatedAt: now }));
  }

  static reconstitute(props: AssetProps): Asset {
    return new Asset(props);
  }

  get id(): AssetId { return this.props.id; }
  get userId(): UserId { return this.props.userId; }
  get type(): AssetType { return this.props.type; }
  get name(): string { return this.props.name; }
  get symbol(): string { return this.props.symbol; }
  get purchasePrice(): Money { return this.props.purchasePrice; }
  get currentValue(): Money { return this.props.currentValue; }
  get quantity(): number { return this.props.quantity; }
  get version(): number { return this.props.version; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  isOwnedBy(userId: UserId): boolean {
    return this.props.userId === userId;
  }

  gainLossPercent(): number {
    const purchase = this.props.purchasePrice.amount;
    if (purchase === 0) return 0;
    return ((this.props.currentValue.amount - purchase) / purchase) * 100;
  }

  updateCurrentValue(newValue: Money): void {
    this.props.currentValue = newValue;
    this.props.updatedAt = new Date();
  }

  updateQuantity(quantity: number): void {
    this.props.quantity = quantity;
    this.props.updatedAt = new Date();
  }

  // Called when a BUY transaction is recorded.
  // Recalculates weighted average purchase price and increases quantity.
  addShares(qty: number, pricePerShare: Money): void {
    const currentTotal = this.props.purchasePrice.amount * this.props.quantity;
    const newTotal = pricePerShare.amount * qty;
    const newQuantity = this.props.quantity + qty;
    const newAvgPrice = (currentTotal + newTotal) / newQuantity;

    this.props.purchasePrice = Money.create(newAvgPrice, this.props.purchasePrice.currency).unwrap();
    this.props.quantity = newQuantity;
    this.props.updatedAt = new Date();
  }

  // Called when a SELL transaction is recorded.
  // Returns an error if the user tries to sell more than they hold.
  removeShares(qty: number): Result<void, AssetError> {
    if (qty > this.props.quantity) {
      return err({ type: 'INSUFFICIENT_QUANTITY', available: this.props.quantity, requested: qty });
    }
    this.props.quantity -= qty;
    this.props.updatedAt = new Date();
    return ok(undefined);
  }
}
