import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'crypto';
import { err, ok, Result } from '../../../shared/result';
import { AssetId, TransactionId, UserId } from '../../../domain/value-objects/branded';
import { Money } from '../../../domain/value-objects/money.vo';
import { Transaction, TransactionType } from '../../../domain/entities/transaction.entity';
import { TransactionError } from '../../../domain/errors/transaction.errors';
import { IUnitOfWork } from '../../ports/unit-of-work.port';
import { AssetError } from '../../../domain/errors/asset.errors';
import { TransactionDTO, toTransactionDTO } from '../../dtos/transaction.dto';

export interface AddTransactionInput {
  userId: string;
  assetId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  currency: string;
  date?: string;
}

type AddTransactionError = TransactionError | AssetError | 'INVALID_MONEY';

class DomainError extends Error {
  constructor(public readonly domainError: AddTransactionError) {
    super('domain_error');
  }
}

@injectable()
export class AddTransactionUseCase {
  constructor(
    @inject('IUnitOfWork') private readonly uow: IUnitOfWork,
  ) {}

  async execute(
    input: AddTransactionInput,
  ): Promise<Result<TransactionDTO, AddTransactionError>> {
    const priceResult = Money.create(input.price, input.currency);
    if (priceResult.isErr()) return err(priceResult.error);

    try {
      const tx = await this.uow.run(async ({ assetRepo, txRepo }) => {
        const asset = await assetRepo.findByIdAndUserId(
          AssetId(input.assetId),
          UserId(input.userId),
        );
        if (!asset) throw new DomainError({ type: 'ASSET_NOT_FOUND', assetId: input.assetId });

        if (input.type === 'BUY') {
          asset.addShares(input.quantity, priceResult.value);
        } else {
          const sellResult = asset.removeShares(input.quantity);
          if (sellResult.isErr()) throw new DomainError(sellResult.error);
        }

        const txResult = Transaction.create({
          id: TransactionId(randomUUID()),
          userId: UserId(input.userId),
          assetId: AssetId(input.assetId),
          type: input.type,
          quantity: input.quantity,
          price: priceResult.value,
          date: input.date ? new Date(input.date) : new Date(),
        });
        if (txResult.isErr()) throw new DomainError(txResult.error);

        await assetRepo.update(asset);
        await txRepo.save(txResult.value);

        return txResult.value;
      });

      return ok(toTransactionDTO(tx));
    } catch (e) {
      if (e instanceof DomainError) return err(e.domainError);
      throw e;
    }
  }
}
