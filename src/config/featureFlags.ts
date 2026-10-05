import { Platform } from 'react-native';

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

// The starter model runs only in native builds. Atlas remains separately gated.
export const LOCAL_AI_ENABLED =
  flags.aiFeatures && (Platform.OS === 'android' || Platform.OS === 'ios');
