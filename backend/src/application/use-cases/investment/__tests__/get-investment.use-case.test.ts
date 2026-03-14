import 'reflect-metadata';
import { GetInvestmentUseCase } from '../get-investment.use-case';
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
  update: jest.fn(),
  delete: jest.fn(),
};

const makeUseCase = () => new GetInvestmentUseCase(mockAssetRepo);

describe('GetInvestmentUseCase', () => {
  it('returns an AssetDTO for a valid asset', async () => {
    mockAssetRepo.findByIdAndUserId.mockResolvedValue(makeAsset());

    const result = await makeUseCase().execute('asset-1', 'user-1');

    expect(result.isOk()).toBe(true);
    const dto = result.unwrap();
    expect(dto.id).toBe('asset-1');
    expect(dto.name).toBe('Bank BCA');
    expect(dto.symbol).toBe('BBCA');
    expect(dto.quantity).toBe(10);
  });

  it('calls repo with correct assetId and userId', async () => {
    mockAssetRepo.findByIdAndUserId.mockResolvedValue(makeAsset());

    await makeUseCase().execute('asset-1', 'user-1');

    expect(mockAssetRepo.findByIdAndUserId).toHaveBeenCalledWith('asset-1', 'user-1');
  });

  it('returns ASSET_NOT_FOUND when asset does not exist', async () => {
    mockAssetRepo.findByIdAndUserId.mockResolvedValue(null);

    const result = await makeUseCase().execute('missing', 'user-1');

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect((result.error as any).type).toBe('ASSET_NOT_FOUND');
      expect((result.error as any).assetId).toBe('missing');
    }
  });
});
