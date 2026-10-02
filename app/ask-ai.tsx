import { type Href, Redirect } from 'expo-router';

import { AI_FEATURES_ENABLED } from '@/config/featureFlags';
import { getFirebaseAiAuthEmail } from '@/features/auth/services/firebaseAiAuth';

import AskBarkLogAiScreen from '../src/features/assistant/screens/AskBarkLogAiScreen';

export default function AskAiRoute() {
  if (!AI_FEATURES_ENABLED) return <Redirect href="/(tabs)" />;
  return getFirebaseAiAuthEmail() ? (
    <AskBarkLogAiScreen />
  ) : (
    <Redirect href={'/ai-sign-in' as Href} />
  );
}
