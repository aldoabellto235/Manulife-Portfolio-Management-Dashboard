import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserId } from '../../../domain/value-objects/branded';
import { UserModel } from '../typeorm/models/user.model';

export class UserMapper {
  static toDomain(raw: UserModel): User {
    return User.reconstitute({
      id: UserId(raw.id),
      email: Email.create(raw.email).unwrap(),
      passwordHash: raw.passwordHash,
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(user: User): UserModel {
    const model = new UserModel();
    model.id = user.id;
    model.email = user.email.value;
    model.passwordHash = user.passwordHash;
    model.createdAt = user.createdAt;
    return model;
  }
}
