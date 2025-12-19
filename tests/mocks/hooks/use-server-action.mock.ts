/* eslint-disable react-snob/require-boolean-prefix-is */
/**
 * Mock utilities for useServerAction hook used in component tests.
 * Provides helpers to mock different action execution states.
 */
import { vi } from 'vitest';

/**
 * Return type matching the useServerAction hook
 */
export interface MockUseServerActionReturn {
  executeAsync: ReturnType<typeof vi.fn>;
  hasErrored: boolean;
  hasExecuted: boolean;
  hasSucceeded: boolean;
  isExecuting: boolean;
  reset: ReturnType<typeof vi.fn>;
  result: {
    data?: unknown;
    serverError?: string;
    validationErrors?: Record<string, { _errors: Array<string> }>;
  };
  status: 'executing' | 'hasErrored' | 'hasSucceeded' | 'idle';
}

/**
 * Options for customizing the mock server action state
 */
interface MockServerActionOptions {
  /** Error message to return */
  error?: string;
  /** Custom executeAsync implementation */
  executeAsync?: ReturnType<typeof vi.fn>;
  /** Whether the action is currently loading */
  loading?: boolean;
}

/**
 * Creates a mock implementation of the useServerAction hook.
 *
 * @param overrides - Options to customize the mock state
 * @returns Mock hook return value with vi.fn() mocks
 *
 * @example
 * ```typescript
 * // Mock successful action
 * const mockAction = mockUseServerAction();
 *
 * // Mock loading action
 * const mockAction = mockUseServerAction({ loading: true });
 *
 * // Mock action with error
 * const mockAction = mockUseServerAction({ error: 'Something went wrong' });
 *
 * // Mock with custom executeAsync
 * const mockAction = mockUseServerAction({
 *   executeAsync: vi.fn().mockResolvedValue({ id: '123', name: 'Test' }),
 * });
 * ```
 */
export const mockUseServerAction = (overrides?: MockServerActionOptions): MockUseServerActionReturn => {
  const isExecuting = overrides?.loading ?? false;
  const hasErrored = Boolean(overrides?.error);
  const hasSucceeded = !isExecuting && !hasErrored;
  const hasExecuted = hasSucceeded || hasErrored;

  const status =
    isExecuting ? 'executing'
    : hasErrored ? 'hasErrored'
    : hasSucceeded ? 'hasSucceeded'
    : 'idle';

  return {
    executeAsync: overrides?.executeAsync ?? vi.fn().mockResolvedValue({ success: true }),
    hasErrored,
    hasExecuted,
    hasSucceeded,
    isExecuting,
    reset: vi.fn(),
    result: {
      data: hasSucceeded ? { success: true } : undefined,
      serverError: overrides?.error,
      validationErrors: undefined,
    },
    status,
  };
};

/**
 * Creates a mock in idle state (not yet executed)
 */
export const mockIdleServerAction = (): MockUseServerActionReturn => {
  return {
    executeAsync: vi.fn().mockResolvedValue({ success: true }),
    hasErrored: false,
    hasExecuted: false,
    hasSucceeded: false,
    isExecuting: false,
    reset: vi.fn(),
    result: {
      data: undefined,
      serverError: undefined,
      validationErrors: undefined,
    },
    status: 'idle',
  };
};

/**
 * Creates a mock in loading state
 */
export const mockLoadingServerAction = (): MockUseServerActionReturn => {
  return mockUseServerAction({ loading: true });
};

/**
 * Creates a mock with the error state
 */
export const mockErrorServerAction = (error = 'Something went wrong'): MockUseServerActionReturn => {
  return mockUseServerAction({ error });
};

/**
 * Creates a mock with successful state and custom data
 */
export const mockSuccessServerAction = <T>(data: T): MockUseServerActionReturn => {
  return {
    executeAsync: vi.fn().mockResolvedValue(data),
    hasErrored: false,
    hasExecuted: true,
    hasSucceeded: true,
    isExecuting: false,
    reset: vi.fn(),
    result: {
      data,
      serverError: undefined,
      validationErrors: undefined,
    },
    status: 'hasSucceeded',
  };
};
