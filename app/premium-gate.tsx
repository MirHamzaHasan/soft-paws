import { Redirect } from 'expo-router';

import { FREE_V1_RELEASE } from '@/config/releaseMode';

import PremiumGateScreen from '../src/features/premium/screens/PremiumGateScreen';

export default function PremiumGateRoute() {
  return FREE_V1_RELEASE ? <Redirect href="/(tabs)" /> : <PremiumGateScreen />;
}
