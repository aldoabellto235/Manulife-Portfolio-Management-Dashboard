import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { LoginSchema, RegisterSchema } from '../schemas/auth.schema';

const router = Router();
const ctrl = container.resolve(AuthController);

router.post('/register', validate(RegisterSchema), ctrl.register);
router.post('/login', validate(LoginSchema), ctrl.login);
router.post('/logout', authMiddleware, ctrl.logout);

export { router as authRoutes };
