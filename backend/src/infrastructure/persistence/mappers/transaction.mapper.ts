import { Transaction } from '../../../domain/entities/transaction.entity';
import { AssetId, TransactionId, UserId } from '../../../domain/value-objects/branded';
import { Money } from '../../../domain/value-objects/money.vo';
import { TransactionModel } from '../typeorm/models/transaction.model';

export class TransactionMapper {
  static toDomain(raw: TransactionModel): Transaction {
    return Transaction.reconstitute({
      id: TransactionId(raw.id),
      userId: UserId(raw.userId),
      assetId: AssetId(raw.assetId),
      type: raw.type,
      quantity: raw.quantity,
      price: Money.create(raw.price, raw.currency).unwrap(),
      date: raw.date,
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(tx: Transaction): TransactionModel {
    const model = new TransactionModel();
    model.id = tx.id;
    model.userId = tx.userId;
    model.assetId = tx.assetId;
    model.type = tx.type;
    model.quantity = tx.quantity;
    model.price = tx.price.amount;
    model.currency = tx.price.currency;
    model.date = tx.date;
    model.createdAt = tx.createdAt;
    return model;
  }
}
