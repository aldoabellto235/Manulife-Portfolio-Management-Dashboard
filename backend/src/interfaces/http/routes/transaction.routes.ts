import { Router } from 'express';
import { container } from 'tsyringe';
import { TransactionController } from '../controllers/transaction.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { AddTransactionSchema } from '../schemas/transaction.schema';

const router = Router();
const ctrl = container.resolve(TransactionController);

router.get('/', authMiddleware, ctrl.list);
router.post('/', authMiddleware, validate(AddTransactionSchema), ctrl.add);
router.delete('/:id', authMiddleware, ctrl.remove);

export { router as transactionRoutes };
