import 'reflect-metadata';
import { AddInvestmentUseCase } from '../add-investment.use-case';
import { IAssetRepository } from '../../../../domain/repositories/asset.repository';

const mockAssetRepo: jest.Mocked<IAssetRepository> = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByUserIdPaginated: jest.fn(),
  findByIdAndUserId: jest.fn(),
  save: jest.fn().mockResolvedValue(undefined),
  update: jest.fn(),
  delete: jest.fn(),
};

const makeUseCase = () => new AddInvestmentUseCase(mockAssetRepo);

const validInput = {
  userId: 'user-1',
  type: 'STOCK' as const,
  name: 'Bank BCA',
  symbol: 'bbca',
  purchasePrice: 9000,
  currentValue: 10000,
  quantity: 10,
  currency: 'IDR',
};

describe('AddInvestmentUseCase', () => {
  it('saves the asset and returns a DTO on success', async () => {
    const result = await makeUseCase().execute(validInput);
    expect(result.isOk()).toBe(true);
    const dto = result.unwrap();
    expect(dto.name).toBe('Bank BCA');
    expect(dto.symbol).toBe('BBCA'); // uppercased
    expect(dto.quantity).toBe(10);
    expect(dto.purchasePrice).toBe(9000);
    expect(dto.currency).toBe('IDR');
    expect(mockAssetRepo.save).toHaveBeenCalledTimes(1);
  });

  it('returns INVALID_MONEY when purchasePrice is negative', async () => {
    const result = await makeUseCase().execute({ ...validInput, purchasePrice: -1 });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error).toBe('INVALID_MONEY');
    expect(mockAssetRepo.save).not.toHaveBeenCalled();
  });

  it('returns INVALID_MONEY when currentValue is negative', async () => {
    const result = await makeUseCase().execute({ ...validInput, currentValue: -100 });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error).toBe('INVALID_MONEY');
  });

  it('returns INVALID_MONEY for invalid currency', async () => {
    const result = await makeUseCase().execute({ ...validInput, currency: 'INVALID' });
    expect(result.isErr()).toBe(true);
  });

  it('returns INVALID_QUANTITY when quantity is 0', async () => {
    const result = await makeUseCase().execute({ ...validInput, quantity: 0 });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect((result.error as any).type).toBe('INVALID_QUANTITY');
    }
    expect(mockAssetRepo.save).not.toHaveBeenCalled();
  });

  it('returns INVALID_QUANTITY when quantity is negative', async () => {
    const result = await makeUseCase().execute({ ...validInput, quantity: -5 });
    expect(result.isErr()).toBe(true);
  });

  it('includes a generated UUID as id in the DTO', async () => {
    const result = await makeUseCase().execute(validInput);
    expect(result.unwrap().id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
