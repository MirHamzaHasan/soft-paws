import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { supabaseAuthStorage } from '@/services/supabaseAuthStorage';
import type { Database } from '@/types/supabase';
import { getRequiredClientEnv, hasSupabaseClientEnv } from '@/utils/clientEnv';

export type BarklogSupabaseClient = SupabaseClient<Database>;

let supabaseClient: BarklogSupabaseClient | null = null;

export function getSupabaseClient(): BarklogSupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const env = getRequiredClientEnv();

  supabaseClient = createClient<Database>(
    env.EXPO_PUBLIC_SUPABASE_URL,
    env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: Platform.OS === 'web',
        persistSession: true,
        storage: Platform.OS === 'web' ? undefined : supabaseAuthStorage,
      },
      global: {
        headers: {
          'X-Client-Info': 'barklog-expo',
        },
      },
    },
  );

  return supabaseClient;
}

export function resetSupabaseClient() {
  supabaseClient = null;
}

export { hasSupabaseClientEnv };
