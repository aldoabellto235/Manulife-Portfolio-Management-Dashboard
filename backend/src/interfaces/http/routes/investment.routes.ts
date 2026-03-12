import { Router } from 'express';
import { container } from 'tsyringe';
import { InvestmentController } from '../controllers/investment.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { AddInvestmentSchema, EditInvestmentSchema } from '../schemas/investment.schema';

const router = Router();
const ctrl = container.resolve(InvestmentController);

router.get('/', authMiddleware, ctrl.list);
router.post('/', authMiddleware, validate(AddInvestmentSchema), ctrl.add);
router.get('/:id', authMiddleware, ctrl.getOne);
router.patch('/:id', authMiddleware, validate(EditInvestmentSchema), ctrl.edit);
router.delete('/:id', authMiddleware, ctrl.remove);

export { router as investmentRoutes };
