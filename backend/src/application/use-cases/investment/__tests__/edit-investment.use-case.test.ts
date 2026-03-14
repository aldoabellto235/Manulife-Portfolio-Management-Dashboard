import 'reflect-metadata';
import { EditInvestmentUseCase } from '../edit-investment.use-case';
import { IAssetRepository } from '../../../../domain/repositories/asset.repository';
import { Asset } from '../../../../domain/entities/asset.entity';
import { AssetId, UserId } from '../../../../domain/value-objects/branded';
import { Money } from '../../../../domain/value-objects/money.vo';

const makeAsset = (): Asset =>
  Asset.create({
    id: AssetId('asset-1'),
    userId: UserId('user-1'),
    type: 'STOCK',
    name: 'Bank BCA',
    symbol: 'BBCA',
    purchasePrice: Money.create(9000, 'IDR').unwrap(),
    currentValue: Money.create(10000, 'IDR').unwrap(),
    quantity: 10,
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

const makeUseCase = () => new EditInvestmentUseCase(mockAssetRepo);

describe('EditInvestmentUseCase', () => {
  describe('update currentValue', () => {
    it('updates currentValue and returns updated DTO', async () => {
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(makeAsset());

      const result = await makeUseCase().execute({
        userId: 'user-1',
        assetId: 'asset-1',
        currentValue: 12000,
      });

      expect(result.isOk()).toBe(true);
      expect(result.unwrap().currentValue).toBe(12000);
      expect(mockAssetRepo.update).toHaveBeenCalledTimes(1);
    });

    it('returns INVALID_MONEY for a negative currentValue', async () => {
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(makeAsset());

      const result = await makeUseCase().execute({
        userId: 'user-1',
        assetId: 'asset-1',
        currentValue: -500,
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBe('INVALID_MONEY');
      expect(mockAssetRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('update quantity', () => {
    it('updates quantity and returns updated DTO', async () => {
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(makeAsset());

      const result = await makeUseCase().execute({
        userId: 'user-1',
        assetId: 'asset-1',
        quantity: 20,
      });

      expect(result.isOk()).toBe(true);
      expect(result.unwrap().quantity).toBe(20);
    });

    it('returns INVALID_QUANTITY for quantity <= 0', async () => {
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(makeAsset());

      const result = await makeUseCase().execute({
        userId: 'user-1',
        assetId: 'asset-1',
        quantity: 0,
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect((result.error as any).type).toBe('INVALID_QUANTITY');
    });

    it('returns INVALID_QUANTITY for negative quantity', async () => {
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(makeAsset());

      const result = await makeUseCase().execute({
        userId: 'user-1',
        assetId: 'asset-1',
        quantity: -3,
      });

      expect(result.isErr()).toBe(true);
    });
  });

  describe('update both fields', () => {
    it('updates currentValue and quantity together', async () => {
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(makeAsset());

      const result = await makeUseCase().execute({
        userId: 'user-1',
        assetId: 'asset-1',
        currentValue: 11000,
        quantity: 15,
      });

      expect(result.isOk()).toBe(true);
      expect(result.unwrap().currentValue).toBe(11000);
      expect(result.unwrap().quantity).toBe(15);
    });
  });

  describe('asset not found', () => {
    it('returns ASSET_NOT_FOUND when asset does not exist', async () => {
      mockAssetRepo.findByIdAndUserId.mockResolvedValue(null);

      const result = await makeUseCase().execute({
        userId: 'user-1',
        assetId: 'missing',
        currentValue: 12000,
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect((result.error as any).type).toBe('ASSET_NOT_FOUND');
        expect((result.error as any).assetId).toBe('missing');
      }
      expect(mockAssetRepo.update).not.toHaveBeenCalled();
    });
  });
});
