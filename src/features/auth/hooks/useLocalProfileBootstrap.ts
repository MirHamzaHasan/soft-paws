import { useEffect } from 'react';

import { bootstrapLocalProfile } from '@/api/localProfile';
import { useLocalProfileStore } from '@/stores';

export function useLocalProfileBootstrap() {
  const setProfile = useLocalProfileStore((state) => state.setProfile);
  const setProfileError = useLocalProfileStore((state) => state.setProfileError);

  useEffect(() => {
    let mounted = true;
    bootstrapLocalProfile()
      .then((profile) => {
        if (mounted) setProfile(profile);
      })
      .catch((error: unknown) => {
        if (mounted) {
          setProfileError(error instanceof Error ? error.message : 'Unable to open local care journal.');
        }
      });
    return () => { mounted = false; };
  }, [setProfile, setProfileError]);
}
