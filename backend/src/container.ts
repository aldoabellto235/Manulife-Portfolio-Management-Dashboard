import 'reflect-metadata';
import { container } from 'tsyringe';
import { AppDataSource } from './infrastructure/persistence/typeorm/data-source';

container.registerInstance('DataSource', AppDataSource);

export { container };
