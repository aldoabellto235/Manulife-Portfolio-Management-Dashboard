import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { AddTransactionUseCase } from '../../../application/use-cases/transaction/add-transaction.use-case';
import { GetTransactionHistoryUseCase } from '../../../application/use-cases/transaction/get-transaction-history.use-case';
import { DeleteTransactionUseCase } from '../../../application/use-cases/transaction/delete-transaction.use-case';
import { errorResponse, paginationResponse, successResponse } from '../../../shared/api-response';

@injectable()
export class TransactionController {
  constructor(
    @inject(AddTransactionUseCase) private readonly addTransaction: AddTransactionUseCase,
    @inject(GetTransactionHistoryUseCase) private readonly getHistory: GetTransactionHistoryUseCase,
    @inject(DeleteTransactionUseCase) private readonly deleteTransaction: DeleteTransactionUseCase,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string) || 10));

    const result = await this.getHistory.execute({ userId: req.userId!, page, limit });
    const { items, total } = result.unwrap();
    res.json(paginationResponse(items, page, limit, total));
  };

  add = async (req: Request, res: Response): Promise<void> => {
    const result = await this.addTransaction.execute({
      userId: req.userId!,
      ...req.body,
    });

    if (result.isErr()) {
      const error = result.error;
      const type = typeof error === 'object' ? (error as { type: string }).type : error;
      const code = type === 'ASSET_NOT_FOUND' ? 404
        : type === 'INVALID_QUANTITY' || type === 'INVALID_MONEY' || type === 'INSUFFICIENT_QUANTITY' ? 400
        : 500;
      res.status(code).json(errorResponse(type, code));
      return;
    }

    res.status(201).json(successResponse(result.value, 201));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const result = await this.deleteTransaction.execute(req.params['id'] as string, req.userId!);

    if (result.isErr()) {
      const type = result.error.type;
      const code = type === 'TRANSACTION_NOT_FOUND' ? 404 : type === 'TRANSACTION_OWNERSHIP_VIOLATION' ? 403 : 500;
      res.status(code).json(errorResponse(type, code));
      return;
    }

    res.status(204).send();
  };
}
