import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AddInvestmentUseCase } from '../../../application/use-cases/investment/add-investment.use-case';
import { EditInvestmentUseCase } from '../../../application/use-cases/investment/edit-investment.use-case';
import { DeleteInvestmentUseCase } from '../../../application/use-cases/investment/delete-investment.use-case';
import { ListInvestmentsUseCase } from '../../../application/use-cases/investment/list-investments.use-case';
import { GetInvestmentUseCase } from '../../../application/use-cases/investment/get-investment.use-case';
import { errorResponse, paginationResponse, successResponse } from '../../../shared/api-response';

@injectable()
export class InvestmentController {
  constructor(
    @inject(AddInvestmentUseCase) private readonly addInvestment: AddInvestmentUseCase,
    @inject(EditInvestmentUseCase) private readonly editInvestment: EditInvestmentUseCase,
    @inject(DeleteInvestmentUseCase) private readonly deleteInvestment: DeleteInvestmentUseCase,
    @inject(ListInvestmentsUseCase) private readonly listInvestments: ListInvestmentsUseCase,
    @inject(GetInvestmentUseCase) private readonly getInvestment: GetInvestmentUseCase,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string) || 10));

    const result = await this.listInvestments.execute({ userId: req.userId!, page, limit });
    const { items, total } = result.unwrap();
    res.json(paginationResponse(items, page, limit, total));
  };

  getOne = async (req: Request, res: Response): Promise<void> => {
    const result = await this.getInvestment.execute(req.params['id'] as string, req.userId!);

    if (result.isErr()) {
      const code = result.error.type === 'ASSET_NOT_FOUND' ? 404 : 403;
      res.status(code).json(errorResponse(result.error.type, code));
      return;
    }

    res.json(successResponse(result.value));
  };

  add = async (req: Request, res: Response): Promise<void> => {
    const result = await this.addInvestment.execute({
      userId: req.userId!,
      ...req.body,
    });

    if (result.isErr()) {
      const type = typeof result.error === 'object' ? (result.error as { type: string }).type : result.error;
      const code = type === 'INVALID_MONEY' || type === 'INVALID_QUANTITY' ? 400 : 500;
      res.status(code).json(errorResponse(type, code));
      return;
    }

    res.status(201).json(successResponse(result.value, 201));
  };

  edit = async (req: Request, res: Response): Promise<void> => {
    const result = await this.editInvestment.execute({
      userId: req.userId!,
      assetId: req.params.id,
      ...req.body,
    });

    if (result.isErr()) {
      const error = result.error;
      const type = typeof error === 'object' ? (error as { type: string }).type : error;
      const code = type === 'ASSET_NOT_FOUND' ? 404 : type === 'ASSET_OWNERSHIP_VIOLATION' ? 403 : 400;
      res.status(code).json(errorResponse(type, code));
      return;
    }

    res.json(successResponse(result.value));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const result = await this.deleteInvestment.execute(req.params['id'] as string, req.userId!);

    if (result.isErr()) {
      const error = result.error;
      const type = typeof error === 'object' ? (error as { type: string }).type : String(error);
      const code = type === 'ASSET_NOT_FOUND' ? 404 : type === 'ASSET_OWNERSHIP_VIOLATION' ? 403 : 500;
      res.status(code).json(errorResponse(type, code));
      return;
    }

    res.status(204).send();
  };
}
