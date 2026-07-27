import { useLocalSearchParams } from 'expo-router';

import HouseholdInviteAcceptScreen from '@/features/household/screens/HouseholdInviteAcceptScreen';

export default function HouseholdInviteRoute() {
  const params = useLocalSearchParams<{ token?: string }>();

  return <HouseholdInviteAcceptScreen token={params.token ?? ''} />;
}
