import { isFirebaseAiAuthConfigured } from '@/features/auth/services/firebaseAiAuth';

import flags from '../../feature-flags.json';

// Paid AI stays off in production until Atlas verifies the RevenueCat identity.
export function areAiFeaturesEnabled(): boolean {
  return (
    flags.aiFeatures &&
    isFirebaseAiAuthConfigured() &&
    (process.env.EXPO_PUBLIC_APP_ENV === 'development' ||
      process.env.EXPO_PUBLIC_APP_ENV === 'preview')
  );
}

export const AI_FEATURES_ENABLED = areAiFeaturesEnabled();
