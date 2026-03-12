import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../../../application/use-cases/auth/login-user.use-case';

@injectable()
export class AuthController {
  constructor(
    @inject(RegisterUserUseCase) private readonly registerUser: RegisterUserUseCase,
    @inject(LoginUserUseCase) private readonly loginUser: LoginUserUseCase,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.registerUser.execute(req.body);

    if (result.isErr()) {
      const error = result.error;
      const status = error === 'INVALID_EMAIL' || (typeof error === 'object' && error.type === 'EMAIL_ALREADY_EXISTS') ? 409 : 400;
      const message = typeof error === 'object' ? error.type : error;
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.value);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.loginUser.execute(req.body);

    if (result.isErr()) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }

    res.json(result.value);
  };

  logout = (_req: Request, res: Response): void => {
    res.status(200).json({ message: 'Logged out successfully' });
  };
}
