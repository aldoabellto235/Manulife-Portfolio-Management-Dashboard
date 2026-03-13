import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { GetPortfolioUseCase } from '../../../application/use-cases/portfolio/get-portfolio.use-case';
import { successResponse } from '../../../shared/api-response';

@injectable()
export class PortfolioController {
  constructor(
    @inject(GetPortfolioUseCase) private readonly getPortfolio: GetPortfolioUseCase,
  ) {}

  get = async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string) || 10));

    const result = await this.getPortfolio.execute({ userId: req.userId!, page, limit });
    res.json(successResponse(result.unwrap()));
  };
}
