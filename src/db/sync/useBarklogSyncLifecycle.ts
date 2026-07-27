import { useEffect, useMemo, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { getCloudSyncCapability } from '@/features/premium/utils/premiumAccess';
import { useAuthSessionStore } from '@/stores';

import { syncBarklogData } from './engine';

function isReturningToForeground(
  previous: AppStateStatus,
  next: AppStateStatus,
) {
  return /inactive|background/.test(previous) && next === 'active';
}

export function useBarklogSyncLifecycle() {
  const bootstrapStatus = useAuthSessionStore((state) => state.bootstrapStatus);
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const sessionStatus = useAuthSessionStore((state) => state.sessionStatus);
  const previousAppStateRef = useRef<AppStateStatus>(AppState.currentState);
  const canSync = bootstrapStatus === 'ready' && sessionStatus === 'signed_in';
  const capability = useMemo(
    () => getCloudSyncCapability(barklogUser),
    [barklogUser],
  );

  useEffect(() => {
    if (!canSync) {
      return;
    }

    syncBarklogData({
      capability,
      trigger: 'auth_bootstrap',
    }).catch(() => undefined);
  }, [canSync, capability]);

  useEffect(() => {
    if (!canSync) {
      return undefined;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = previousAppStateRef.current;
      previousAppStateRef.current = nextState;

      if (isReturningToForeground(previousState, nextState)) {
        syncBarklogData({
          capability,
          trigger: 'app_foreground',
        }).catch(() => undefined);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [canSync, capability]);
}
