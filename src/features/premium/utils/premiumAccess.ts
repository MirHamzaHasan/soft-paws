import type { BarklogUserRow } from '@/api';

export type PremiumFeatureKey =
  | 'ai-agents'
  | 'ask-barklog-ai'
  | 'care-automation'
  | 'care-summaries'
  | 'expense-tracker'
  | 'memory-book'
  | 'monthly-trends'
  | 'multi-dog'
  | 'photo-compare'
  | 'training-programs'
  | 'vet-pdf-reports'
  | 'weekly-insights';

const featureLabels: Record<PremiumFeatureKey, string> = {
  'ai-agents': 'AI Agent Center',
  'ask-barklog-ai': 'Ask BarkLog AI',
  'care-automation': 'Smart Care Automation',
  'care-summaries': 'AI Care Summaries',
  'expense-tracker': 'Expense Tracker',
  'memory-book': 'Memory Book',
  'monthly-trends': 'Monthly Trends',
  'multi-dog': 'Multiple Dogs',
  'photo-compare': 'Photo Compare',
  'training-programs': 'Training Programs',
  'vet-pdf-reports': 'Advanced Vet Reports',
  'weekly-insights': 'AI Weekly Insights',
};

export type PremiumEntitlementState =
  | {
      daysRemaining: number;
      hasAccess: true;
      kind: 'premium' | 'trial';
      label: string;
    }
  | {
      daysRemaining: 0;
      hasAccess: false;
      kind: 'free' | 'trial-expired' | 'unknown';
      label: string;
    };

export function getTrialDaysRemaining(
  user: BarklogUserRow | null | undefined,
  now = new Date(),
) {
  if (!user?.trial_ends_at) {
    return 0;
  }

  const trialEndsAt = new Date(user.trial_ends_at).getTime();

  if (!Number.isFinite(trialEndsAt)) {
    return 0;
  }

  const millisecondsRemaining = trialEndsAt - now.getTime();

  if (millisecondsRemaining <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(millisecondsRemaining / 86_400_000));
}

export function getPremiumEntitlementState(
  user: BarklogUserRow | null | undefined,
  now = new Date(),
): PremiumEntitlementState {
  if (!user) {
    return {
      daysRemaining: 0,
      hasAccess: false,
      kind: 'unknown',
      label: 'Unknown',
    };
  }

  if (
    user.subscription_tier === 'active' ||
    user.subscription_tier === 'grandfathered'
  ) {
    return {
      daysRemaining: 0,
      hasAccess: true,
      kind: 'premium',
      label: 'Premium',
    };
  }

  if (user.subscription_tier === 'trial') {
    const daysRemaining = getTrialDaysRemaining(user, now);

    if (daysRemaining > 0) {
      return {
        daysRemaining,
        hasAccess: true,
        kind: 'trial',
        label:
          daysRemaining === 1
            ? 'Trial ends tomorrow'
            : `${daysRemaining} trial days left`,
      };
    }

    return {
      daysRemaining: 0,
      hasAccess: false,
      kind: 'trial-expired',
      label: 'Trial expired',
    };
  }

  return {
    daysRemaining: 0,
    hasAccess: false,
    kind: 'free',
    label: 'Free',
  };
}

export function hasPremiumAccess(user: BarklogUserRow | null | undefined) {
  return getPremiumEntitlementState(user).hasAccess;
}

export function shouldPromptForExpiredTrial(
  user: BarklogUserRow | null | undefined,
) {
  return getPremiumEntitlementState(user).kind === 'trial-expired';
}

export function getPremiumFeatureLabel(feature: PremiumFeatureKey) {
  return featureLabels[feature];
}
