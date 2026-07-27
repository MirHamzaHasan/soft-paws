export const supabaseAuthStorage = {
  getItem(key: string) {
    if (typeof localStorage === 'undefined') {
      return Promise.resolve(null);
    }

    return Promise.resolve(localStorage.getItem(key));
  },
  setItem(key: string, value: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }

    return Promise.resolve();
  },
  removeItem(key: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }

    return Promise.resolve();
  },
};
