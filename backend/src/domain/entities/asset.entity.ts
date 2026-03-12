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
  createdAt: Date;
  updatedAt: Date;
}

export class Asset {
  private constructor(private readonly props: AssetProps) {}

  static create(
    props: Omit<AssetProps, 'createdAt' | 'updatedAt'>,
  ): Result<Asset, AssetError> {
    if (props.quantity <= 0) {
      return err({ type: 'INVALID_QUANTITY', provided: props.quantity });
    }
    const now = new Date();
    return ok(new Asset({ ...props, createdAt: now, updatedAt: now }));
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
}
