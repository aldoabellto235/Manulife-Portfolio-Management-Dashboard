import { inject, injectable } from 'tsyringe';
import { DataSource, EntityManager, OptimisticLockVersionMismatchError } from 'typeorm';
import { IUnitOfWork, IUnitOfWorkRepos } from '../../../application/ports/unit-of-work.port';
import { IAssetRepository } from '../../../domain/repositories/asset.repository';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository';
import { Asset } from '../../../domain/entities/asset.entity';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { AssetId, TransactionId, UserId } from '../../../domain/value-objects/branded';
import { PaginatedResult } from '../../../shared/pagination';
import { AssetModel } from './models/asset.model';
import { TransactionModel } from './models/transaction.model';
import { AssetMapper } from '../mappers/asset.mapper';
import { TransactionMapper } from '../mappers/transaction.mapper';

function makeAssetRepo(manager: EntityManager): IAssetRepository {
  const repo = manager.getRepository(AssetModel);
  return {
    findById: async (id: AssetId) => {
      const raw = await repo.findOneBy({ id });
      return raw ? AssetMapper.toDomain(raw) : null;
    },
    findByUserId: async (userId: UserId) => {
      const rows = await repo.findBy({ userId });
      return rows.map(AssetMapper.toDomain);
    },
    findByUserIdPaginated: async (userId: UserId, page: number, limit: number): Promise<PaginatedResult<Asset>> => {
      const [rows, total] = await repo.findAndCount({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { items: rows.map(AssetMapper.toDomain), total };
    },
    findByIdAndUserId: async (id: AssetId, userId: UserId) => {
      const raw = await repo.findOneBy({ id, userId });
      return raw ? AssetMapper.toDomain(raw) : null;
    },
    save: async (asset: Asset) => {
      await repo.save(AssetMapper.toPersistence(asset));
    },
    update: async (asset: Asset) => {
      try {
        await repo.save(AssetMapper.toPersistence(asset));
      } catch (err) {
        if (err instanceof OptimisticLockVersionMismatchError) {
          throw Object.assign(new Error('CONCURRENT_MODIFICATION'), { type: 'CONCURRENT_MODIFICATION' });
        }
        throw err;
      }
    },
    delete: async (id: AssetId) => {
      await repo.delete(id);
    },
  };
}

function makeTxRepo(manager: EntityManager): ITransactionRepository {
  const repo = manager.getRepository(TransactionModel);
  return {
    findById: async (id: TransactionId) => {
      const raw = await repo.findOneBy({ id });
      return raw ? TransactionMapper.toDomain(raw) : null;
    },
    findByIdAndUserId: async (id: TransactionId, userId: UserId) => {
      const raw = await repo.findOneBy({ id, userId });
      return raw ? TransactionMapper.toDomain(raw) : null;
    },
    findByUserId: async (userId: UserId, page: number, limit: number): Promise<PaginatedResult<Transaction>> => {
      const [rows, total] = await repo.findAndCount({
        where: { userId },
        order: { date: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { items: rows.map(TransactionMapper.toDomain), total };
    },
    findByAssetId: async (assetId: AssetId, page: number, limit: number): Promise<PaginatedResult<Transaction>> => {
      const [rows, total] = await repo.findAndCount({
        where: { assetId },
        order: { date: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { items: rows.map(TransactionMapper.toDomain), total };
    },
    save: async (transaction: Transaction) => {
      await repo.save(TransactionMapper.toPersistence(transaction));
    },
    delete: async (id: TransactionId) => {
      await repo.delete(id);
    },
  };
}

@injectable()
export class TypeOrmUnitOfWork implements IUnitOfWork {
  constructor(@inject('DataSource') private readonly dataSource: DataSource) {}

  run<T>(work: (repos: IUnitOfWorkRepos) => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) =>
      work({
        assetRepo: makeAssetRepo(manager),
        txRepo: makeTxRepo(manager),
      }),
    );
  }
}
