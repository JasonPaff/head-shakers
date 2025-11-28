/**
 * Reusable Clerk authentication mock utilities for component tests.
 * Provides helpers to mock different authentication states.
 */
import { useAuth } from '@clerk/nextjs';
import { vi } from 'vitest';

/**
 * Authentication state override options
 */
interface AuthStateOverrides {
  isLoaded?: boolean;
  isSignedIn?: boolean;
  userId?: null | string;
}

type UseAuthReturn = ReturnType<typeof useAuth>;

/**
 * Mock Clerk authentication state with custom overrides
 * @param overrides - Partial auth state to override defaults
 */
export const mockClerkAuth = (overrides: AuthStateOverrides = {}): void => {
  const defaultState = {
    actor: null,
    getToken: vi.fn().mockResolvedValue('mock-token'),
    has: vi.fn().mockReturnValue(false),
    isLoaded: true,
    isSignedIn: false,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    sessionClaims: null,
    sessionId: null,
    signOut: vi.fn(),
    userId: null,
    ...overrides,
  } as UseAuthReturn;

  vi.mocked(useAuth).mockImplementation(() => defaultState);
};

/**
 * Mock authenticated user state (signed in)
 */
export const mockSignedInUser = (): void => {
  mockClerkAuth({
    isSignedIn: true,
    userId: 'test-user-id',
  });
};

/**
 * Mock unauthenticated user state (signed out)
 */
export const mockSignedOutUser = (): void => {
  mockClerkAuth({
    isSignedIn: false,
    userId: null,
  });
};

/**
 * Mock loading authentication state (not yet loaded)
 */
export const mockLoadingAuth = (): void => {
  mockClerkAuth({
    isLoaded: false,
  });
};
