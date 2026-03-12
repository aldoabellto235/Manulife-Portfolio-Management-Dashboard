import { UserId } from '../value-objects/branded';
import { Email } from '../value-objects/email.vo';

interface UserProps {
  id: UserId;
  email: Email;
  passwordHash: string;
  createdAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: Omit<UserProps, 'createdAt'>): User {
    return new User({ ...props, createdAt: new Date() });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
