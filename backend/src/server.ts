import './container';
import { env } from './infrastructure/config/env';
import { AppDataSource } from './infrastructure/persistence/typeorm/data-source';
import { logger } from './shared/logger';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './interfaces/middleware/error-handler.middleware';
import { requestIdMiddleware } from './interfaces/middleware/request-id.middleware';
import { requestLogger } from './interfaces/middleware/request-logger.middleware';
import { authRateLimit, globalRateLimit } from './interfaces/middleware/rate-limit.middleware';
import { authRoutes } from './interfaces/http/routes/auth.routes';
import { investmentRoutes } from './interfaces/http/routes/investment.routes';
import { portfolioRoutes } from './interfaces/http/routes/portfolio.routes';
import { transactionRoutes } from './interfaces/http/routes/transaction.routes';
import { basicAuthMiddleware } from './interfaces/middleware/basic-auth.middleware';
import { swaggerSpec } from './infrastructure/config/swagger';

const app = express();
const API_PREFIX_V1 = '/api/v1';

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger);
app.use(globalRateLimit);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (_req, res) => res.json(swaggerSpec));

app.use(`${API_PREFIX_V1}/auth`, authRateLimit, authRoutes);
app.use(`${API_PREFIX_V1}/investments`, investmentRoutes);
app.use(`${API_PREFIX_V1}/portfolio`, portfolioRoutes);
app.use(`${API_PREFIX_V1}/transactions`, transactionRoutes);

app.use(errorHandler);

AppDataSource.initialize()
  .then(async () => {
    logger.info('Database connected');
    await AppDataSource.runMigrations();
    logger.info('Migrations complete');
    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`, { env: env.NODE_ENV });
    });

    process.on('SIGTERM', () => {
      server.close(() => process.exit(0));
    });
  })
  .catch((err) => {
    logger.error('Database connection failed', { error: err });
    process.exit(1);
  });

export default app;
