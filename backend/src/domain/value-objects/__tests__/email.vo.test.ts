import { Email } from '../email.vo';

describe('Email', () => {
  describe('create', () => {
    it('creates a valid email', () => {
      const result = Email.create('user@example.com');
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().value).toBe('user@example.com');
    });

    it('normalizes to lowercase', () => {
      const result = Email.create('User@Example.COM');
      expect(result.unwrap().value).toBe('user@example.com');
    });

    it('trims surrounding whitespace', () => {
      const result = Email.create('  user@example.com  ');
      expect(result.unwrap().value).toBe('user@example.com');
    });

    it('rejects email without @', () => {
      expect(Email.create('invalidemail.com').isErr()).toBe(true);
    });

    it('rejects email without domain', () => {
      expect(Email.create('user@').isErr()).toBe(true);
    });

    it('rejects email without local part', () => {
      expect(Email.create('@example.com').isErr()).toBe(true);
    });

    it('rejects empty string', () => {
      expect(Email.create('').isErr()).toBe(true);
    });

    it('rejects email with spaces', () => {
      expect(Email.create('user name@example.com').isErr()).toBe(true);
    });

    it('returns INVALID_EMAIL error', () => {
      const result = Email.create('bad-email');
      expect(result.isErr()).toBe(true);
      if (result.isErr()) expect(result.error).toBe('INVALID_EMAIL');
    });

    it('accepts subdomains', () => {
      expect(Email.create('user@mail.example.co.id').isOk()).toBe(true);
    });
  });

  describe('equals', () => {
    it('returns true for the same email', () => {
      const a = Email.create('user@example.com').unwrap();
      const b = Email.create('user@example.com').unwrap();
      expect(a.equals(b)).toBe(true);
    });

    it('returns true after normalization', () => {
      const a = Email.create('USER@EXAMPLE.COM').unwrap();
      const b = Email.create('user@example.com').unwrap();
      expect(a.equals(b)).toBe(true);
    });

    it('returns false for different emails', () => {
      const a = Email.create('a@example.com').unwrap();
      const b = Email.create('b@example.com').unwrap();
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the email string', () => {
      const email = Email.create('user@example.com').unwrap();
      expect(email.toString()).toBe('user@example.com');
    });
  });
});
