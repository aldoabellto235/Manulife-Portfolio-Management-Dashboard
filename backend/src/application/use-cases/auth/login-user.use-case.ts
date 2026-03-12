import { inject, injectable } from 'tsyringe';
import { err, ok, Result } from 'neverthrow';
import { Email } from '../../../domain/value-objects/email.vo';
import { AuthError } from '../../../domain/errors/auth.errors';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IPasswordHasher } from '../../ports/password-hasher.port';
import { ITokenService } from '../../ports/token-service.port';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  accessToken: string;
}

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepo: IUserRepository,
    @inject('IPasswordHasher') private readonly hasher: IPasswordHasher,
    @inject('ITokenService') private readonly tokenService: ITokenService,
  ) {}

  async execute(
    input: LoginUserInput,
  ): Promise<Result<LoginUserOutput, AuthError | 'INVALID_EMAIL'>> {
    const emailResult = Email.create(input.email);
    if (emailResult.isErr()) return err({ type: 'INVALID_CREDENTIALS' });

    const user = await this.userRepo.findByEmail(emailResult.value);
    if (!user) return err({ type: 'INVALID_CREDENTIALS' });

    const passwordMatch = await this.hasher.compare(input.password, user.passwordHash);
    if (!passwordMatch) return err({ type: 'INVALID_CREDENTIALS' });

    const accessToken = this.tokenService.sign({ userId: user.id });

    return ok({ accessToken });
  }
}
