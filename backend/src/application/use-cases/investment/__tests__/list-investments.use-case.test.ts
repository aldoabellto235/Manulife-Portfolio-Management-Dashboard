import 'reflect-metadata';
import { ListInvestmentsUseCase } from '../list-investments.use-case';
import { IAssetRepository } from '../../../../domain/repositories/asset.repository';
import { Asset } from '../../../../domain/entities/asset.entity';
import { AssetId, UserId } from '../../../../domain/value-objects/branded';
import { Money } from '../../../../domain/value-objects/money.vo';

const makeAsset = (id: string): Asset =>
  Asset.create({
    id: AssetId(id),
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
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ListInvestmentsUseCase', () => {
  const useCase = new ListInvestmentsUseCase(mockAssetRepo);

  it('returns paginated DTOs', async () => {
    const assets = [makeAsset('asset-1'), makeAsset('asset-2')];
    mockAssetRepo.findByUserIdPaginated.mockResolvedValue({ items: assets, total: 20 });

    const result = await useCase.execute({ userId: 'user-1', page: 2, limit: 2 });

    expect(result.isOk()).toBe(true);
    const data = result.unwrap();
    expect(data.items).toHaveLength(2);
    expect(data.total).toBe(20);
    expect(data.items[0].id).toBe('asset-1');
    expect(data.items[1].id).toBe('asset-2');
  });

  it('calls repo with correct userId, page, and limit', async () => {
    mockAssetRepo.findByUserIdPaginated.mockResolvedValue({ items: [], total: 0 });

    await useCase.execute({ userId: 'user-42', page: 3, limit: 5 });

    expect(mockAssetRepo.findByUserIdPaginated).toHaveBeenCalledWith(
      'user-42',
      3,
      5,
    );
  });

  it('returns empty items when no assets found', async () => {
    mockAssetRepo.findByUserIdPaginated.mockResolvedValue({ items: [], total: 0 });

    const result = await useCase.execute({ userId: 'user-1', page: 1, limit: 10 });

    expect(result.unwrap().items).toHaveLength(0);
    expect(result.unwrap().total).toBe(0);
  });
});
