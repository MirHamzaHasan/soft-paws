import { createMMKV } from 'react-native-mmkv';

const settingsStore = createMMKV({ id: 'barklog-settings' });

export const settingsStorage = {
  getItem(key: string) {
    return settingsStore.getString(key) ?? null;
  },
  removeItem(key: string) {
    settingsStore.remove(key);
  },
  setItem(key: string, value: string) {
    settingsStore.set(key, value);
  },
};
