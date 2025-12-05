import { vi } from 'vitest';

import type { MockUseServerActionReturn } from '../mocks/hooks/use-server-action.mock';
import type { MockUseUserPreferencesReturn } from '../mocks/hooks/use-user-preferences.mock';
import type { MockQueryState, MockUseQueryStatesReturn } from '../mocks/nuqs.mock';
/**
 * Centralized setup utility for component test environment.
 * Provides a single function to configure all common mocks (router, nuqs, user preferences, server actions).
 * Reduces boilerplate by handling mock setup/cleanup for all component tests.
 */
import type { MockRouterReturn } from '../mocks/router.mock';

import { mockUseServerAction } from '../mocks/hooks/use-server-action.mock';
import { mockUseUserPreferences } from '../mocks/hooks/use-user-preferences.mock';
import { mockUseQueryStates } from '../mocks/nuqs.mock';
import { mockRouter } from '../mocks/router.mock';

/**
 * Type for the setState function from useQueryStates
 */
export type MockSetParams = (updates: Partial<MockQueryState>) => Promise<URLSearchParams>;

/**
 * Return type for setupComponentTestMocks
 */
interface ComponentTestMocks {
  queryStates: MockUseQueryStatesReturn;
  router: MockRouterReturn;
  serverAction: MockUseServerActionReturn;
  setParams: MockSetParams;
  userPreferences: MockUseUserPreferencesReturn;
}

/**
 * Options for customizing component test mock setup
 */
interface SetupComponentTestMocksOptions {
  /** Initial query state values */
  queryStates?: Partial<MockQueryState>;
  /** Custom router mock instance */
  router?: MockRouterReturn;
  /** Custom server action mock */
  serverAction?: MockUseServerActionReturn;
  /** Custom user preferences */
  userPreferences?: MockUseUserPreferencesReturn;
}

/**
 * Clean up mocks after tests.
 * Call in afterEach() to reset all mocks and restore original implementations.
 *
 * @example
 * ```typescript
 * describe('MyComponent', () => {
 *   beforeEach(() => {
 *     setupComponentTestMocks();
 *   });
 *
 *   afterEach(() => {
 *     cleanupComponentTestMocks();
 *   });
 *
 *   // ... tests
 * });
 * ```
 */
export function cleanupComponentTestMocks(): void {
  // Clear all mocks to reset call counts and implementations
  vi.clearAllMocks();

  // Unmock all modules to restore original implementations
  vi.unmock('next/navigation');
  vi.unmock('nuqs');
  vi.unmock('@/hooks/use-user-preferences');
  vi.unmock('@/hooks/use-server-action');
}

/**
 * Set up all common component test mocks.
 * Call in beforeEach() to ensure clean mock state.
 *
 * This function configures vi.mock for all common dependencies:
 * - next/navigation (router)
 * - nuqs (URL state management)
 * - @/hooks/use-user-preferences
 * - @/hooks/use-server-action
 *
 * @param options - Optional overrides for specific mocks
 * @returns References to all configured mocks for use in test assertions
 *
 * @example
 * ```typescript
 * import { setupComponentTestMocks, cleanupComponentTestMocks } from '@/tests/setup/component-test-environment';
 *
 * describe('MyComponent', () => {
 *   let mocks: ReturnType<typeof setupComponentTestMocks>;
 *
 *   beforeEach(() => {
 *     mocks = setupComponentTestMocks();
 *   });
 *
 *   afterEach(() => {
 *     cleanupComponentTestMocks();
 *   });
 *
 *   it('navigates when button clicked', async () => {
 *     render(<MyComponent />);
 *     await userEvent.click(screen.getByRole('button', { name: /next/i }));
 *     expect(mocks.router.push).toHaveBeenCalledWith('/next-page');
 *   });
 *
 *   it('updates search params', async () => {
 *     render(<MyComponent />);
 *     await userEvent.type(screen.getByRole('textbox'), 'baseball');
 *     expect(mocks.setParams).toHaveBeenCalledWith({ search: 'baseball' });
 *   });
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Custom initial state
 * const mocks = setupComponentTestMocks({
 *   queryStates: { search: 'test', page: 2 },
 *   userPreferences: mockUseUserPreferences({ collectionGridDensity: 'comfortable' }),
 * });
 * ```
 */
export function setupComponentTestMocks(options?: SetupComponentTestMocksOptions): ComponentTestMocks {
  // Create mock instances
  const routerMock = options?.router ?? mockRouter();
  const [queryStatesMock, setParamsMock] = mockUseQueryStates(options?.queryStates);
  const userPreferencesMock = options?.userPreferences ?? mockUseUserPreferences();
  const serverActionMock = options?.serverAction ?? mockUseServerAction();

  // Mock next/navigation
  vi.mock('next/navigation', () => ({
    usePathname: vi.fn(() => '/test-path'),
    useRouter: vi.fn(() => routerMock),
    useSearchParams: vi.fn(() => new URLSearchParams()),
  }));

  // Mock nuqs
  vi.mock('nuqs', () => ({
    useQueryStates: vi.fn(() => [queryStatesMock, setParamsMock]),
  }));

  // Mock use-user-preferences
  vi.mock('@/hooks/use-user-preferences', () => ({
    useUserPreferences: vi.fn(() => userPreferencesMock),
  }));

  // Mock use-server-action
  vi.mock('@/hooks/use-server-action', () => ({
    useServerAction: vi.fn(() => serverActionMock),
  }));

  return {
    queryStates: [queryStatesMock, setParamsMock] as const,
    router: routerMock,
    serverAction: serverActionMock,
    setParams: setParamsMock,
    userPreferences: userPreferencesMock,
  };
}
