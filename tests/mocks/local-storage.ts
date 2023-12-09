export const localStorageMock = (() => {
  let store = {} as { [key: string]: string };
  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: unknown) {
      store[key] = `${value}`;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    length: Object.values(store).length,
    key(index: number) {
      return Object.keys(store)[index] || null;
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});
