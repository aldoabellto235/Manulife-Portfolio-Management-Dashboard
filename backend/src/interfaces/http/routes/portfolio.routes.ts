import { Router } from 'express';
import { container } from 'tsyringe';
import { PortfolioController } from '../controllers/portfolio.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const ctrl = container.resolve(PortfolioController);

router.get('/', authMiddleware, ctrl.get);

export { router as portfolioRoutes };
