import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { server } from './msw.setup';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Clean up after each test
// Note: cleanup() is performed automatically by Vitest's testing-library integration
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

// Close MSW server after all tests
afterAll(() => server.close());

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
  useParams: () => ({}),
  usePathname: () => '/',
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    delete: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(() => []),
    has: vi.fn(() => false),
    set: vi.fn(),
  }),
  headers: () => new Headers(),
}));

// Mock Clerk authentication
vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: unknown }) => children,
  SignedIn: ({ children }: { children: unknown }) => children,
  SignedOut: () => null,
  SignInButton: () => null,
  SignOutButton: () => null,
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('mock-token'),
    isLoaded: true,
    isSignedIn: true,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    sessionId: 'mock-session-id',
    signOut: vi.fn(),
    userId: 'test-user-id',
  }),
  useClerk: () => ({
    openSignIn: vi.fn(),
    openSignUp: vi.fn(),
    signOut: vi.fn(),
  }),
  UserButton: () => null,
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      firstName: 'Test',
      fullName: 'Test User',
      id: 'test-user-id',
      imageUrl: 'https://example.com/avatar.jpg',
      lastName: 'User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      username: 'testuser',
    },
  }),
}));

// Mock Clerk server-side auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({
    userId: 'test-user-id',
  })),
  clerkClient: vi.fn(() => ({
    users: {
      getUser: vi.fn().mockResolvedValue({
        firstName: 'Test',
        id: 'test-user-id',
        lastName: 'User',
        username: 'testuser',
      }),
    },
  })),
  currentUser: vi.fn().mockResolvedValue({
    firstName: 'Test',
    id: 'test-user-id',
    lastName: 'User',
    username: 'testuser',
  }),
}));

// Mock sonner toast notifications
vi.mock('sonner', () => ({
  toast: {
    dismiss: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    message: vi.fn(),
    promise: vi.fn(<T>(promise: Promise<T>): Promise<T> => promise),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: unknown }) => children,
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
    theme: 'light',
    themes: ['light', 'dark'],
  }),
}));

// Suppress console errors for expected React errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: Array<unknown>) => {
    // Filter out known React/testing noise
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: An update to') ||
        args[0].includes('act(...)'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
