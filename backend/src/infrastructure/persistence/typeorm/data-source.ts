import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../../config/env';
import { UserModel } from './models/user.model';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  synchronize: env.NODE_ENV === 'development',
  logging: env.NODE_ENV === 'development',
  entities: [UserModel],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  subscribers: [],
});
