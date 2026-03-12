import { inject, injectable } from 'tsyringe';
import { err, ok, Result } from '../../../shared/result';
import { AssetId, UserId } from '../../../domain/value-objects/branded';
import { AssetError } from '../../../domain/errors/asset.errors';
import { IAssetRepository } from '../../../domain/repositories/asset.repository';

@injectable()
export class DeleteInvestmentUseCase {
  constructor(
    @inject('IAssetRepository') private readonly assetRepo: IAssetRepository,
  ) {}

  async execute(assetId: string, userId: string): Promise<Result<void, AssetError>> {
    const asset = await this.assetRepo.findByIdAndUserId(
      AssetId(assetId),
      UserId(userId),
    );

    if (!asset) return err({ type: 'ASSET_NOT_FOUND', assetId });
    if (!asset.isOwnedBy(UserId(userId))) {
      return err({ type: 'ASSET_OWNERSHIP_VIOLATION', userId });
    }

    await this.assetRepo.delete(AssetId(assetId));
    return ok(undefined);
  }
}
