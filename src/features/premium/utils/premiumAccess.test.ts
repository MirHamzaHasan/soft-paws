import {
  BARKLOG_PREMIUM_PLANS,
  FREE_ACCESS_GUARANTEES,
  PREMIUM_FEATURES,
  PAYWALL_FEATURE_ROWS,
  REVENUECAT_ENTITLEMENT_ID,
} from '@/features/premium/data/premiumCatalog';
import {
  getPremiumEntitlementState,
  getPremiumFeatureLabel,
  getTrialDaysRemaining,
  hasPremiumAccess,
  shouldPromptForExpiredTrial,
} from '@/features/premium/utils/premiumAccess';

import { makeUserRow } from '../../../../test/utils/builders';

describe('premium access rules', () => {
  const now = new Date('2026-04-26T00:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers({
      now,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('treats active and grandfathered users as premium', () => {
    expect(
      hasPremiumAccess(
        makeUserRow({
          subscription_tier: 'active',
          trial_ends_at: null,
        }),
      ),
    ).toBe(true);
    expect(
      getPremiumEntitlementState(
        makeUserRow({
          subscription_tier: 'grandfathered',
          trial_ends_at: null,
        }),
        now,
      ),
    ).toMatchObject({
      hasAccess: true,
      kind: 'premium',
      label: 'Premium',
    });
  });

  it('grants access only while trial time remains', () => {
    const trialUser = makeUserRow({
      subscription_tier: 'trial',
      trial_ends_at: '2026-04-28T00:00:00.000Z',
    });
    const expiredTrialUser = makeUserRow({
      subscription_tier: 'trial',
      trial_ends_at: '2026-04-25T23:59:00.000Z',
    });

    expect(getTrialDaysRemaining(trialUser, now)).toBe(2);
    expect(getPremiumEntitlementState(trialUser, now)).toMatchObject({
      daysRemaining: 2,
      hasAccess: true,
      kind: 'trial',
      label: '2 trial days left',
    });
    expect(getPremiumEntitlementState(expiredTrialUser, now)).toMatchObject({
      hasAccess: false,
      kind: 'trial-expired',
      label: 'Trial expired',
    });
    expect(shouldPromptForExpiredTrial(expiredTrialUser)).toBe(true);
  });

  it('keeps free users out of premium-only features while preserving free rights', () => {
    expect(
      getPremiumEntitlementState(
        makeUserRow({
          subscription_tier: 'expired',
          trial_ends_at: null,
        }),
        now,
      ),
    ).toMatchObject({
      hasAccess: false,
      kind: 'free',
      label: 'Free',
    });
    expect(FREE_ACCESS_GUARANTEES).toEqual(
      expect.arrayContaining([
        'Daily event logging',
        'Timeline access',
        'CSV and PDF export',
        'Emergency and toxicity safety tools',
      ]),
    );
  });

  it('keeps RevenueCat entitlement and premium catalog labels centralized', () => {
    expect(REVENUECAT_ENTITLEMENT_ID).toBe('premium');
    expect(BARKLOG_PREMIUM_PLANS.annual.productId).toBe('barklog_annual');
    expect(PREMIUM_FEATURES['care-automation'].shortValue).toContain('on this device');
    expect(getPremiumFeatureLabel('ask-barklog-ai')).toBe('Ask BarkLog AI');
    expect(getPremiumFeatureLabel('ai-agents')).toBe('AI Agent Center');
    expect(getPremiumFeatureLabel('care-automation')).toBe(
      'Smart Care Automation',
    );
    expect(getPremiumFeatureLabel('care-summaries')).toBe('AI Care Summaries');
    expect(getPremiumFeatureLabel('training-programs')).toBe(
      'Training Programs',
    );
    expect(PAYWALL_FEATURE_ROWS.join(' ')).not.toMatch(/\b(sync|backup|sharing|AI)\b/i);
  });
});
