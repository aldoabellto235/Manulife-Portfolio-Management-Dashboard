import 'reflect-metadata';
import { GetTransactionHistoryUseCase } from '../get-transaction-history.use-case';
import { ITransactionRepository } from '../../../../domain/repositories/transaction.repository';
import { Transaction } from '../../../../domain/entities/transaction.entity';
import { AssetId, TransactionId, UserId } from '../../../../domain/value-objects/branded';
import { Money } from '../../../../domain/value-objects/money.vo';

const makeTx = (id: string): Transaction =>
  Transaction.create({
    id: TransactionId(id),
    userId: UserId('user-1'),
    assetId: AssetId('asset-1'),
    type: 'BUY',
    quantity: 5,
    price: Money.create(9000, 'IDR').unwrap(),
    date: new Date('2025-01-01'),
  }).unwrap();

const mockTxRepo: jest.Mocked<ITransactionRepository> = {
  findById: jest.fn(),
  findByIdAndUserId: jest.fn(),
  findByUserId: jest.fn(),
  findByAssetId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const makeUseCase = () => new GetTransactionHistoryUseCase(mockTxRepo);

describe('GetTransactionHistoryUseCase', () => {
  it('returns paginated transaction DTOs', async () => {
    const txs = [makeTx('tx-1'), makeTx('tx-2')];
    mockTxRepo.findByUserId.mockResolvedValue({ items: txs, total: 15 });

    const result = await makeUseCase().execute({ userId: 'user-1', page: 1, limit: 2 });

    expect(result.isOk()).toBe(true);
    const data = result.unwrap();
    expect(data.items).toHaveLength(2);
    expect(data.total).toBe(15);
  });

  it('maps transactions to DTOs with correct fields', async () => {
    mockTxRepo.findByUserId.mockResolvedValue({ items: [makeTx('tx-99')], total: 1 });

    const result = await makeUseCase().execute({ userId: 'user-1', page: 1, limit: 10 });

    const dto = result.unwrap().items[0];
    expect(dto.id).toBe('tx-99');
    expect(dto.type).toBe('BUY');
    expect(dto.quantity).toBe(5);
    expect(dto.price).toBe(9000);
    expect(dto.totalValue).toBe(45000);
    expect(dto.currency).toBe('IDR');
  });

  it('calls the repo with correct userId, page, and limit', async () => {
    mockTxRepo.findByUserId.mockResolvedValue({ items: [], total: 0 });

    await makeUseCase().execute({ userId: 'user-7', page: 3, limit: 5 });

    expect(mockTxRepo.findByUserId).toHaveBeenCalledWith('user-7', 3, 5);
  });

  it('returns empty items when no transactions found', async () => {
    mockTxRepo.findByUserId.mockResolvedValue({ items: [], total: 0 });

    const result = await makeUseCase().execute({ userId: 'user-1', page: 1, limit: 10 });

    expect(result.unwrap().items).toHaveLength(0);
    expect(result.unwrap().total).toBe(0);
  });
});
