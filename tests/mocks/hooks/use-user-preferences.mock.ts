import { vi } from 'vitest';

/**
 * Mock utilities for useUserPreferences hook used in component tests.
 * Provides helpers to mock different user preference states.
 */
import type { UserPreferences } from '@/hooks/use-user-preferences';

/**
 * Return type matching the real useUserPreferences hook
 */
export interface MockUseUserPreferencesReturn {
  clearPreferences: ReturnType<typeof vi.fn>;
  preferences: UserPreferences;
  setPreference: ReturnType<typeof vi.fn>;
  setPreferences: ReturnType<typeof vi.fn>;
}

/**
 * Creates a mock implementation of the useUserPreferences hook.
 *
 * @param overrides - Partial preferences to override defaults
 * @returns Mock hook return value with vi.fn() mocks
 *
 * @example
 * ```typescript
 * // Mock with default preferences
 * const mockPreferences = mockUseUserPreferences();
 *
 * // Mock with custom preferences
 * const mockPreferences = mockUseUserPreferences({
 *   collectionGridDensity: 'comfortable',
 *   isBobbleheadHoverCardEnabled: false,
 * });
 *
 * // Use in tests
 * vi.mocked(useUserPreferences).mockReturnValue(mockPreferences);
 * ```
 */
export const mockUseUserPreferences = (
  overrides?: Partial<UserPreferences>,
): MockUseUserPreferencesReturn => {
  const defaultPreferences: UserPreferences = {
    collectionGridDensity: 'compact',
    isBobbleheadHoverCardEnabled: true,
    isCollectionHoverCardEnabled: true,
  };

  return {
    clearPreferences: vi.fn(),
    preferences: { ...defaultPreferences, ...overrides },
    setPreference: vi.fn(),
    setPreferences: vi.fn(),
  };
};

/**
 * Creates a mock with compact grid density (default)
 */
export const mockCompactGridPreferences = (): MockUseUserPreferencesReturn => {
  return mockUseUserPreferences({ collectionGridDensity: 'compact' });
};

/**
 * Creates a mock with comfortable grid density
 */
export const mockComfortableGridPreferences = (): MockUseUserPreferencesReturn => {
  return mockUseUserPreferences({ collectionGridDensity: 'comfortable' });
};

/**
 * Creates a mock with hover cards disabled
 */
export const mockHoverCardsDisabled = (): MockUseUserPreferencesReturn => {
  return mockUseUserPreferences({
    isBobbleheadHoverCardEnabled: false,
    isCollectionHoverCardEnabled: false,
  });
};
