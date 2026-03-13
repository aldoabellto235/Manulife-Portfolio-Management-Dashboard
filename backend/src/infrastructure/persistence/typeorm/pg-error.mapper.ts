interface PgError {
  code?: string;
  detail?: string;
  table?: string;
}

export type MappedPgError =
  | { type: 'DUPLICATE_ENTRY'; detail?: string }
  | { type: 'FOREIGN_KEY_VIOLATION'; detail?: string };

export function mapPgError(err: unknown): MappedPgError | null {
  const pgErr = err as PgError;

  if (pgErr?.code === '23505') {
    return { type: 'DUPLICATE_ENTRY', detail: pgErr.detail };
  }
  if (pgErr?.code === '23503') {
    return { type: 'FOREIGN_KEY_VIOLATION', detail: pgErr.detail };
  }

  return null;
}
