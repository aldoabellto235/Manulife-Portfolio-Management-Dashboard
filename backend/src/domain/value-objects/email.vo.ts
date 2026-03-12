import { err, ok, Result } from 'neverthrow';

export class Email {
  private constructor(private readonly _value: string) {}

  static create(raw: string): Result<Email, 'INVALID_EMAIL'> {
    const trimmed = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return err('INVALID_EMAIL');
    }
    return ok(new Email(trimmed));
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
