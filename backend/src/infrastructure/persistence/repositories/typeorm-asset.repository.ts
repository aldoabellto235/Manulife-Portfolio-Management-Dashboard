import { inject, injectable } from 'tsyringe';
import { DataSource, OptimisticLockVersionMismatchError, Repository } from 'typeorm';
import { IAssetRepository } from '../../../domain/repositories/asset.repository';
import { PaginatedResult } from '../../../shared/pagination';
import { Asset } from '../../../domain/entities/asset.entity';
import { AssetId, UserId } from '../../../domain/value-objects/branded';
import { AssetModel } from '../typeorm/models/asset.model';
import { AssetMapper } from '../mappers/asset.mapper';

@injectable()
export class TypeOrmAssetRepository implements IAssetRepository {
  private readonly repo: Repository<AssetModel>;

  constructor(@inject('DataSource') dataSource: DataSource) {
    this.repo = dataSource.getRepository(AssetModel);
  }

  async findById(id: AssetId): Promise<Asset | null> {
    const raw = await this.repo.findOneBy({ id });
    return raw ? AssetMapper.toDomain(raw) : null;
  }

  async findByUserId(userId: UserId): Promise<Asset[]> {
    const rows = await this.repo.findBy({ userId });
    return rows.map(AssetMapper.toDomain);
  }

  async findByUserIdPaginated(userId: UserId, page: number, limit: number): Promise<PaginatedResult<Asset>> {
    const [rows, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items: rows.map(AssetMapper.toDomain), total };
  }

  async findByIdAndUserId(id: AssetId, userId: UserId): Promise<Asset | null> {
    const raw = await this.repo.findOneBy({ id, userId });
    return raw ? AssetMapper.toDomain(raw) : null;
  }

  async save(asset: Asset): Promise<void> {
    await this.repo.save(AssetMapper.toPersistence(asset));
  }

  async update(asset: Asset): Promise<void> {
    try {
      await this.repo.save(AssetMapper.toPersistence(asset));
    } catch (err) {
      if (err instanceof OptimisticLockVersionMismatchError) {
        throw Object.assign(new Error('CONCURRENT_MODIFICATION'), { type: 'CONCURRENT_MODIFICATION' });
      }
      throw err;
    }
  }

  async delete(id: AssetId): Promise<void> {
    await this.repo.delete(id);
  }
}
