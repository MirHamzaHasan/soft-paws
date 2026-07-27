import { usePathname, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

import { trackScreenView } from '../services/analyticsService';

type UseRouteAnalyticsInput = {
  enabled: boolean;
};

export function useRouteAnalytics({ enabled }: UseRouteAnalyticsInput) {
  const pathname = usePathname();
  const segments = useSegments();
  const previousPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;

    trackScreenView(pathname, {
      route_group: segments[0] ?? 'root',
    });
  }, [enabled, pathname, segments]);
}
