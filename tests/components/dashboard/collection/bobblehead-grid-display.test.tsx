import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server-only FIRST to prevent the module boundary error
vi.mock('server-only', () => ({}));

// Mock nuqs/server which is imported by route-type
vi.mock('nuqs/server', () => ({
  createSearchParamsCache: vi.fn(() => ({})),
  parseAsBoolean: { withDefault: vi.fn(() => ({})) },
  parseAsInteger: { withDefault: vi.fn(() => ({})) },
  parseAsString: { withDefault: vi.fn(() => ({})) },
  parseAsStringEnum: vi.fn(() => ({ withDefault: vi.fn(() => ({})) })),
}));

// Mock route-type BEFORE importing the component to avoid server-only import issues
vi.mock('@/app/(app)/dashboard/collection/(collection)/route-type', () => ({
  collectionDashboardParsers: {
    add: {},
    category: {},
    condition: {},
    edit: {},
    featured: {},
    page: {},
    pageSize: {},
    search: {},
    sortBy: {},
  },
  Route: {
    searchParams: {},
  },
}));

// Mock Redis and cache services
vi.mock('@/lib/utils/redis-client', () => ({
  getRedisClient: vi.fn(() => ({
    del: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  })),
  RedisClient: class {},
}));
vi.mock('@/lib/services/cache.service', () => ({
  CacheService: class {
    static invalidatePattern = vi.fn();
  },
}));

// Mock all dependencies
vi.mock('nuqs');
vi.mock('next/navigation');
vi.mock('@/hooks/use-user-preferences');
vi.mock('@/hooks/use-server-action');
vi.mock('use-debounce', () => ({
  useDebounce: vi.fn((value: unknown) => [value] as [unknown]),
}));
vi.mock('@/lib/actions/bobbleheads/bobbleheads.actions');

import type { UserPreferences } from '@/hooks/use-user-preferences';

import { BobbleheadGridDisplay } from '@/app/(app)/dashboard/collection/(collection)/components/display/bobblehead-grid-display';

import {
  createMockBobbleheadDashboardRecords,
  createMockPagination,
} from '../../../fixtures/bobblehead-grid.factory';
import { mockUseQueryStates } from '../../../mocks/nuqs.mock';
import { render, screen } from '../../../setup/test-utils';

describe('BobbleheadGridDisplay', () => {
  const defaultUserPreferences: UserPreferences = {
    collectionGridDensity: 'compact',
    isBobbleheadHoverCardEnabled: true,
    isCollectionHoverCardEnabled: true,
  };

  const defaultProps = {
    bobbleheads: createMockBobbleheadDashboardRecords(3),
    categories: ['Sports', 'Movies', 'Music'],
    conditions: ['mint', 'good', 'fair', 'poor'],
    pagination: createMockPagination(1, 24, 100),
    userPreferences: defaultUserPreferences,
  };

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    const { useQueryStates } = await import('nuqs');
    vi.mocked(useQueryStates).mockReturnValue(mockUseQueryStates() as ReturnType<typeof useQueryStates>);

    const { useRouter } = await import('next/navigation');
    vi.mocked(useRouter).mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      push: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
    } as unknown as AppRouterInstance);

    const { useUserPreferences } = await import('@/hooks/use-user-preferences');
    vi.mocked(useUserPreferences).mockReturnValue({
      clearPreferences: vi.fn(),
      preferences: defaultUserPreferences,
      setPreference: vi.fn(),
      setPreferences: vi.fn(),
    });

    const { useServerAction } = await import('@/hooks/use-server-action');
    vi.mocked(useServerAction).mockReturnValue({
      execute: vi.fn(),
      executeAsync: vi.fn().mockResolvedValue({ success: true }),
      isExecuting: false,
      reset: vi.fn(),
      result: {},
      status: 'idle',
    } as unknown as ReturnType<typeof useServerAction>);
  });

  describe('Rendering Tests', () => {
    it('should render Toolbar with correct props', () => {
      render(<BobbleheadGridDisplay {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search bobbleheads...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('should render BobbleheadGrid with bobbleheads', () => {
      render(<BobbleheadGridDisplay {...defaultProps} />);

      // All 3 bobbleheads should be rendered
      expect(screen.getByText('Bobblehead 1')).toBeInTheDocument();
      expect(screen.getByText('Bobblehead 2')).toBeInTheDocument();
      expect(screen.getByText('Bobblehead 3')).toBeInTheDocument();
    });

    it('should render pagination showing text when pagination provided', () => {
      render(<BobbleheadGridDisplay {...defaultProps} />);

      // The pagination shows "Showing X to Y of Z bobbleheads"
      expect(screen.getByText(/Showing/i)).toBeInTheDocument();
      expect(screen.getByText(/bobbleheads/i)).toBeInTheDocument();
    });

    it('should not render BobbleheadPagination when pagination is undefined', () => {
      render(<BobbleheadGridDisplay {...defaultProps} pagination={undefined} />);

      expect(screen.queryByText(/Showing/i)).not.toBeInTheDocument();
    });

    it('should not render BulkActionsBar when no items selected', () => {
      render(<BobbleheadGridDisplay {...defaultProps} />);

      expect(screen.queryByText(/items? selected/i)).not.toBeInTheDocument();
    });
  });

  describe('Empty State Tests', () => {
    it('should show NoBobbleheads when empty and no filters', async () => {
      const { useQueryStates } = await import('nuqs');
      vi.mocked(useQueryStates).mockReturnValue(
        mockUseQueryStates({
          category: 'all',
          condition: 'all',
          featured: 'all',
          search: '',
        }) as ReturnType<typeof useQueryStates>,
      );

      render(
        <BobbleheadGridDisplay
          {...defaultProps}
          bobbleheads={[]}
          pagination={createMockPagination(1, 24, 0)}
        />,
      );

      // Look for the empty state component - adjust based on actual text
      expect(screen.getByText(/no bobbleheads/i)).toBeInTheDocument();
    });
  });

  describe('Search State Tests', () => {
    it('should initialize searchInput from URL params', async () => {
      const { useQueryStates } = await import('nuqs');
      vi.mocked(useQueryStates).mockReturnValue(
        mockUseQueryStates({
          search: 'baseball',
        }) as ReturnType<typeof useQueryStates>,
      );

      render(<BobbleheadGridDisplay {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search bobbleheads...');
      expect(searchInput.value).toBe('baseball');
    });

    it('should debounce search input and update URL params', async () => {
      const setParams = vi.fn();
      const { useQueryStates } = await import('nuqs');
      vi.mocked(useQueryStates).mockReturnValue([
        {
          category: 'all',
          condition: 'all',
          featured: 'all',
          search: '',
          sortBy: 'newest',
        },
        setParams,
      ] as unknown as ReturnType<typeof useQueryStates>);

      const { user } = render(<BobbleheadGridDisplay {...defaultProps} />);

      await user.type(screen.getByPlaceholderText('Search bobbleheads...'), 'test');

      // useDebounce is mocked to return the value immediately
      // The component should call setParams when the debounced value changes
      await waitFor(() => {
        expect(setParams).toHaveBeenCalledWith({ search: 'test' });
      });
    });
  });

  describe('Filter Tests', () => {
    it('should update URL params when category filter changes', async () => {
      const setParams = vi.fn();
      const { useQueryStates } = await import('nuqs');
      vi.mocked(useQueryStates).mockReturnValue([
        {
          category: 'all',
          condition: 'all',
          featured: 'all',
          search: '',
          sortBy: 'newest',
        },
        setParams,
      ] as unknown as ReturnType<typeof useQueryStates>);

      const { user } = render(<BobbleheadGridDisplay {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByRole('menuitemradio', { name: 'Sports' }));

      await waitFor(() => {
        expect(setParams).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'Sports',
            page: 1,
          }),
        );
      });
    });

    it('should update URL params when condition filter changes', async () => {
      const setParams = vi.fn();
      const { useQueryStates } = await import('nuqs');
      vi.mocked(useQueryStates).mockReturnValue([
        {
          category: 'all',
          condition: 'all',
          featured: 'all',
          search: '',
          sortBy: 'newest',
        },
        setParams,
      ] as unknown as ReturnType<typeof useQueryStates>);

      const { user } = render(<BobbleheadGridDisplay {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByRole('menuitemradio', { name: /mint/i }));

      await waitFor(() => {
        expect(setParams).toHaveBeenCalledWith(
          expect.objectContaining({
            condition: 'mint',
            page: 1,
          }),
        );
      });
    });

    it('should reset to page 1 when filters change', async () => {
      const setParams = vi.fn();
      const { useQueryStates } = await import('nuqs');
      vi.mocked(useQueryStates).mockReturnValue([
        {
          category: 'all',
          condition: 'all',
          featured: 'all',
          page: 5,
          search: '',
          sortBy: 'newest',
        },
        setParams,
      ] as unknown as ReturnType<typeof useQueryStates>);

      const { user } = render(<BobbleheadGridDisplay {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByRole('menuitemradio', { name: 'Sports' }));

      await waitFor(() => {
        expect(setParams).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          }),
        );
      });
    });
  });

  describe('Component Structure', () => {
    it('should render with correct data-slot attribute on toolbar', () => {
      const { container } = render(<BobbleheadGridDisplay {...defaultProps} />);

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const toolbar = container.querySelector('[data-slot="toolbar"]');
      expect(toolbar).toBeInTheDocument();
    });

    it('should render bobblehead grid container', () => {
      const { container } = render(<BobbleheadGridDisplay {...defaultProps} />);

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const gridContainer = container.querySelector('[data-slot="bobblehead-grid-container"]');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should render bobblehead cards with data-slot', () => {
      const { container } = render(<BobbleheadGridDisplay {...defaultProps} />);

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const cards = container.querySelectorAll('[data-slot="bobblehead-card"]');
      expect(cards.length).toBe(3);
    });
  });
});
