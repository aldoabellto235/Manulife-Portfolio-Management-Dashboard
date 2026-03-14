import 'reflect-metadata';
import { GetMeUseCase } from '../get-me.use-case';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { User } from '../../../../domain/entities/user.entity';
import { UserId } from '../../../../domain/value-objects/branded';
import { Email } from '../../../../domain/value-objects/email.vo';

const existingUser = User.create({
  id: UserId('user-42'),
  email: Email.create('me@example.com').unwrap(),
  passwordHash: 'hash',
});

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findById: jest.fn().mockResolvedValue(existingUser),
  findByEmail: jest.fn(),
  save: jest.fn(),
};

const makeUseCase = () => new GetMeUseCase(mockUserRepo);

describe('GetMeUseCase', () => {
  it('returns user data for a valid userId', async () => {
    const result = await makeUseCase().execute('user-42');

    expect(result.isOk()).toBe(true);
    const dto = result.unwrap();
    expect(dto.id).toBe('user-42');
    expect(dto.email).toBe('me@example.com');
    expect(typeof dto.createdAt).toBe('string');
  });

  it('createdAt is a valid ISO string', async () => {
    const result = await makeUseCase().execute('user-42');
    expect(() => new Date(result.unwrap().createdAt)).not.toThrow();
  });

  it('calls the repository with the correct userId', async () => {
    await makeUseCase().execute('user-42');
    expect(mockUserRepo.findById).toHaveBeenCalledWith('user-42');
  });

  it('returns INVALID_TOKEN when user is not found', async () => {
    mockUserRepo.findById.mockResolvedValueOnce(null);

    const result = await makeUseCase().execute('unknown-user');

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect((result.error as any).type).toBe('INVALID_TOKEN');
  });
});
