import { useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useLocalProfileStore } from '@/stores';

import { getLocalProfileRedirectTarget } from '../utils/localProfileRouting';

export function LocalProfileNavigationGate() {
  const router = useRouter();
  const segments = useSegments() as readonly string[];
  const rootNavigationState = useRootNavigationState();
  const profileStatus = useLocalProfileStore((state) => state.profileStatus);

  useEffect(() => {
    const target = getLocalProfileRedirectTarget({
      firstSegment: segments[0],
      profileStatus,
      rootNavigationReady: Boolean(rootNavigationState?.key),
    });
    if (target) router.replace(target);
  }, [profileStatus, rootNavigationState?.key, router, segments]);

  return null;
}
