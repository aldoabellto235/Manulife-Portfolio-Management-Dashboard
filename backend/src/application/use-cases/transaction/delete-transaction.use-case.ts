import { inject, injectable } from 'tsyringe';
import { err, ok, Result } from '../../../shared/result';
import { TransactionId, UserId } from '../../../domain/value-objects/branded';
import { TransactionError } from '../../../domain/errors/transaction.errors';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository';

@injectable()
export class DeleteTransactionUseCase {
  constructor(
    @inject('ITransactionRepository') private readonly txRepo: ITransactionRepository,
  ) {}

  async execute(
    transactionId: string,
    userId: string,
  ): Promise<Result<void, TransactionError>> {
    const tx = await this.txRepo.findByIdAndUserId(
      TransactionId(transactionId),
      UserId(userId),
    );

    if (!tx) return err({ type: 'TRANSACTION_NOT_FOUND', transactionId });
    if (!tx.isOwnedBy(UserId(userId))) {
      return err({ type: 'TRANSACTION_OWNERSHIP_VIOLATION', userId });
    }

    await this.txRepo.delete(TransactionId(transactionId));
    return ok(undefined);
  }
}
