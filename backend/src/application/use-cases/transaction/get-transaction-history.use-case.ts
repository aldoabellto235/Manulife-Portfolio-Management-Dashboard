import { inject, injectable } from 'tsyringe';
import { ok, Result } from '../../../shared/result';
import { UserId } from '../../../domain/value-objects/branded';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository';
import { PaginatedResult } from '../../../domain/repositories/asset.repository';
import { TransactionDTO, toTransactionDTO } from '../../dtos/transaction.dto';

export interface GetTransactionHistoryInput {
  userId: string;
  page: number;
  limit: number;
}

@injectable()
export class GetTransactionHistoryUseCase {
  constructor(
    @inject('ITransactionRepository') private readonly txRepo: ITransactionRepository,
  ) {}

  async execute(
    input: GetTransactionHistoryInput,
  ): Promise<Result<PaginatedResult<TransactionDTO>, never>> {
    const { items, total } = await this.txRepo.findByUserId(
      UserId(input.userId),
      input.page,
      input.limit,
    );
    return ok({ items: items.map(toTransactionDTO), total });
  }
}
