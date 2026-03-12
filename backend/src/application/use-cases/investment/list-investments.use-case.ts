import { inject, injectable } from 'tsyringe';
import { ok, Result } from '../../../shared/result';
import { UserId } from '../../../domain/value-objects/branded';
import { IAssetRepository, PaginatedResult } from '../../../domain/repositories/asset.repository';
import { AssetDTO, toAssetDTO } from '../../dtos/asset.dto';

export interface ListInvestmentsInput {
  userId: string;
  page: number;
  limit: number;
}

@injectable()
export class ListInvestmentsUseCase {
  constructor(
    @inject('IAssetRepository') private readonly assetRepo: IAssetRepository,
  ) {}

  async execute(input: ListInvestmentsInput): Promise<Result<PaginatedResult<AssetDTO>, never>> {
    const { items, total } = await this.assetRepo.findByUserIdPaginated(
      UserId(input.userId),
      input.page,
      input.limit,
    );
    return ok({ items: items.map(toAssetDTO), total });
  }
}
