import { inject, injectable } from 'tsyringe';
import { randomUUID } from 'crypto';
import { err, ok, Result } from '../../../shared/result';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserId } from '../../../domain/value-objects/branded';
import { AuthError } from '../../../domain/errors/auth.errors';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IPasswordHasher } from '../../ports/password-hasher.port';
import { ITokenService } from '../../ports/token-service.port';

export interface RegisterUserInput {
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  accessToken: string;
}

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepo: IUserRepository,
    @inject('IPasswordHasher') private readonly hasher: IPasswordHasher,
    @inject('ITokenService') private readonly tokenService: ITokenService,
  ) {}

  async execute(
    input: RegisterUserInput,
  ): Promise<Result<RegisterUserOutput, AuthError | 'INVALID_EMAIL'>> {
    const emailResult = Email.create(input.email);
    if (emailResult.isErr()) return err(emailResult.error);

    const existing = await this.userRepo.findByEmail(emailResult.value);
    if (existing) return err({ type: 'EMAIL_ALREADY_EXISTS' } as AuthError);

    const passwordHash = await this.hasher.hash(input.password);

    const user = User.create({
      id: UserId(randomUUID()),
      email: emailResult.value,
      passwordHash,
    });

    await this.userRepo.save(user);

    const accessToken = this.tokenService.sign({ userId: user.id });

    return ok({ accessToken });
  }
}
