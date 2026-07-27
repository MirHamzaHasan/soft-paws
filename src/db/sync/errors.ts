export class BarklogSyncConflictError extends Error {
  readonly code = 'sync_conflict';

  constructor(message = 'Remote BarkLog data changed during sync.') {
    super(message);
    this.name = 'BarklogSyncConflictError';
  }
}

export function isBarklogSyncConflictError(
  error: unknown,
): error is BarklogSyncConflictError {
  return (
    error instanceof BarklogSyncConflictError ||
    (error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'sync_conflict')
  );
}
