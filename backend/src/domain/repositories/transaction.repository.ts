import { Transaction } from '../entities/transaction.entity';
import { AssetId, TransactionId, UserId } from '../value-objects/branded';
import { PaginatedResult } from '../../shared/pagination';

export interface ITransactionRepository {
  findById(id: TransactionId): Promise<Transaction | null>;
  findByIdAndUserId(id: TransactionId, userId: UserId): Promise<Transaction | null>;
  findByUserId(userId: UserId, page: number, limit: number): Promise<PaginatedResult<Transaction>>;
  findByAssetId(assetId: AssetId, page: number, limit: number): Promise<PaginatedResult<Transaction>>;
  save(transaction: Transaction): Promise<void>;
  delete(id: TransactionId): Promise<void>;
}
