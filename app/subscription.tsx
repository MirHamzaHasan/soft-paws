import { Redirect } from 'expo-router';

import { FREE_V1_RELEASE } from '@/config/releaseMode';

import SubscriptionManagementScreen from '../src/features/settings/screens/SubscriptionManagementScreen';

export default function SubscriptionRoute() {
  return FREE_V1_RELEASE ? <Redirect href="/settings" /> : <SubscriptionManagementScreen />;
}
