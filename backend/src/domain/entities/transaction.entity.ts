import { err, ok, Result } from '../../shared/result';
import { AssetId, TransactionId, UserId } from '../value-objects/branded';
import { Money } from '../value-objects/money.vo';
import { TransactionError } from '../errors/transaction.errors';

export type TransactionType = 'BUY' | 'SELL';

interface TransactionProps {
  id: TransactionId;
  userId: UserId;
  assetId: AssetId;
  type: TransactionType;
  quantity: number;
  price: Money;
  date: Date;
  createdAt: Date;
}

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  static create(
    props: Omit<TransactionProps, 'createdAt'>,
  ): Result<Transaction, TransactionError> {
    if (props.quantity <= 0) {
      return err({ type: 'INVALID_QUANTITY', provided: props.quantity });
    }
    return ok(new Transaction({ ...props, createdAt: new Date() }));
  }

  static reconstitute(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  get id(): TransactionId { return this.props.id; }
  get userId(): UserId { return this.props.userId; }
  get assetId(): AssetId { return this.props.assetId; }
  get type(): TransactionType { return this.props.type; }
  get quantity(): number { return this.props.quantity; }
  get price(): Money { return this.props.price; }
  get date(): Date { return this.props.date; }
  get createdAt(): Date { return this.props.createdAt; }

  get totalValue(): number {
    return this.props.price.amount * this.props.quantity;
  }

  isOwnedBy(userId: UserId): boolean {
    return this.props.userId === userId;
  }
}
