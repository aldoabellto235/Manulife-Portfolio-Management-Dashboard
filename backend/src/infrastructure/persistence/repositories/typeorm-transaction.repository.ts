import { inject, injectable } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository';
import { PaginatedResult } from '../../../domain/repositories/asset.repository';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { AssetId, TransactionId, UserId } from '../../../domain/value-objects/branded';
import { TransactionModel } from '../typeorm/models/transaction.model';
import { TransactionMapper } from '../mappers/transaction.mapper';

@injectable()
export class TypeOrmTransactionRepository implements ITransactionRepository {
  private readonly repo: Repository<TransactionModel>;

  constructor(@inject('DataSource') dataSource: DataSource) {
    this.repo = dataSource.getRepository(TransactionModel);
  }

  async findById(id: TransactionId): Promise<Transaction | null> {
    const raw = await this.repo.findOneBy({ id });
    return raw ? TransactionMapper.toDomain(raw) : null;
  }

  async findByIdAndUserId(id: TransactionId, userId: UserId): Promise<Transaction | null> {
    const raw = await this.repo.findOneBy({ id, userId });
    return raw ? TransactionMapper.toDomain(raw) : null;
  }

  async findByUserId(userId: UserId, page: number, limit: number): Promise<PaginatedResult<Transaction>> {
    const [rows, total] = await this.repo.findAndCount({
      where: { userId },
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items: rows.map(TransactionMapper.toDomain), total };
  }

  async findByAssetId(assetId: AssetId, page: number, limit: number): Promise<PaginatedResult<Transaction>> {
    const [rows, total] = await this.repo.findAndCount({
      where: { assetId },
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items: rows.map(TransactionMapper.toDomain), total };
  }

  async save(transaction: Transaction): Promise<void> {
    await this.repo.save(TransactionMapper.toPersistence(transaction));
  }

  async delete(id: TransactionId): Promise<void> {
    await this.repo.delete(id);
  }
}
