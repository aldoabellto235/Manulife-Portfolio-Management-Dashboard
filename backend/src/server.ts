import './container';
import { env } from './infrastructure/config/env';
import { AppDataSource } from './infrastructure/persistence/typeorm/data-source';
import { logger } from './shared/logger';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './interfaces/middleware/error-handler.middleware';
import { requestLogger } from './interfaces/middleware/request-logger.middleware';
import { authRoutes } from './interfaces/http/routes/auth.routes';
import { investmentRoutes } from './interfaces/http/routes/investment.routes';
import { portfolioRoutes } from './interfaces/http/routes/portfolio.routes';
import { transactionRoutes } from './interfaces/http/routes/transaction.routes';
import { basicAuthMiddleware } from './interfaces/middleware/basic-auth.middleware';
import { swaggerSpec } from './infrastructure/config/swagger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', basicAuthMiddleware, (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (_req, res) => res.json(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/investments', investmentRoutes);
app.use('/portfolio', portfolioRoutes);
app.use('/transactions', transactionRoutes);

app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    logger.info('Database connected');
    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`, { env: env.NODE_ENV });
    });
  })
  .catch((err) => {
    logger.error('Database connection failed', { error: err });
    process.exit(1);
  });

export default app;
