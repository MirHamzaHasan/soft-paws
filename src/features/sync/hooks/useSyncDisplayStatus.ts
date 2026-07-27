import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';

import {
  type BarklogSyncStatusSnapshot,
  getBarklogSyncStatusSnapshot,
} from '@/db';
import {
  getCloudSyncCapability,
  getPremiumEntitlementState,
} from '@/features/premium/utils/premiumAccess';
import { useAuthSessionStore } from '@/stores';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

import { getSyncDisplayContent } from '../utils/syncDisplay';

export type SyncDisplayLoadState = 'error' | 'idle' | 'loading';

export function useSyncDisplayStatus() {
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const [snapshot, setSnapshot] = useState<BarklogSyncStatusSnapshot | null>(
    null,
  );
  const [loadState, setLoadState] = useState<SyncDisplayLoadState>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);

  const entitlementState = useMemo(
    () => getPremiumEntitlementState(barklogUser),
    [barklogUser],
  );
  const capability = useMemo(
    () => getCloudSyncCapability(barklogUser),
    [barklogUser],
  );

  const refresh = useCallback(async () => {
    setLoadState('loading');
    setLoadError(null);

    try {
      const nextSnapshot = await getBarklogSyncStatusSnapshot();

      setSnapshot(nextSnapshot);
      setLoadState('idle');
    } catch (error) {
      const message = getBarklogErrorMessage(error, {
        domain: 'sync',
        fallback: 'Unable to read backup status.',
      });

      setLoadError(message);
      setSnapshot({
        lastSyncError: message,
        pendingLocalChanges: false,
        phase: 'error',
      });
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => undefined);
    }, [refresh]),
  );

  const display = useMemo(
    () =>
      getSyncDisplayContent({
        capability,
        entitlementKind: entitlementState.kind,
        snapshot,
      }),
    [capability, entitlementState.kind, snapshot],
  );

  return {
    capability,
    display,
    entitlementState,
    isLoading: loadState === 'loading',
    loadError,
    loadState,
    refresh,
    snapshot,
  };
}
