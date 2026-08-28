// In-memory token storage for testing.
// For production, replace this with expo-secure-store or another persistent storage
// after building a dev client with the correct native module version.
const memoryStore: Record<string, string> = {};

export const tokenStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return memoryStore[key] ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memoryStore[key] = value;
  },
  removeItem: async (key: string): Promise<void> => {
    delete memoryStore[key];
  },
};
