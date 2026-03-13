import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'crypto';
import { err, ok, Result } from '../../../shared/result';
import { AssetId, TransactionId, UserId } from '../../../domain/value-objects/branded';
import { Money } from '../../../domain/value-objects/money.vo';
import { Transaction, TransactionType } from '../../../domain/entities/transaction.entity';
import { TransactionError } from '../../../domain/errors/transaction.errors';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository';
import { IAssetRepository } from '../../../domain/repositories/asset.repository';
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

@injectable()
export class AddTransactionUseCase {
  constructor(
    @inject('ITransactionRepository') private readonly txRepo: ITransactionRepository,
    @inject('IAssetRepository') private readonly assetRepo: IAssetRepository,
  ) {}

  async execute(
    input: AddTransactionInput,
  ): Promise<Result<TransactionDTO, TransactionError | AssetError | 'INVALID_MONEY'>> {
    // 1. Verify the asset belongs to this user
    const asset = await this.assetRepo.findByIdAndUserId(
      AssetId(input.assetId),
      UserId(input.userId),
    );
    if (!asset) return err({ type: 'ASSET_NOT_FOUND', assetId: input.assetId });

    // 2. Build the price Money VO
    const priceResult = Money.create(input.price, input.currency);
    if (priceResult.isErr()) return err(priceResult.error);

    // 3. Apply the trade to the investment before persisting
    if (input.type === 'BUY') {
      asset.addShares(input.quantity, priceResult.value);
    } else {
      const sellResult = asset.removeShares(input.quantity);
      if (sellResult.isErr()) return err(sellResult.error);
    }

    // 4. Build the transaction record
    const txResult = Transaction.create({
      id: TransactionId(randomUUID()),
      userId: UserId(input.userId),
      assetId: AssetId(input.assetId),
      type: input.type,
      quantity: input.quantity,
      price: priceResult.value,
      date: input.date ? new Date(input.date) : new Date(),
    });
    if (txResult.isErr()) return err(txResult.error);

    // 5. Persist both atomically (repository-level; no saga needed for now)
    await this.assetRepo.update(asset);
    await this.txRepo.save(txResult.value);

    return ok(toTransactionDTO(txResult.value));
  }
}
