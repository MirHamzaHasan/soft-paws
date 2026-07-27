export type BarklogErrorDomain =
  | 'ai'
  | 'auth'
  | 'export'
  | 'generic'
  | 'local_save'
  | 'purchase'
  | 'share'
  | 'sync';

const AI_SAFE_FAILURE_MESSAGE =
  'BarkLog AI is unavailable right now. Your logs are still saved, and urgent concerns should go to your vet or Emergency SOS.';

const domainFallbacks: Record<BarklogErrorDomain, string> = {
  ai: AI_SAFE_FAILURE_MESSAGE,
  auth: 'Unable to complete that account action right now. Please try again.',
  export: 'Unable to export right now. Please try again.',
  generic: 'Something went wrong. Please try again.',
  local_save: 'Unable to save this entry on this device. Please try again.',
  purchase: 'Unable to update Premium right now. Please try again.',
  share: 'Unable to update this share link right now. Please try again.',
  sync: 'Unable to sync right now. Your local records are still available.',
};

const safeAuthMessages = new Set([
  'An account with this email already exists',
  'Invalid email or password',
  'Missing email address for authenticated user',
  'Unable to establish a session',
]);

const safeLocalSaveMessages = new Set([
  'Complete BarkLog onboarding before saving detailed events.',
  'Complete BarkLog onboarding before logging events.',
  'Add a medication before saving this event.',
]);

function readErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.trim();
  }

  if (typeof error === 'string') {
    return error.trim();
  }

  return '';
}

function isPurchaseCancellation(message: string) {
  return /cancelled|canceled/i.test(message);
}

function isRawTechnicalMessage(message: string) {
  return (
    /\b(jwt|postgres|postgrest|supabase|service[_-]?role|edge function|stack|sql|network request failed)\b/i.test(
      message,
    ) ||
    message.includes('{') ||
    message.includes(' at ')
  );
}

function isSafeMessage(domain: BarklogErrorDomain, message: string) {
  if (!message || isRawTechnicalMessage(message)) {
    return false;
  }

  if (domain === 'auth') {
    return safeAuthMessages.has(message);
  }

  if (domain === 'local_save') {
    return safeLocalSaveMessages.has(message);
  }

  return false;
}

export function getBarklogErrorMessage(
  error: unknown,
  {
    domain,
    fallback,
  }: {
    domain: BarklogErrorDomain;
    fallback?: string;
  },
) {
  const message = readErrorMessage(error);

  if (domain === 'ai') {
    return AI_SAFE_FAILURE_MESSAGE;
  }

  if (domain === 'purchase' && isPurchaseCancellation(message)) {
    return 'Purchase cancelled. Premium was not activated.';
  }

  if (isSafeMessage(domain, message)) {
    return message;
  }

  return fallback ?? domainFallbacks[domain];
}

export { AI_SAFE_FAILURE_MESSAGE };
