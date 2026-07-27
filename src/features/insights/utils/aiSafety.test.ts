import {
  assertPremiumAiAccess,
  BARKLOG_AI_EMERGENCY_ESCALATION,
  BARKLOG_AI_PREMIUM_REQUIRED_MESSAGE,
  BARKLOG_AI_SAFE_FAILURE_MESSAGE,
  containsDiagnosticClaim,
  containsEmergencyLanguage,
  getSafeAiErrorMessage,
} from '@/features/insights/utils/aiSafety';

import { makeUserRow } from '../../../../test/utils/builders';

describe('AI safety helpers', () => {
  it('detects emergency language that should bypass generative AI', () => {
    expect(containsEmergencyLanguage('My dog ate grapes and collapsed')).toBe(
      true,
    );
    expect(BARKLOG_AI_EMERGENCY_ESCALATION).toContain('call your vet');
    expect(BARKLOG_AI_EMERGENCY_ESCALATION).toContain('Emergency SOS');
  });

  it('flags diagnostic-style claims for prompt fixture review', () => {
    expect(containsDiagnosticClaim('Your dog has pancreatitis')).toBe(true);
    expect(containsDiagnosticClaim('Worth discussing with your vet')).toBe(
      false,
    );
  });

  it('allows premium and active trial users but blocks free users', () => {
    expect(() =>
      assertPremiumAiAccess(
        makeUserRow({
          subscription_tier: 'active',
          trial_ends_at: null,
        }),
        'ask-barklog-ai',
      ),
    ).not.toThrow();
    expect(() =>
      assertPremiumAiAccess(
        makeUserRow({
          subscription_tier: 'expired',
          trial_ends_at: null,
        }),
        'weekly-insights',
      ),
    ).toThrow(BARKLOG_AI_PREMIUM_REQUIRED_MESSAGE);
  });

  it('keeps AI provider failures on the safe fallback copy', () => {
    expect(
      getSafeAiErrorMessage(new Error('provider returned raw diagnostic JSON')),
    ).toBe(BARKLOG_AI_SAFE_FAILURE_MESSAGE);
  });
});
