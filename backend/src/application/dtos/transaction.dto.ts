import { Transaction } from '../../domain/entities/transaction.entity';

export interface TransactionDTO {
  id: string;
  userId: string;
  assetId: string;
  type: string;
  quantity: number;
  price: number;
  currency: string;
  totalValue: number;
  date: string;
  createdAt: string;
}

export const toTransactionDTO = (t: Transaction): TransactionDTO => ({
  id: t.id,
  userId: t.userId,
  assetId: t.assetId,
  type: t.type,
  quantity: t.quantity,
  price: t.price.amount,
  currency: t.price.currency,
  totalValue: t.totalValue,
  date: t.date.toISOString(),
  createdAt: t.createdAt.toISOString(),
});
