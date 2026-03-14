import { User } from '../user.entity';
import { UserId } from '../../value-objects/branded';
import { Email } from '../../value-objects/email.vo';

const makeUser = () =>
  User.create({
    id: UserId('user-1'),
    email: Email.create('user@example.com').unwrap(),
    passwordHash: 'hashed_password_123',
  });

describe('User', () => {
  describe('create', () => {
    it('creates a user with correct props', () => {
      const user = makeUser();
      expect(user.id).toBe('user-1');
      expect(user.email.value).toBe('user@example.com');
      expect(user.passwordHash).toBe('hashed_password_123');
    });

    it('sets createdAt automatically', () => {
      const before = new Date();
      const user = makeUser();
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('reconstitute', () => {
    it('restores a user from persisted props', () => {
      const createdAt = new Date('2024-01-01');
      const user = User.reconstitute({
        id: UserId('user-99'),
        email: Email.create('restored@example.com').unwrap(),
        passwordHash: 'some_hash',
        createdAt,
      });
      expect(user.id).toBe('user-99');
      expect(user.email.value).toBe('restored@example.com');
      expect(user.createdAt).toBe(createdAt);
    });
  });
});
