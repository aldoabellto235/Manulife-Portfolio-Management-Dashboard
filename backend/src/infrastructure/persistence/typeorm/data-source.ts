import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../../config/env';
import { UserModel } from './models/user.model';
import { AssetModel } from './models/asset.model';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  synchronize: env.NODE_ENV === 'development',
  logging: env.NODE_ENV === 'development',
  entities: [UserModel, AssetModel],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  subscribers: [],
});
