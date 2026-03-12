import './container';
import { env } from './infrastructure/config/env';
import { AppDataSource } from './infrastructure/persistence/typeorm/data-source';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { errorHandler } from './interfaces/middleware/error-handler.middleware';
import { authRoutes } from './interfaces/http/routes/auth.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);

app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log('[Database] TypeORM connection established');
    app.listen(env.PORT, () => {
      console.log(`[Server] Running on port ${env.PORT} (${env.NODE_ENV})`);
    });
  })
  .catch((err) => {
    console.error('[Database] Failed to connect:', err);
    process.exit(1);
  });

export default app;
