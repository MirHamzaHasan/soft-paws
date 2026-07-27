import { useEffect } from 'react';

import { bootstrapAuthenticatedSession, getSupabaseClient } from '@/api';
import { useAuthSessionStore } from '@/stores';

function getReadableBootstrapError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to restore your BarkLog session';
}

export function useAuthSessionBootstrap() {
  const setBootstrapping = useAuthSessionStore(
    (state) => state.setBootstrapping,
  );
  const setSignedIn = useAuthSessionStore((state) => state.setSignedIn);
  const setSignedOut = useAuthSessionStore((state) => state.setSignedOut);

  useEffect(() => {
    let isMounted = true;
    let supabase: ReturnType<typeof getSupabaseClient>;

    try {
      supabase = getSupabaseClient();
    } catch (error) {
      setSignedOut(getReadableBootstrapError(error));
      return () => {
        isMounted = false;
      };
    }

    const hydrate = async (
      session: Awaited<
        ReturnType<typeof supabase.auth.getSession>
      >['data']['session'],
    ) => {
      if (!isMounted) {
        return;
      }

      if (!session) {
        setSignedOut();
        return;
      }

      setBootstrapping();

      try {
        const snapshot = await bootstrapAuthenticatedSession(session);

        if (isMounted) {
          setSignedIn(snapshot);
        }
      } catch (error) {
        if (isMounted) {
          setSignedOut(getReadableBootstrapError(error));
        }
      }
    };

    setBootstrapping();

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          throw error;
        }

        return hydrate(data.session);
      })
      .catch((error) => {
        if (isMounted) {
          setSignedOut(getReadableBootstrapError(error));
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrate(session).catch((error) => {
        if (isMounted) {
          setSignedOut(getReadableBootstrapError(error));
        }
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setBootstrapping, setSignedIn, setSignedOut]);
}
