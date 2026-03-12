import 'reflect-metadata';
import { container } from 'tsyringe';
import { AppDataSource } from './infrastructure/persistence/typeorm/data-source';
import { TypeOrmUserRepository } from './infrastructure/persistence/repositories/typeorm-user.repository';
import { BcryptPasswordHasher } from './infrastructure/auth/bcrypt-password-hasher';
import { JwtTokenService } from './infrastructure/auth/jwt-token-service';

container.registerInstance('DataSource', AppDataSource);

container.register('IUserRepository', { useClass: TypeOrmUserRepository });
container.register('IPasswordHasher', { useClass: BcryptPasswordHasher });
container.register('ITokenService', { useClass: JwtTokenService });

export { container };
