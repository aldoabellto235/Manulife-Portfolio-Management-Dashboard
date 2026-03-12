import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'crypto';
import { err, ok, Result } from '../../../shared/result';
import { Asset } from '../../../domain/entities/asset.entity';
import { AssetId, UserId } from '../../../domain/value-objects/branded';
import { Money } from '../../../domain/value-objects/money.vo';
import { AssetError } from '../../../domain/errors/asset.errors';
import { IAssetRepository } from '../../../domain/repositories/asset.repository';
import { AssetDTO, toAssetDTO } from '../../dtos/asset.dto';

export interface AddInvestmentInput {
  userId: string;
  type: 'STOCK' | 'BOND' | 'MUTUAL_FUND';
  name: string;
  symbol: string;
  purchasePrice: number;
  currentValue: number;
  quantity: number;
  currency: string;
}

@injectable()
export class AddInvestmentUseCase {
  constructor(
    @inject('IAssetRepository') private readonly assetRepo: IAssetRepository,
  ) {}

  async execute(input: AddInvestmentInput): Promise<Result<AssetDTO, AssetError | 'INVALID_MONEY'>> {
    const purchasePriceResult = Money.create(input.purchasePrice, input.currency);
    if (purchasePriceResult.isErr()) return err(purchasePriceResult.error);

    const currentValueResult = Money.create(input.currentValue, input.currency);
    if (currentValueResult.isErr()) return err(currentValueResult.error);

    const assetResult = Asset.create({
      id: AssetId(randomUUID()),
      userId: UserId(input.userId),
      type: input.type,
      name: input.name,
      symbol: input.symbol.toUpperCase(),
      purchasePrice: purchasePriceResult.value,
      currentValue: currentValueResult.value,
      quantity: input.quantity,
    });

    if (assetResult.isErr()) return err(assetResult.error);

    await this.assetRepo.save(assetResult.value);
    return ok(toAssetDTO(assetResult.value));
  }
}
