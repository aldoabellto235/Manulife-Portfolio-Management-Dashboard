import 'reflect-metadata';
import { DeleteTransactionUseCase } from '../delete-transaction.use-case';
import { ITransactionRepository } from '../../../../domain/repositories/transaction.repository';
import { Transaction } from '../../../../domain/entities/transaction.entity';
import { AssetId, TransactionId, UserId } from '../../../../domain/value-objects/branded';
import { Money } from '../../../../domain/value-objects/money.vo';

const makeTx = (userId = 'user-1'): Transaction =>
  Transaction.create({
    id: TransactionId('tx-1'),
    userId: UserId(userId),
    assetId: AssetId('asset-1'),
    type: 'BUY',
    quantity: 5,
    price: Money.create(9000, 'IDR').unwrap(),
    date: new Date(),
  }).unwrap();

const mockTxRepo: jest.Mocked<ITransactionRepository> = {
  findById: jest.fn(),
  findByIdAndUserId: jest.fn(),
  findByUserId: jest.fn(),
  findByAssetId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn().mockResolvedValue(undefined),
};

const makeUseCase = () => new DeleteTransactionUseCase(mockTxRepo);

describe('DeleteTransactionUseCase', () => {
  it('deletes the transaction and returns ok(void) on success', async () => {
    mockTxRepo.findByIdAndUserId.mockResolvedValue(makeTx());

    const result = await makeUseCase().execute('tx-1', 'user-1');

    expect(result.isOk()).toBe(true);
    expect(mockTxRepo.delete).toHaveBeenCalledWith('tx-1');
  });

  it('calls the repo with correct transactionId and userId', async () => {
    mockTxRepo.findByIdAndUserId.mockResolvedValue(makeTx());

    await makeUseCase().execute('tx-1', 'user-1');

    expect(mockTxRepo.findByIdAndUserId).toHaveBeenCalledWith('tx-1', 'user-1');
  });

  it('returns TRANSACTION_NOT_FOUND when transaction does not exist', async () => {
    mockTxRepo.findByIdAndUserId.mockResolvedValue(null);

    const result = await makeUseCase().execute('missing-tx', 'user-1');

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect((result.error as any).type).toBe('TRANSACTION_NOT_FOUND');
      expect((result.error as any).transactionId).toBe('missing-tx');
    }
    expect(mockTxRepo.delete).not.toHaveBeenCalled();
  });
});
