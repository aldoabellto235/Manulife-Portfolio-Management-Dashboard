import { inject, injectable } from 'tsyringe';
import { err, ok, Result } from '../../../shared/result';
import { AssetId, UserId } from '../../../domain/value-objects/branded';
import { Money } from '../../../domain/value-objects/money.vo';
import { AssetError } from '../../../domain/errors/asset.errors';
import { IAssetRepository } from '../../../domain/repositories/asset.repository';
import { AssetDTO, toAssetDTO } from '../../dtos/asset.dto';

export interface EditInvestmentInput {
  userId: string;
  assetId: string;
  currentValue?: number;
  quantity?: number;
}

@injectable()
export class EditInvestmentUseCase {
  constructor(
    @inject('IAssetRepository') private readonly assetRepo: IAssetRepository,
  ) {}

  async execute(input: EditInvestmentInput): Promise<Result<AssetDTO, AssetError | 'INVALID_MONEY'>> {
    const asset = await this.assetRepo.findByIdAndUserId(
      AssetId(input.assetId),
      UserId(input.userId),
    );

    if (!asset) return err({ type: 'ASSET_NOT_FOUND', assetId: input.assetId });
    if (!asset.isOwnedBy(UserId(input.userId))) {
      return err({ type: 'ASSET_OWNERSHIP_VIOLATION', userId: input.userId });
    }

    if (input.currentValue !== undefined) {
      const moneyResult = Money.create(input.currentValue, asset.currentValue.currency);
      if (moneyResult.isErr()) return err(moneyResult.error);
      asset.updateCurrentValue(moneyResult.value);
    }

    if (input.quantity !== undefined) {
      if (input.quantity <= 0) {
        return err({ type: 'INVALID_QUANTITY', provided: input.quantity });
      }
      asset.updateQuantity(input.quantity);
    }

    await this.assetRepo.update(asset);
    return ok(toAssetDTO(asset));
  }
}
