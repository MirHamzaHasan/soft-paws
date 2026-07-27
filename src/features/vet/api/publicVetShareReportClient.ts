import { getRequiredClientEnv } from '@/utils/clientEnv';

import type { VetShareReportSnapshot } from '../utils/vetReportBuilder';

export type PublicVetShareReportResponse = {
  created_at: string | null;
  expires_at: string;
  report: VetShareReportSnapshot;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export async function resolvePublicVetShareReport(token: string) {
  const env = getRequiredClientEnv();
  const url = `${trimTrailingSlash(
    env.EXPO_PUBLIC_SUPABASE_URL,
  )}/functions/v1/resolve-vet-share-link?token=${encodeURIComponent(token)}`;
  const response = await fetch(url, {
    headers: {
      apikey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  });

  if (!response.ok) {
    throw new Error('This BarkLog vet share link is unavailable or expired.');
  }

  return (await response.json()) as PublicVetShareReportResponse;
}
