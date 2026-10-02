import { Redirect } from 'expo-router';

import { AI_FEATURES_ENABLED } from '@/config/featureFlags';
import AiAgentCenterScreen from '@/features/assistant/screens/AiAgentCenterScreen';

export default function AiAgentsRoute() {
  return AI_FEATURES_ENABLED ? <AiAgentCenterScreen /> : <Redirect href="/(tabs)" />;
}
