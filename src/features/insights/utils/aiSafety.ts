import type { BarklogUserRow } from '@/api';
import {
  AI_SAFE_FAILURE_MESSAGE,
  getBarklogErrorMessage,
} from '@/utils/barklogErrorMessages';

import type { PremiumFeatureKey } from '../../premium/utils/premiumAccess';
import { hasPremiumAccess } from '../../premium/utils/premiumAccess';

export const BARKLOG_AI_EMERGENCY_ESCALATION =
  'This could be urgent. Please call your vet or use Emergency SOS now, especially if breathing trouble, collapse, poisoning, bloat, seizure, or black/red stool is involved.';

export const BARKLOG_AI_SAFE_FAILURE_MESSAGE = AI_SAFE_FAILURE_MESSAGE;

export const BARKLOG_AI_PREMIUM_REQUIRED_MESSAGE =
  'BarkLog Premium is required for this AI feature.';

export const AI_EMERGENCY_PATTERN =
  /collapse|collapsed|trouble breathing|can't breathe|cannot breathe|seizure|poison|toxin|ate chocolate|ate grapes|xylitol|bloody stool|black stool|bloat|unconscious|hit by car/i;

const DIAGNOSTIC_CLAIM_PATTERN =
  /\b(has|have|is|are|diagnosed with|suffering from)\s+(parvo|pancreatitis|kidney failure|liver failure|cancer|diabetes|bloat|gdv|infection|obstruction)\b/i;

export class BarklogPremiumRequiredError extends Error {
  constructor(feature: PremiumFeatureKey) {
    super(BARKLOG_AI_PREMIUM_REQUIRED_MESSAGE);
    this.name = 'BarklogPremiumRequiredError';
    this.feature = feature;
  }

  readonly feature: PremiumFeatureKey;
}

export function containsEmergencyLanguage(input: string) {
  return AI_EMERGENCY_PATTERN.test(input);
}

export function containsDiagnosticClaim(input: string) {
  return DIAGNOSTIC_CLAIM_PATTERN.test(input);
}

export function assertPremiumAiAccess(
  user: BarklogUserRow | null | undefined,
  feature: PremiumFeatureKey,
) {
  if (!hasPremiumAccess(user)) {
    throw new BarklogPremiumRequiredError(feature);
  }
}

export function getSafeAiErrorMessage(error: unknown) {
  if (error instanceof BarklogPremiumRequiredError) {
    return BARKLOG_AI_PREMIUM_REQUIRED_MESSAGE;
  }

  return getBarklogErrorMessage(error, { domain: 'ai' });
}
