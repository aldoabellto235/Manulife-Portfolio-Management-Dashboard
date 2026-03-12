import { inject, injectable } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserId } from '../../../domain/value-objects/branded';
import { UserModel } from '../typeorm/models/user.model';
import { UserMapper } from '../mappers/user.mapper';

@injectable()
export class TypeOrmUserRepository implements IUserRepository {
  private readonly repo: Repository<UserModel>;

  constructor(@inject('DataSource') dataSource: DataSource) {
    this.repo = dataSource.getRepository(UserModel);
  }

  async findById(id: UserId): Promise<User | null> {
    const raw = await this.repo.findOneBy({ id });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const raw = await this.repo.findOneBy({ email: email.value });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async save(user: User): Promise<void> {
    await this.repo.save(UserMapper.toPersistence(user));
  }
}
