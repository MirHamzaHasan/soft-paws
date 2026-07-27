import { createMMKV } from 'react-native-mmkv';

const supabaseAuthStore = createMMKV({ id: 'barklog-supabase-auth' });

export const supabaseAuthStorage = {
  getItem(key: string) {
    return Promise.resolve(supabaseAuthStore.getString(key) ?? null);
  },
  removeItem(key: string) {
    supabaseAuthStore.remove(key);
    return Promise.resolve();
  },
  setItem(key: string, value: string) {
    supabaseAuthStore.set(key, value);
    return Promise.resolve();
  },
};
