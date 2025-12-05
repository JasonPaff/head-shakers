/**
 * Mock utilities for Next.js router (useRouter from next/navigation) used in component tests.
 * Provides helpers to mock router navigation and state.
 */
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { vi } from 'vitest';

/**
 * Return type matching the Next.js useRouter hook from next/navigation
 */
export type MockRouterReturn = AppRouterInstance;

/**
 * Creates a mock implementation of the Next.js App Router.
 *
 * @returns Mock router instance with vi.fn() mocks for all methods
 *
 * @example
 * ```typescript
 * import { useRouter } from 'next/navigation';
 *
 * // Mock the router
 * const mockRouterInstance = mockRouter();
 * vi.mocked(useRouter).mockReturnValue(mockRouterInstance);
 *
 * // Test navigation
 * render(<MyComponent />);
 * await userEvent.click(screen.getByRole('button', { name: /navigate/i }));
 * expect(mockRouterInstance.push).toHaveBeenCalledWith('/some-path');
 * ```
 */
export const mockRouter = (): MockRouterReturn => {
  return {
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  } as MockRouterReturn;
};

/**
 * Creates a router mock with specific method implementations
 */
export const mockRouterWithImplementation = (
  implementations: Partial<MockRouterReturn>,
): MockRouterReturn => {
  return {
    ...mockRouter(),
    ...implementations,
  };
};

/**
 * Creates a router mock that tracks navigation calls
 */
export const mockRouterWithTracking = (): MockRouterReturn & {
  calls: Array<{ args: Array<unknown>; method: string; }>;
} => {
  const calls: Array<{ args: Array<unknown>; method: string; }> = [];

  const trackCall = (method: string) => {
    return vi.fn((...args: Array<unknown>) => {
      calls.push({ args, method });
    });
  };

  return {
    back: trackCall('back'),
    calls,
    forward: trackCall('forward'),
    prefetch: trackCall('prefetch'),
    push: trackCall('push'),
    refresh: trackCall('refresh'),
    replace: trackCall('replace'),
  } as MockRouterReturn & { calls: Array<{ args: Array<unknown>; method: string; }> };
};
