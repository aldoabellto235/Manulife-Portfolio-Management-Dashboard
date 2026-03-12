import 'reflect-metadata';
import { container } from 'tsyringe';
import { AppDataSource } from './infrastructure/persistence/typeorm/data-source';
import { TypeOrmUserRepository } from './infrastructure/persistence/repositories/typeorm-user.repository';
import { TypeOrmAssetRepository } from './infrastructure/persistence/repositories/typeorm-asset.repository';
import { BcryptPasswordHasher } from './infrastructure/auth/bcrypt-password-hasher';
import { JwtTokenService } from './infrastructure/auth/jwt-token-service';
import { PerformanceCalculatorService } from './domain/services/performance-calculator.service';

container.registerInstance('DataSource', AppDataSource);

container.register('IUserRepository', { useClass: TypeOrmUserRepository });
container.register('IAssetRepository', { useClass: TypeOrmAssetRepository });
container.register('IPasswordHasher', { useClass: BcryptPasswordHasher });
container.register('ITokenService', { useClass: JwtTokenService });
container.registerSingleton(PerformanceCalculatorService);

export { container };
