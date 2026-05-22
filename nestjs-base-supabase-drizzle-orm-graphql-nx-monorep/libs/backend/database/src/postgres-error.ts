const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

type PostgresErrorLike = {
  cause?: unknown;
  code?: string;
  constraint?: string;
};

export function isPostgresUniqueViolation(
  error: unknown,
  constraint?: string,
): boolean {
  const postgresError = findPostgresError(error);

  return Boolean(
    postgresError?.code === POSTGRES_UNIQUE_VIOLATION_CODE &&
    (!constraint || postgresError.constraint === constraint),
  );
}

function findPostgresError(error: unknown): PostgresErrorLike | null {
  if (!isPostgresErrorLike(error)) {
    return null;
  }

  if (error.code) {
    return error;
  }

  return findPostgresError(error.cause);
}

function isPostgresErrorLike(error: unknown): error is PostgresErrorLike {
  return typeof error === 'object' && error !== null;
}
