import { Asset } from '../entities/asset.entity';
import { AssetId, UserId } from '../value-objects/branded';
import { PaginatedResult } from '../../shared/pagination';

export type { PaginatedResult };

export interface IAssetRepository {
  findById(id: AssetId): Promise<Asset | null>;
  findByUserId(userId: UserId): Promise<Asset[]>;
  findByUserIdPaginated(userId: UserId, page: number, limit: number): Promise<PaginatedResult<Asset>>;
  findByIdAndUserId(id: AssetId, userId: UserId): Promise<Asset | null>;
  save(asset: Asset): Promise<void>;
  update(asset: Asset): Promise<void>;
  delete(id: AssetId): Promise<void>;
}
