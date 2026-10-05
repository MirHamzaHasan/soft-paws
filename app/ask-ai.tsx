import { Redirect } from 'expo-router';

import { AI_FEATURES_ENABLED, LOCAL_AI_ENABLED } from '@/config/featureFlags';

import AskBarkLogAiScreen from '../src/features/assistant/screens/AskBarkLogAiScreen';

export default function AskAiRoute() {
  if (!LOCAL_AI_ENABLED && !AI_FEATURES_ENABLED)
    return <Redirect href="/(tabs)" />;
  return <AskBarkLogAiScreen />;
}
