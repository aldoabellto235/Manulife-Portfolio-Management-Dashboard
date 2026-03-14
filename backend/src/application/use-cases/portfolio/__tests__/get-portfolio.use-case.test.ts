import 'reflect-metadata';
import { GetPortfolioUseCase } from '../get-portfolio.use-case';
import { IAssetRepository } from '../../../../domain/repositories/asset.repository';
import { PerformanceCalculatorService, PortfolioSummary } from '../../../../domain/services/performance-calculator.service';
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

const mockSummary: PortfolioSummary = {
  totalPurchaseValue: 90000,
  totalCurrentValue: 100000,
  totalGainLoss: 10000,
  gainLossPercent: 11.11,
};

const mockAssetRepo: jest.Mocked<IAssetRepository> = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByUserIdPaginated: jest.fn(),
  findByIdAndUserId: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockCalculator = {
  calculate: jest.fn().mockReturnValue(mockSummary),
} as unknown as PerformanceCalculatorService;

describe('GetPortfolioUseCase', () => {
  const useCase = new GetPortfolioUseCase(mockAssetRepo, mockCalculator);

  beforeEach(() => {
    const assets = [makeAsset('asset-1'), makeAsset('asset-2')];
    mockAssetRepo.findByUserId.mockResolvedValue(assets);
    mockAssetRepo.findByUserIdPaginated.mockResolvedValue({ items: assets, total: 2 });
  });

  it('returns summary and paginated assets', async () => {
    const result = await useCase.execute({ userId: 'user-1', page: 1, limit: 10 });

    expect(result.isOk()).toBe(true);
    const dto = result.unwrap();
    expect(dto.summary).toEqual(mockSummary);
    expect(dto.assets.data).toHaveLength(2);
    expect(dto.assets.pagination).toEqual({ page: 1, limit: 10, total: 2 });
  });

  it('loads ALL assets for summary calculation regardless of pagination', async () => {
    // Even when paginating (page 2, limit 1), summary should use all assets
    mockAssetRepo.findByUserIdPaginated.mockResolvedValue({
      items: [makeAsset('asset-2')],
      total: 2,
    });

    await useCase.execute({ userId: 'user-1', page: 2, limit: 1 });

    // findByUserId (all assets) called for summary
    expect(mockAssetRepo.findByUserId).toHaveBeenCalledWith('user-1');
    // findByUserIdPaginated called for display list
    expect(mockAssetRepo.findByUserIdPaginated).toHaveBeenCalledWith('user-1', 2, 1);
  });

  it('passes all assets to the calculator', async () => {
    const allAssets = [makeAsset('asset-1'), makeAsset('asset-2')];
    mockAssetRepo.findByUserId.mockResolvedValue(allAssets);

    await useCase.execute({ userId: 'user-1', page: 1, limit: 10 });

    expect(mockCalculator.calculate).toHaveBeenCalledWith(allAssets);
  });

  it('returns correct pagination metadata', async () => {
    mockAssetRepo.findByUserIdPaginated.mockResolvedValue({
      items: [makeAsset('asset-3')],
      total: 50,
    });

    const result = await useCase.execute({ userId: 'user-1', page: 3, limit: 5 });
    const pagination = result.unwrap().assets.pagination;
    expect(pagination.page).toBe(3);
    expect(pagination.limit).toBe(5);
    expect(pagination.total).toBe(50);
  });

  it('returns empty data and zero summary when no assets', async () => {
    mockAssetRepo.findByUserId.mockResolvedValue([]);
    mockAssetRepo.findByUserIdPaginated.mockResolvedValue({ items: [], total: 0 });
    (mockCalculator.calculate as jest.Mock).mockReturnValueOnce({
      totalPurchaseValue: 0,
      totalCurrentValue: 0,
      totalGainLoss: 0,
      gainLossPercent: 0,
    });

    const result = await useCase.execute({ userId: 'user-1', page: 1, limit: 10 });
    const dto = result.unwrap();
    expect(dto.assets.data).toHaveLength(0);
    expect(dto.assets.pagination.total).toBe(0);
    expect(dto.summary.totalGainLoss).toBe(0);
  });
});
