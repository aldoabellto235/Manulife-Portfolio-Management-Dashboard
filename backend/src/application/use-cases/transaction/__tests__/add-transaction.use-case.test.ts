import 'reflect-metadata';
import { AddTransactionUseCase } from '../add-transaction.use-case';
import { IUnitOfWork, IUnitOfWorkRepos } from '../../../../application/ports/unit-of-work.port';
import { IAssetRepository } from '../../../../domain/repositories/asset.repository';
import { ITransactionRepository } from '../../../../domain/repositories/transaction.repository';
import { Asset } from '../../../../domain/entities/asset.entity';
import { AssetId, UserId } from '../../../../domain/value-objects/branded';
import { Money } from '../../../../domain/value-objects/money.vo';

const makeAsset = (quantity = 10): Asset =>
  Asset.create({
    id: AssetId('asset-1'),
    userId: UserId('user-1'),
    type: 'STOCK',
    name: 'Bank BCA',
    symbol: 'BBCA',
    purchasePrice: Money.create(9000, 'IDR').unwrap(),
    currentValue: Money.create(10000, 'IDR').unwrap(),
    quantity,
  }).unwrap();

const mockAssetRepo: jest.Mocked<IAssetRepository> = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByUserIdPaginated: jest.fn(),
  findByIdAndUserId: jest.fn(),
  save: jest.fn(),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn(),
};

const mockTxRepo: jest.Mocked<ITransactionRepository> = {
  findById: jest.fn(),
  findByIdAndUserId: jest.fn(),
  findByUserId: jest.fn(),
  findByAssetId: jest.fn(),
  save: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn(),
};

const mockUow: IUnitOfWork = {
  run: jest.fn().mockImplementation(async (work: (repos: IUnitOfWorkRepos) => Promise<unknown>) =>
    work({ assetRepo: mockAssetRepo, txRepo: mockTxRepo }),
  ),
};

const makeUseCase = () => new AddTransactionUseCase(mockUow);

const baseInput = {
  userId: 'user-1',
  assetId: 'asset-1',
  quantity: 5,
  price: 9500,
  currency: 'IDR',
  date: '2025-06-01',
};

describe('AddTransactionUseCase', () => {
  describe('BUY transaction', () => {
    it('returns a transaction DTO on success', async () => {
      const asset = makeAsset(10);
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(asset);

      const result = await makeUseCase().execute({ ...baseInput, type: 'BUY' });

      expect(result.isOk()).toBe(true);
      const dto = result.unwrap();
      expect(dto.type).toBe('BUY');
      expect(dto.quantity).toBe(5);
      expect(dto.price).toBe(9500);
      expect(dto.totalValue).toBe(47500);
    });

    it('increases asset quantity via addShares', async () => {
      const asset = makeAsset(10);
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(asset);

      await makeUseCase().execute({ ...baseInput, type: 'BUY', quantity: 5 });

      expect(asset.quantity).toBe(15);
    });

    it('saves the transaction and updates the asset', async () => {
      const asset = makeAsset(10);
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(asset);

      await makeUseCase().execute({ ...baseInput, type: 'BUY' });

      expect(mockAssetRepo.update).toHaveBeenCalledWith(asset);
      expect(mockTxRepo.save).toHaveBeenCalledTimes(1);
    });

    it('recalculates weighted average purchase price', async () => {
      // asset: qty=10 @ 8000, buy 10 more @ 10000 → avg = 9000
      const asset = makeAsset(10);
      // Override purchasePrice to 8000
      asset.addShares(0, Money.create(8000, 'IDR').unwrap()); // trick: won't change avg with qty=0... skip
      // Just check the mechanism works through the use case
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(asset);
      const before = asset.purchasePrice.amount;

      await makeUseCase().execute({ ...baseInput, type: 'BUY', price: 10000, quantity: 10 });

      // avg = (before*10 + 10000*10) / 20
      const expected = (before * 10 + 10000 * 10) / 20;
      expect(asset.purchasePrice.amount).toBeCloseTo(expected);
    });
  });

  describe('SELL transaction', () => {
    it('returns a transaction DTO on success', async () => {
      const asset = makeAsset(10);
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(asset);

      const result = await makeUseCase().execute({ ...baseInput, type: 'SELL', quantity: 5 });

      expect(result.isOk()).toBe(true);
      expect(result.unwrap().type).toBe('SELL');
    });

    it('decreases asset quantity via removeShares', async () => {
      const asset = makeAsset(10);
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(asset);

      await makeUseCase().execute({ ...baseInput, type: 'SELL', quantity: 4 });

      expect(asset.quantity).toBe(6);
    });

    it('returns INSUFFICIENT_QUANTITY when selling more than held', async () => {
      const asset = makeAsset(3);
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(asset);

      const result = await makeUseCase().execute({ ...baseInput, type: 'SELL', quantity: 10 });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect((result.error as any).type).toBe('INSUFFICIENT_QUANTITY');
      }
    });

    it('does not save transaction when SELL fails', async () => {
      const asset = makeAsset(3);
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(asset);

      await makeUseCase().execute({ ...baseInput, type: 'SELL', quantity: 10 });

      expect(mockTxRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('returns INVALID_MONEY for negative price', async () => {
      const result = await makeUseCase().execute({ ...baseInput, type: 'BUY', price: -100 });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBe('INVALID_MONEY');
    });

    it('returns INVALID_MONEY for invalid currency', async () => {
      const result = await makeUseCase().execute({ ...baseInput, type: 'BUY', currency: 'XX' });
      expect(result.isErr()).toBe(true);
    });

    it('returns ASSET_NOT_FOUND when asset does not exist', async () => {
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(null);

      const result = await makeUseCase().execute({ ...baseInput, type: 'BUY' });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect((result.error as any).type).toBe('ASSET_NOT_FOUND');
      }
    });

    it('returns INVALID_QUANTITY error for quantity 0 (from Transaction.create)', async () => {
      const asset = makeAsset(10);
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(asset);

      const result = await makeUseCase().execute({ ...baseInput, type: 'BUY', quantity: 0 });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect((result.error as any).type).toBe('INVALID_QUANTITY');
      }
    });
  });

  describe('date', () => {
    it('uses provided date', async () => {
      const asset = makeAsset(10);
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(asset);

      const result = await makeUseCase().execute({ ...baseInput, type: 'BUY', date: '2025-01-15' });

      expect(result.unwrap().date).toBe(new Date('2025-01-15').toISOString());
    });

    it('uses current date when date not provided', async () => {
      const asset = makeAsset(10);
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(asset);
      const before = new Date();

      const result = await makeUseCase().execute({
        userId: 'user-1',
        assetId: 'asset-1',
        type: 'BUY',
        quantity: 5,
        price: 9500,
        currency: 'IDR',
      });

      const txDate = new Date(result.unwrap().date);
      expect(txDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });
});
