import type { PremiumFeatureKey } from '../utils/premiumAccess';

export type BarklogPremiumPlanId = 'annual' | 'monthly';

export type BarklogPremiumPlan = {
  badge?: string;
  description: string;
  id: BarklogPremiumPlanId;
  priceLabel: string;
  productId: string;
  title: string;
};

export type PremiumFeatureMetadata = {
  feature: PremiumFeatureKey;
  label: string;
  shortValue: string;
};

export const REVENUECAT_ENTITLEMENT_ID = 'premium';

export const BARKLOG_PREMIUM_PLANS: Record<
  BarklogPremiumPlanId,
  BarklogPremiumPlan
> = {
  annual: {
    badge: 'Best value',
    description: 'Full premium access with the lowest yearly price.',
    id: 'annual',
    priceLabel: '$49/year',
    productId: 'barklog_annual',
    title: 'Annual',
  },
  monthly: {
    description: 'Premium access with monthly flexibility.',
    id: 'monthly',
    priceLabel: '$5.99/month',
    productId: 'barklog_monthly',
    title: 'Monthly',
  },
};

export type AvailablePremiumFeatureKey = Exclude<PremiumFeatureKey,
  'ai-agents' | 'ask-barklog-ai' | 'care-summaries' | 'weekly-insights'>;

export const PREMIUM_FEATURES: Record<
  AvailablePremiumFeatureKey,
  PremiumFeatureMetadata
> = {
  'care-automation': {
    feature: 'care-automation',
    label: 'Smart Care Automation',
    shortValue: 'Plan recurring care and smart checklists on this device.',
  },
  'expense-tracker': {
    feature: 'expense-tracker',
    label: 'Expense Tracker',
    shortValue:
      'Track yearly spend, categories, and care costs without mixing it into daily logs.',
  },
  'memory-book': {
    feature: 'memory-book',
    label: 'Memory Book',
    shortValue:
      'Turn monthly activity and photos into a shareable BarkLog keepsake.',
  },
  'monthly-trends': {
    feature: 'monthly-trends',
    label: 'Monthly Trends',
    shortValue:
      'See longer-term rhythm shifts across activity, symptoms, weight, and routines.',
  },
  'multi-dog': {
    feature: 'multi-dog',
    label: 'Multiple Dogs',
    shortValue:
      'Add more dogs and coordinate each dog record without losing the free one-dog path.',
  },
  'photo-compare': {
    feature: 'photo-compare',
    label: 'Photo Compare',
    shortValue:
      'Compare symptom, weight, care, and baseline photos over time for better visual context.',
  },
  'training-programs': {
    feature: 'training-programs',
    label: 'Training Programs',
    shortValue:
      'Start guided programs, save step progress, and keep training history in the care record.',
  },
  'vet-pdf-reports': {
    feature: 'vet-pdf-reports',
    label: 'Advanced Vet Reports',
    shortValue: 'Advanced local report layouts. Basic PDF and CSV export stay free.',
  },
};

export const PAYWALL_FEATURE_ROWS = [
  PREMIUM_FEATURES['care-automation'].label,
  PREMIUM_FEATURES['training-programs'].label,
  PREMIUM_FEATURES['multi-dog'].label,
  PREMIUM_FEATURES['photo-compare'].label,
  PREMIUM_FEATURES['monthly-trends'].label,
  PREMIUM_FEATURES['expense-tracker'].label,
  PREMIUM_FEATURES['memory-book'].label,
];

export const FREE_ACCESS_GUARANTEES = [
  'Daily event logging',
  'Timeline access',
  'CSV and PDF export',
  'Emergency and toxicity safety tools',
];
