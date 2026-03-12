import { inject, injectable } from 'tsyringe';
import { err, ok, Result } from '../../../shared/result';
import { UserId } from '../../../domain/value-objects/branded';
import { AuthError } from '../../../domain/errors/auth.errors';
import { IUserRepository } from '../../../domain/repositories/user.repository';

export interface GetMeOutput {
  id: string;
  email: string;
  createdAt: string;
}

@injectable()
export class GetMeUseCase {
  constructor(
    @inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<Result<GetMeOutput, AuthError>> {
    const user = await this.userRepo.findById(UserId(userId));
    if (!user) return err({ type: 'INVALID_TOKEN' } as AuthError);

    return ok({
      id: user.id,
      email: user.email.value,
      createdAt: user.createdAt.toISOString(),
    });
  }
}
