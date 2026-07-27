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

export const PREMIUM_FEATURES: Record<
  PremiumFeatureKey,
  PremiumFeatureMetadata
> = {
  'ai-agents': {
    feature: 'ai-agents',
    label: 'AI Agent Center',
    shortValue:
      'Use specialist agents for health, behavior, training, records, and care coordination.',
  },
  'ask-barklog-ai': {
    feature: 'ask-barklog-ai',
    label: 'Ask BarkLog AI',
    shortValue:
      'Ask non-diagnostic questions about your dog logs and recent patterns.',
  },
  'care-automation': {
    feature: 'care-automation',
    label: 'Smart Care Automation',
    shortValue:
      'Sync care calendars, coordinate household tasks, and unlock future smart checklist automation.',
  },
  'care-summaries': {
    feature: 'care-summaries',
    label: 'AI Care Summaries',
    shortValue:
      'Generate short health, behavior, mood, nutrition, expense, and training summaries from raw logs.',
  },
  'cloud-sync': {
    feature: 'cloud-sync',
    label: 'Backup and Sync',
    shortValue:
      'Keep BarkLog backed up, restorable, and available across signed-in devices.',
  },
  'expense-tracker': {
    feature: 'expense-tracker',
    label: 'Expense Tracker',
    shortValue:
      'Track yearly spend, categories, and care costs without mixing it into daily logs.',
  },
  'household-sharing': {
    feature: 'household-sharing',
    label: 'Household Sharing and Sitter Mode',
    shortValue:
      'Invite family, sitters, and caregivers with role-based access to shared dog care logs.',
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
    label: 'Advanced Vet Reports and Share Links',
    shortValue:
      'Generate vet-ready summaries and secure share links while CSV and basic PDF export stay available.',
  },
  'weekly-insights': {
    feature: 'weekly-insights',
    label: 'AI Weekly Insights',
    shortValue:
      'Unlock weekly pattern narratives across meals, walks, medication, symptoms, and routines.',
  },
};

export const PAYWALL_FEATURE_ROWS = [
  PREMIUM_FEATURES['cloud-sync'].label,
  PREMIUM_FEATURES['household-sharing'].label,
  PREMIUM_FEATURES['care-automation'].label,
  PREMIUM_FEATURES['ai-agents'].label,
  PREMIUM_FEATURES['care-summaries'].label,
  PREMIUM_FEATURES['weekly-insights'].label,
  PREMIUM_FEATURES['ask-barklog-ai'].label,
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
