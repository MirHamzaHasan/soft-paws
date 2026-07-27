export const settingsStorage = {
  getItem(key: string) {
    return globalThis.localStorage?.getItem(key) ?? null;
  },
  removeItem(key: string) {
    globalThis.localStorage?.removeItem(key);
  },
  setItem(key: string, value: string) {
    globalThis.localStorage?.setItem(key, value);
  },
};
