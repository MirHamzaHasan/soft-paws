export type BarklogErrorDomain =
  | 'ai'
  | 'export'
  | 'generic'
  | 'local_save'
  | 'local_profile'
  | 'purchase';

const AI_SAFE_FAILURE_MESSAGE =
  'BarkLog AI is unavailable right now. Your logs are still saved, and urgent concerns should go to your vet or Emergency SOS.';

const domainFallbacks: Record<BarklogErrorDomain, string> = {
  ai: AI_SAFE_FAILURE_MESSAGE,
  export: 'Unable to export right now. Please try again.',
  generic: 'Something went wrong. Please try again.',
  local_save: 'Unable to save this entry on this device. Please try again.',
  local_profile: 'Unable to open your local care journal right now. Please try again.',
  purchase: 'Unable to update Premium right now. Please try again.',
};

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
    /\b(sqlite|stack|sql|network request failed)\b/i.test(
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
