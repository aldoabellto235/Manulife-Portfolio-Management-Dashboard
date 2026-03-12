export type AuthError =
  | { type: 'EMAIL_ALREADY_EXISTS' }
  | { type: 'INVALID_CREDENTIALS' }
  | { type: 'INVALID_TOKEN' };
