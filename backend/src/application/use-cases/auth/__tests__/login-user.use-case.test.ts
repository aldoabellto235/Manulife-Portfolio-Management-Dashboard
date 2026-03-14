import 'reflect-metadata';
import { LoginUserUseCase } from '../login-user.use-case';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { IPasswordHasher } from '../../../../application/ports/password-hasher.port';
import { ITokenService } from '../../../../application/ports/token-service.port';
import { User } from '../../../../domain/entities/user.entity';
import { UserId } from '../../../../domain/value-objects/branded';
import { Email } from '../../../../domain/value-objects/email.vo';

const existingUser = User.create({
  id: UserId('user-1'),
  email: Email.create('user@example.com').unwrap(),
  passwordHash: 'hashed_pw',
});

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn().mockResolvedValue(existingUser),
  save: jest.fn(),
};

const mockHasher: jest.Mocked<IPasswordHasher> = {
  hash: jest.fn(),
  compare: jest.fn().mockResolvedValue(true),
};

const mockTokenService: jest.Mocked<ITokenService> = {
  sign: jest.fn().mockReturnValue('jwt_token'),
  verify: jest.fn(),
};

const makeUseCase = () => new LoginUserUseCase(mockUserRepo, mockHasher, mockTokenService);

describe('LoginUserUseCase', () => {
  it('returns an access token on successful login', async () => {
    const result = await makeUseCase().execute({
      email: 'user@example.com',
      password: 'correct_pw',
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().accessToken).toBe('jwt_token');
  });

  it('calls compare with the plain password and stored hash', async () => {
    await makeUseCase().execute({ email: 'user@example.com', password: 'my_plain_pw' });

    expect(mockHasher.compare).toHaveBeenCalledWith('my_plain_pw', 'hashed_pw');
  });

  it('signs the token with the user id', async () => {
    await makeUseCase().execute({ email: 'user@example.com', password: 'correct_pw' });

    expect(mockTokenService.sign).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  it('returns INVALID_CREDENTIALS when user is not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValueOnce(null);

    const result = await makeUseCase().execute({
      email: 'ghost@example.com',
      password: 'pw',
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect((result.error as any).type).toBe('INVALID_CREDENTIALS');
  });

  it('returns INVALID_CREDENTIALS when password does not match', async () => {
    mockHasher.compare.mockResolvedValueOnce(false);

    const result = await makeUseCase().execute({
      email: 'user@example.com',
      password: 'wrong_pw',
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect((result.error as any).type).toBe('INVALID_CREDENTIALS');
  });

  it('returns INVALID_CREDENTIALS for a malformed email (no repo call)', async () => {
    const result = await makeUseCase().execute({
      email: 'not-an-email',
      password: 'pw',
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect((result.error as any).type).toBe('INVALID_CREDENTIALS');
    expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
  });

  it('does not issue a token on failed login', async () => {
    mockHasher.compare.mockResolvedValueOnce(false);

    await makeUseCase().execute({ email: 'user@example.com', password: 'wrong_pw' });

    expect(mockTokenService.sign).not.toHaveBeenCalled();
  });
});
