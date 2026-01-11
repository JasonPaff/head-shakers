import type { JSX, ReactNode } from 'react';

import { waitFor } from '@testing-library/react';
import { Fragment } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { CollectionDashboardListRecord } from '@/lib/queries/collections/collections.query';

import { SidebarDisplay } from '@/app/(app)/dashboard/collection/components/display/sidebar-display';

import {
  createMockCollectionDashboardRecord,
  createMockCollectionDashboardRecords,
  mockCollectionDashboardRecord,
} from '../../../mocks/data/collections-dashboard.mock';
import { render, screen } from '../../../setup/test-utils';

// Mock nuqs
vi.mock('nuqs', () => ({
  useQueryStates: vi.fn(() => [{ collectionSlug: 'sports-collection' }, vi.fn()]),
}));

// Mock child components
vi.mock('@/app/(app)/dashboard/collection/components/sidebar/sidebar-header', () => ({
  SidebarHeader: ({ onCreateClick }: { onCreateClick?: () => void }): JSX.Element => (
    <div data-testid={'sidebar-header'}>
      <h2>Collections</h2>
      <button onClick={onCreateClick}>New</button>
    </div>
  ),
}));

vi.mock('@/app/(app)/dashboard/collection/components/sidebar/sidebar-search', () => ({
  SidebarSearch: ({
    onSearchChange,
    onSearchClear,
    onSortChange,
    searchValue,
    sortOption,
  }: {
    onSearchChange: (value: string) => void;
    onSearchClear: () => void;
    onSortChange: (option: string) => void;
    searchValue: string;
    sortOption: string;
  }): JSX.Element => (
    <div data-testid={'sidebar-search'}>
      <input
        data-testid={'search-input'}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={'Search collections'}
        value={searchValue}
      />
      <button data-testid={'clear-search'} onClick={onSearchClear}>
        Clear
      </button>
      <select data-testid={'sort-select'} onChange={(e) => onSortChange(e.target.value)} value={sortOption}>
        <option value={'name-asc'}>Name (A-Z)</option>
        <option value={'name-desc'}>Name (Z-A)</option>
        <option value={'count-desc'}>Count (High to Low)</option>
      </select>
    </div>
  ),
}));

vi.mock('@/app/(app)/dashboard/collection/components/sidebar/sidebar-collection-list', () => ({
  SidebarCollectionList: ({ children }: { children: ReactNode }): JSX.Element => (
    <div data-testid={'sidebar-collection-list'}>{children}</div>
  ),
}));

vi.mock('@/app/(app)/dashboard/collection/components/sidebar/cards/collection-card-compact', () => ({
  CollectionCardCompact: ({ collection }: { collection: CollectionDashboardListRecord }): JSX.Element => (
    <div data-testid={`collection-card-${collection.id}`}>
      <span>{collection.name}</span>
    </div>
  ),
}));

vi.mock('@/app/(app)/dashboard/collection/components/sidebar/cards/collection-card-cover', () => ({
  CollectionCardCover: ({ collection }: { collection: CollectionDashboardListRecord }): JSX.Element => (
    <div data-testid={`collection-card-cover-${collection.id}`}>
      <span>{collection.name}</span>
    </div>
  ),
}));

vi.mock('@/app/(app)/dashboard/collection/components/sidebar/cards/collection-card-detailed', () => ({
  CollectionCardDetailed: ({ collection }: { collection: CollectionDashboardListRecord }): JSX.Element => (
    <div data-testid={`collection-card-detailed-${collection.id}`}>
      <span>{collection.name}</span>
    </div>
  ),
}));

vi.mock('@/app/(app)/dashboard/collection/components/sidebar/sidebar-footer', () => ({
  SidebarFooter: ({ totalCount }: { totalCount: number }): JSX.Element => (
    <div data-testid={'sidebar-footer'}>
      <span>{totalCount} collections</span>
    </div>
  ),
}));

vi.mock('@/app/(app)/dashboard/collection/components/empty-states/no-collections', () => ({
  NoCollections: ({ onCreateClick }: { onCreateClick?: () => void }): JSX.Element => (
    <div data-testid={'no-collections-empty-state'}>
      <p>No collections yet</p>
      <button onClick={onCreateClick}>Create your first collection</button>
    </div>
  ),
}));

vi.mock('@/app/(app)/dashboard/collection/components/empty-states/no-filtered-collections', () => ({
  NoFilteredCollections: ({ onClearSearch }: { onClearSearch: () => void }): JSX.Element => (
    <div data-testid={'no-filtered-collections-empty-state'}>
      <p>No collections match your search</p>
      <button onClick={onClearSearch}>Clear search</button>
    </div>
  ),
}));

// Mock server actions
vi.mock('@/lib/actions/collections/collections.actions', () => ({
  deleteCollectionAction: vi.fn(),
}));

// Mock hooks
vi.mock('@/hooks/use-user-preferences', () => ({
  useUserPreferences: vi.fn(() => ({
    setPreference: vi.fn(),
  })),
}));

vi.mock('@/hooks/use-server-action', () => ({
  useServerAction: vi.fn(() => ({
    executeAsync: vi.fn(),
  })),
}));

vi.mock('@/hooks/use-toggle', () => ({
  useToggle: vi.fn(() => [false, { off: vi.fn(), on: vi.fn(), update: vi.fn() }]),
}));

// Mock dialogs
vi.mock('@/components/feature/collections/collection-upsert-dialog', () => ({
  CollectionUpsertDialog: (): JSX.Element => <div data-testid={'collection-upsert-dialog'} />,
}));

vi.mock('@/components/ui/alert-dialogs/confirm-delete-alert-dialog', () => ({
  ConfirmDeleteAlertDialog: (): JSX.Element => <div data-testid={'confirm-delete-alert-dialog'} />,
}));

vi.mock('@/components/ui/conditional', () => ({
  Conditional: ({
    children,
    isCondition,
  }: {
    children: ReactNode;
    isCondition: boolean;
  }): JSX.Element | null => (isCondition ? <Fragment>{children}</Fragment> : null),
}));

// Mock utilities
vi.mock('@/lib/utils/collection.utils', () => ({
  sortCollections: vi.fn((collections: Array<CollectionDashboardListRecord>, sortOption: string) => {
    // Simple implementation for testing
    const sorted = [...collections];
    if (sortOption === 'name-asc') {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortOption === 'name-desc') {
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    if (sortOption === 'count-desc') {
      return sorted.sort((a, b) => b.bobbleheadCount - a.bobbleheadCount);
    }
    return sorted;
  }),
}));

describe('SidebarDisplay', () => {
  const defaultUserPreferences = {
    collectionSidebarSort: 'name-asc' as const,
    collectionSidebarView: 'compact' as const,
    isCollectionHoverCardEnabled: false,
  };

  describe('component integration', () => {
    it('should render sidebar header with title', () => {
      render(
        <SidebarDisplay
          collections={[mockCollectionDashboardRecord]}
          userPreferences={defaultUserPreferences}
        />,
      );

      expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Collections' })).toBeInTheDocument();
    });

    it('should render search and sort controls', () => {
      render(
        <SidebarDisplay
          collections={[mockCollectionDashboardRecord]}
          userPreferences={defaultUserPreferences}
        />,
      );

      expect(screen.getByTestId('sidebar-search')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search collections')).toBeInTheDocument();
      expect(screen.getByTestId('sort-select')).toBeInTheDocument();
    });

    it('should render collection list with provided collections', () => {
      const collections = createMockCollectionDashboardRecords(3);

      render(<SidebarDisplay collections={collections} userPreferences={defaultUserPreferences} />);

      expect(screen.getByTestId('sidebar-collection-list')).toBeInTheDocument();
      collections.forEach((collection) => {
        expect(screen.getByText(collection.name)).toBeInTheDocument();
      });
    });

    it('should render sidebar footer with stats', () => {
      const collections = createMockCollectionDashboardRecords(5);

      render(<SidebarDisplay collections={collections} userPreferences={defaultUserPreferences} />);

      expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument();
      expect(screen.getByText('5 collections')).toBeInTheDocument();
    });

    it('should integrate all child components correctly', () => {
      const collections = createMockCollectionDashboardRecords(2);

      render(<SidebarDisplay collections={collections} userPreferences={defaultUserPreferences} />);

      expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-search')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-collection-list')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument();
    });
  });

  describe('empty states', () => {
    it('should render no-collections empty state when list is empty', () => {
      render(<SidebarDisplay collections={[]} userPreferences={defaultUserPreferences} />);

      expect(screen.getByTestId('no-collections-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No collections yet')).toBeInTheDocument();
    });

    it('should render no-filtered-collections when search returns no results', async () => {
      const collections = [createMockCollectionDashboardRecord({ name: 'Sports Collection' })];

      const { user } = render(
        <SidebarDisplay collections={collections} userPreferences={defaultUserPreferences} />,
      );

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'NonExistentCollection');

      await waitFor(() => {
        expect(screen.getByTestId('no-filtered-collections-empty-state')).toBeInTheDocument();
      });
    });

    it('should show no-filtered-collections empty state with clear button', async () => {
      const collections = [createMockCollectionDashboardRecord({ name: 'Sports Collection' })];

      const { user } = render(
        <SidebarDisplay collections={collections} userPreferences={defaultUserPreferences} />,
      );

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'xyz123');

      await waitFor(() => {
        expect(screen.getByText('No collections match your search')).toBeInTheDocument();
      });
    });
  });

  describe('search functionality', () => {
    it('should filter by description when searching', async () => {
      const collections = [
        createMockCollectionDashboardRecord({
          description: 'Baseball bobbleheads',
          name: 'Collection A',
        }),
        createMockCollectionDashboardRecord({
          description: 'Football bobbleheads',
          name: 'Collection B',
        }),
      ];

      const { user } = render(
        <SidebarDisplay collections={collections} userPreferences={defaultUserPreferences} />,
      );

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Baseball');

      await waitFor(() => {
        expect(screen.getByText('Collection A')).toBeInTheDocument();
        expect(screen.queryByText('Collection B')).not.toBeInTheDocument();
      });
    });

    it('should maintain search state across re-renders', () => {
      const collections = createMockCollectionDashboardRecords(3);

      const { rerender } = render(
        <SidebarDisplay collections={collections} userPreferences={defaultUserPreferences} />,
      );

      const searchInput = screen.getByTestId<HTMLInputElement>('search-input');
      expect(searchInput.value).toBe('');

      rerender(<SidebarDisplay collections={collections} userPreferences={defaultUserPreferences} />);

      expect(searchInput.value).toBe('');
    });
  });

  describe('sort functionality', () => {
    it('should sort collections based on selected sort option', async () => {
      const collections = [
        createMockCollectionDashboardRecord({ name: 'Zebra Collection' }),
        createMockCollectionDashboardRecord({ name: 'Apple Collection' }),
        createMockCollectionDashboardRecord({ name: 'Mango Collection' }),
      ];

      const { user } = render(
        <SidebarDisplay collections={collections} userPreferences={defaultUserPreferences} />,
      );

      const sortSelect = screen.getByTestId('sort-select');
      await user.selectOptions(sortSelect, 'name-asc');

      await waitFor(() => {
        const collectionCards = screen.getAllByText(/Collection$/);
        expect(collectionCards[0]).toHaveTextContent('Apple Collection');
        expect(collectionCards[1]).toHaveTextContent('Mango Collection');
        expect(collectionCards[2]).toHaveTextContent('Zebra Collection');
      });
    });

    it('should maintain sort state across re-renders', () => {
      const collections = createMockCollectionDashboardRecords(3);

      const { rerender } = render(
        <SidebarDisplay collections={collections} userPreferences={defaultUserPreferences} />,
      );

      const sortSelect = screen.getByTestId<HTMLSelectElement>('sort-select');
      expect(sortSelect.value).toBe('name-asc');

      rerender(<SidebarDisplay collections={collections} userPreferences={defaultUserPreferences} />);

      expect(sortSelect.value).toBe('name-asc');
    });
  });

  describe('collection card variants', () => {
    it('should pass correct variant prop to collection cards (compact)', () => {
      const collections = createMockCollectionDashboardRecords(2);

      render(
        <SidebarDisplay
          collections={collections}
          userPreferences={{
            ...defaultUserPreferences,
            collectionSidebarView: 'compact',
          }}
        />,
      );

      collections.forEach((collection) => {
        expect(screen.getByTestId(`collection-card-${collection.id}`)).toBeInTheDocument();
      });
    });

    it('should render cover variant when userPreferences specify cover', () => {
      const collections = createMockCollectionDashboardRecords(2);

      render(
        <SidebarDisplay
          collections={collections}
          userPreferences={{
            ...defaultUserPreferences,
            collectionSidebarView: 'cover',
          }}
        />,
      );

      collections.forEach((collection) => {
        expect(screen.getByTestId(`collection-card-cover-${collection.id}`)).toBeInTheDocument();
      });
    });

    it('should render detailed variant when userPreferences specify detailed', () => {
      const collections = createMockCollectionDashboardRecords(2);

      render(
        <SidebarDisplay
          collections={collections}
          userPreferences={{
            ...defaultUserPreferences,
            collectionSidebarView: 'detailed',
          }}
        />,
      );

      collections.forEach((collection) => {
        expect(screen.getByTestId(`collection-card-detailed-${collection.id}`)).toBeInTheDocument();
      });
    });
  });

  describe('dynamic updates', () => {
    it('should update display when collections prop changes', () => {
      const initialCollections = createMockCollectionDashboardRecords(2);
      const updatedCollections = createMockCollectionDashboardRecords(3);

      const { rerender } = render(
        <SidebarDisplay collections={initialCollections} userPreferences={defaultUserPreferences} />,
      );

      expect(screen.getByText('2 collections')).toBeInTheDocument();

      rerender(<SidebarDisplay collections={updatedCollections} userPreferences={defaultUserPreferences} />);

      expect(screen.getByText('3 collections')).toBeInTheDocument();
    });
  });

  describe('footer stats', () => {
    it('should show correct collection count in footer', () => {
      const collections = createMockCollectionDashboardRecords(7);

      render(<SidebarDisplay collections={collections} userPreferences={defaultUserPreferences} />);

      expect(screen.getByText('7 collections')).toBeInTheDocument();
    });

    it('should show 0 collections when list is empty', () => {
      render(<SidebarDisplay collections={[]} userPreferences={defaultUserPreferences} />);

      expect(screen.getByText('0 collections')).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should handle very large collection lists', () => {
      const largeCollectionList = createMockCollectionDashboardRecords(100);

      render(<SidebarDisplay collections={largeCollectionList} userPreferences={defaultUserPreferences} />);

      expect(screen.getByText('100 collections')).toBeInTheDocument();
      // Verify all collections are rendered by checking a sample
      expect(screen.getByText('Collection 1')).toBeInTheDocument();
      expect(screen.getByText('Collection 100')).toBeInTheDocument();
    });

    it('should filter large lists efficiently', async () => {
      const largeCollectionList = [
        ...createMockCollectionDashboardRecords(50),
        createMockCollectionDashboardRecord({ name: 'Unique Collection Name' }),
      ];

      const { user } = render(
        <SidebarDisplay collections={largeCollectionList} userPreferences={defaultUserPreferences} />,
      );

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Unique Collection');

      await waitFor(() => {
        expect(screen.getByText('Unique Collection Name')).toBeInTheDocument();
        expect(screen.queryByText('Collection 1')).not.toBeInTheDocument();
      });
    });
  });
});
