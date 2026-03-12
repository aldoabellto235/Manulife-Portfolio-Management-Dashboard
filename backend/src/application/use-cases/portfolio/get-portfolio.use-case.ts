import { inject, injectable } from 'tsyringe';
import { ok, Result } from '../../../shared/result';
import { UserId } from '../../../domain/value-objects/branded';
import { IAssetRepository } from '../../../domain/repositories/asset.repository';
import { PerformanceCalculatorService } from '../../../domain/services/performance-calculator.service';
import { PortfolioDTO, toAssetDTO } from '../../dtos/asset.dto';

@injectable()
export class GetPortfolioUseCase {
  constructor(
    @inject('IAssetRepository') private readonly assetRepo: IAssetRepository,
    @inject(PerformanceCalculatorService) private readonly calculator: PerformanceCalculatorService,
  ) {}

  async execute(userId: string): Promise<Result<PortfolioDTO, never>> {
    const assets = await this.assetRepo.findByUserId(UserId(userId));
    const summary = this.calculator.calculate(assets);

    return ok({
      assets: assets.map(toAssetDTO),
      summary,
    });
  }
}
