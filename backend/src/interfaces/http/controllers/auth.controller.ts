import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../../../application/use-cases/auth/login-user.use-case';
import { GetMeUseCase } from '../../../application/use-cases/auth/get-me.use-case';
import { errorResponse, successResponse } from '../../../shared/api-response';

@injectable()
export class AuthController {
  constructor(
    @inject(RegisterUserUseCase) private readonly registerUser: RegisterUserUseCase,
    @inject(LoginUserUseCase) private readonly loginUser: LoginUserUseCase,
    @inject(GetMeUseCase) private readonly getMe: GetMeUseCase,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.registerUser.execute(req.body);

    if (result.isErr()) {
      const error = result.error;
      const message = typeof error === 'object' ? error.type : error;
      const code = message === 'EMAIL_ALREADY_EXISTS' ? 409 : 400;
      res.status(code).json(errorResponse(message, code));
      return;
    }

    const response = successResponse(result.value, 201);
    res.status(201).json(response);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.loginUser.execute(req.body);

    if (result.isErr()) {
      res.status(401).json(errorResponse('INVALID_CREDENTIALS', 401));
      return;
    }

    res.json(successResponse(result.value));
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const result = await this.getMe.execute(req.userId!);

    if (result.isErr()) {
      res.status(401).json(errorResponse(result.error.type, 401));
      return;
    }

    res.json(successResponse(result.value));
  };

  logout = (_req: Request, res: Response): void => {
    res.json(successResponse({ message: 'Logged out successfully' }));
  };
}
