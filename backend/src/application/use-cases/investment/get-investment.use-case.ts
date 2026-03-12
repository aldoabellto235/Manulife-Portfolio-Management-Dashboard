import { inject, injectable } from 'tsyringe';
import { err, ok, Result } from '../../../shared/result';
import { AssetId, UserId } from '../../../domain/value-objects/branded';
import { AssetError } from '../../../domain/errors/asset.errors';
import { IAssetRepository } from '../../../domain/repositories/asset.repository';
import { AssetDTO, toAssetDTO } from '../../dtos/asset.dto';

@injectable()
export class GetInvestmentUseCase {
  constructor(
    @inject('IAssetRepository') private readonly assetRepo: IAssetRepository,
  ) {}

  async execute(assetId: string, userId: string): Promise<Result<AssetDTO, AssetError>> {
    const asset = await this.assetRepo.findByIdAndUserId(
      AssetId(assetId),
      UserId(userId),
    );

    if (!asset) return err({ type: 'ASSET_NOT_FOUND', assetId });
    return ok(toAssetDTO(asset));
  }
}
