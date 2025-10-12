import '@testing-library/jest-dom';

// Mock IndexedDB via idb-keyval
// This creates an in-memory store for testing
const mockStore = new Map<string, string>();

jest.mock('idb-keyval', () => ({
  get: jest.fn(async (key: string) => {
    return mockStore.get(key);
  }),
  set: jest.fn(async (key: string, value: string) => {
    mockStore.set(key, value);
  }),
  del: jest.fn(async (key: string) => {
    mockStore.delete(key);
  }),
  keys: jest.fn(async () => {
    return Array.from(mockStore.keys());
  }),
  clear: jest.fn(async () => {
    mockStore.clear();
  }),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Clear the mock store before each test
beforeEach(() => {
  mockStore.clear();
});

// Export the mockStore so tests can access it if needed
export { mockStore };
