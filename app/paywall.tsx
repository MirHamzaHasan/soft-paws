import { Redirect } from 'expo-router';

import { FREE_V1_RELEASE } from '@/config/releaseMode';

import PaywallScreen from '../src/features/premium/screens/PaywallScreen';

export default function PaywallRoute() {
  return FREE_V1_RELEASE ? <Redirect href="/(tabs)" /> : <PaywallScreen />;
}
