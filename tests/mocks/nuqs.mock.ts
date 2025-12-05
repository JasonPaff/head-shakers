/**
 * Mock utilities for nuqs (URL state management) used in component tests.
 * Provides helpers to mock URL search params state and updates.
 */
import { vi } from 'vitest';

/**
 * Common query state structure for bobblehead/collection grids
 */
export interface MockQueryState {
  /** Currently displayed modal: 'add' to show add dialog, 'edit' for edit, null for none */
  // eslint-disable-next-line react-snob/require-boolean-prefix-is
  add?: boolean | null;
  /** Category filter: 'all' or specific category ID */
  category?: string;
  /** Condition filter: 'all' or specific condition */
  condition?: string;
  /** Bobblehead ID being edited, or null */
  edit?: null | string;
  /** Featured filter: 'all', 'featured', or 'not-featured' */
  featured?: string;
  /** Current page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Search query string */
  search?: string;
  /** Sort option: 'newest', 'oldest', 'name-asc', 'name-desc', etc. */
  sortBy?: string;
}

/**
 * Mock return type for useQueryStates hook
 */
export type MockUseQueryStatesReturn = readonly [
  MockQueryState,
  (updates: Partial<MockQueryState>) => Promise<URLSearchParams>,
];

/**
 * Creates a mock implementation of the nuqs useQueryStates hook.
 *
 * @param initialState - Initial query state values
 * @returns Tuple of [state, setState] matching the real hook signature
 *
 * @example
 * ```typescript
 * import { useQueryStates } from 'nuqs';
 *
 * // Mock with default state
 * const [state, setState] = mockUseQueryStates();
 *
 * // Mock with custom initial state
 * const [state, setState] = mockUseQueryStates({
 *   search: 'baseball',
 *   category: 'sports',
 *   page: 2,
 * });
 *
 * // Use in tests
 * vi.mocked(useQueryStates).mockReturnValue([state, setState]);
 * ```
 */
export const mockUseQueryStates = (initialState: Partial<MockQueryState> = {}): MockUseQueryStatesReturn => {
  const defaultState: MockQueryState = {
    add: null,
    category: 'all',
    condition: 'all',
    edit: null,
    featured: 'all',
    page: 1,
    pageSize: 24,
    search: '',
    sortBy: 'newest',
  };

  const state = { ...defaultState, ...initialState };
  const setState = vi.fn().mockResolvedValue(new URLSearchParams());

  return [state, setState] as const;
};

/**
 * Creates a mock with search active
 */
export const mockSearchActiveState = (searchTerm: string): MockUseQueryStatesReturn => {
  return mockUseQueryStates({ search: searchTerm });
};

/**
 * Creates a mock with filter active
 */
export const mockFilterActiveState = (filters: Partial<MockQueryState>): MockUseQueryStatesReturn => {
  return mockUseQueryStates(filters);
};

/**
 * Creates a mock with pagination
 */
export const mockPaginationState = (page: number, pageSize = 24): MockUseQueryStatesReturn => {
  return mockUseQueryStates({ page, pageSize });
};

/**
 * Creates a mock with add dialog open
 */
export const mockAddDialogOpenState = (): MockUseQueryStatesReturn => {
  return mockUseQueryStates({ add: true });
};

/**
 * Creates a mock with edit dialog open for specific item
 */
export const mockEditDialogOpenState = (itemId: string): MockUseQueryStatesReturn => {
  return mockUseQueryStates({ edit: itemId });
};
