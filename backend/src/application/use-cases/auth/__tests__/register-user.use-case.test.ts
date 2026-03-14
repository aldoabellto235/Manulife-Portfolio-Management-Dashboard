import 'reflect-metadata';
import { RegisterUserUseCase } from '../register-user.use-case';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { IPasswordHasher } from '../../../../application/ports/password-hasher.port';
import { ITokenService } from '../../../../application/ports/token-service.port';
import { User } from '../../../../domain/entities/user.entity';
import { UserId } from '../../../../domain/value-objects/branded';
import { Email } from '../../../../domain/value-objects/email.vo';

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockResolvedValue(undefined),
};

const mockHasher: jest.Mocked<IPasswordHasher> = {
  hash: jest.fn().mockResolvedValue('hashed_pw'),
  compare: jest.fn(),
};

const mockTokenService: jest.Mocked<ITokenService> = {
  sign: jest.fn().mockReturnValue('access_token_abc'),
  verify: jest.fn(),
};

const makeUseCase = () => new RegisterUserUseCase(mockUserRepo, mockHasher, mockTokenService);

describe('RegisterUserUseCase', () => {
  it('registers a new user and returns an access token', async () => {
    const result = await makeUseCase().execute({ email: 'new@example.com', password: 'secret' });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().accessToken).toBe('access_token_abc');
  });

  it('saves the user to the repository', async () => {
    await makeUseCase().execute({ email: 'new@example.com', password: 'secret' });

    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
  });

  it('hashes the password before saving', async () => {
    await makeUseCase().execute({ email: 'new@example.com', password: 'plain_pw' });

    expect(mockHasher.hash).toHaveBeenCalledWith('plain_pw');
  });

  it('signs a token with the new user id', async () => {
    await makeUseCase().execute({ email: 'new@example.com', password: 'secret' });

    const signCall = mockTokenService.sign.mock.calls[0][0];
    expect(signCall).toHaveProperty('userId');
    expect(typeof signCall.userId).toBe('string');
  });

  it('returns EMAIL_ALREADY_EXISTS when email is taken', async () => {
    const existing = User.create({
      id: UserId('user-1'),
      email: Email.create('existing@example.com').unwrap(),
      passwordHash: 'hash',
    });
    mockUserRepo.findByEmail.mockResolvedValueOnce(existing);

    const result = await makeUseCase().execute({ email: 'existing@example.com', password: 'pw' });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect((result.error as any).type).toBe('EMAIL_ALREADY_EXISTS');
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });

  it('returns INVALID_EMAIL for a malformed email', async () => {
    const result = await makeUseCase().execute({ email: 'not-an-email', password: 'pw' });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error).toBe('INVALID_EMAIL');
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });

  it('normalizes the email before checking for duplicates', async () => {
    mockUserRepo.findByEmail.mockResolvedValueOnce(null);

    await makeUseCase().execute({ email: '  NEW@EXAMPLE.COM  ', password: 'pw' });

    const emailArg = mockUserRepo.findByEmail.mock.calls[0][0];
    expect(emailArg.value).toBe('new@example.com');
  });
});
