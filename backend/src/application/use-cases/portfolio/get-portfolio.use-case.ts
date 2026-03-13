import { inject, injectable } from 'tsyringe';
import { ok, Result } from '../../../shared/result';
import { UserId } from '../../../domain/value-objects/branded';
import { IAssetRepository } from '../../../domain/repositories/asset.repository';
import { PerformanceCalculatorService } from '../../../domain/services/performance-calculator.service';
import { PortfolioDTO, toAssetDTO } from '../../dtos/asset.dto';

export interface GetPortfolioInput {
  userId: string;
  page: number;
  limit: number;
}

@injectable()
export class GetPortfolioUseCase {
  constructor(
    @inject('IAssetRepository') private readonly assetRepo: IAssetRepository,
    @inject(PerformanceCalculatorService) private readonly calculator: PerformanceCalculatorService,
  ) {}

  async execute(input: GetPortfolioInput): Promise<Result<PortfolioDTO, never>> {
    const allAssets = await this.assetRepo.findByUserId(UserId(input.userId));
    const summary = this.calculator.calculate(allAssets);

    const { items, total } = await this.assetRepo.findByUserIdPaginated(
      UserId(input.userId),
      input.page,
      input.limit,
    );

    return ok({
      assets: {
        pagination: { page: input.page, limit: input.limit, total },
        data: items.map(toAssetDTO),
      },
      summary,
    });
  }
}
