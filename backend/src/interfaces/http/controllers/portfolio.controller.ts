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
    const result = await this.getPortfolio.execute(req.userId!);
    res.json(successResponse(result.unwrap()));
  };
}
