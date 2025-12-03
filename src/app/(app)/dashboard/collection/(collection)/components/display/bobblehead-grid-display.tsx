'use client';

import { useQueryStates } from 'nuqs';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import type { CollectionGridDensity, UserPreferences } from '@/hooks/use-user-preferences';
import type { BobbleheadDashboardListRecord } from '@/lib/queries/bobbleheads/bobbleheads-dashboard.query';

import { collectionDashboardParsers } from '@/app/(app)/dashboard/collection/(collection)/route-type';
import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';
import { useUserPreferences } from '@/hooks/use-user-preferences';

import { NoBobbleheads } from '../empty-states/no-bobbleheads';
import { NoResults } from '../empty-states/no-results';
import { BobbleheadCard } from '../main/bobblehead-card';
import { BobbleheadGrid } from '../main/bobblehead-grid';
import { BobbleheadPagination } from '../main/bobblehead-pagination';
import { BulkActionsBar } from '../main/bulk-actions-bar';
import { Toolbar } from '../main/toolbar';

type BobbleheadGridDisplayProps = {
  bobbleheads: Array<BobbleheadDashboardListRecord>;
  categories: Array<string>;
  conditions: Array<string>;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  userPreferences: UserPreferences;
};

export const BobbleheadGridDisplay = ({
  bobbleheads,
  categories,
  conditions,
  pagination,
  userPreferences,
}: BobbleheadGridDisplayProps) => {
  const [isHoverCardEnabled, setHoverCardEnabled] = useToggle(userPreferences.isBobbleheadHoverCardEnabled);
  const [isSelectionMode, setIsSelectionMode] = useToggle();

  const [gridDensity, setGridDensity] = useState<CollectionGridDensity>(
    userPreferences.collectionGridDensity ?? 'compact',
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [{ category, condition, featured, search, sortBy }, setParams] = useQueryStates(
    {
      add: collectionDashboardParsers.add,
      category: collectionDashboardParsers.category,
      condition: collectionDashboardParsers.condition,
      featured: collectionDashboardParsers.featured,
      page: collectionDashboardParsers.page,
      pageSize: collectionDashboardParsers.pageSize,
      search: collectionDashboardParsers.search,
      sortBy: collectionDashboardParsers.sortBy,
    },
    { shallow: false },
  );

  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch] = useDebounce(searchInput, 300);

  const { setPreference } = useUserPreferences();

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== search) {
      void setParams({ search: debouncedSearch || null });
    }
  }, [debouncedSearch, search, setParams]);

  const handlePageChange = (newPage: number) => {
    void setParams({ page: newPage });
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    void setParams({ page: 1, pageSize: newPageSize });
  };

  const handleSelectionModeToggle = () => {
    setIsSelectionMode.toggle();
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
  };

  const handleSelectAll = () => {
    if (_isAllSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(bobbleheads.map((b) => b.id)));
  };

  const handleSelectionChange = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (checked) next.add(id);
      else next.delete(id);

      return next;
    });
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete:', Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleBulkFeature = () => {
    console.log('Bulk feature:', Array.from(selectedIds));
  };

  const handleEditBobblehead = (id: string) => {
    console.log('Edit bobblehead:', id);
  };

  const handleDeleteBobblehead = (id: string) => {
    console.log('Delete bobblehead:', id);
  };

  const handleFeatureToggle = (id: string) => {
    console.log('Toggle feature:', id);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    void setParams({
      category: 'all',
      condition: 'all',
      featured: 'all',
      page: 1,
      pageSize: null,
      search: null,
      sortBy: 'newest',
    });
  };

  const handleGridDensityToggle = useCallback(() => {
    setGridDensity((prev) => {
      const newDensity = prev === 'compact' ? 'comfortable' : 'compact';
      setPreference('collectionGridDensity', newDensity);
      return newDensity;
    });
  }, [setPreference]);

  const handleHoverCardToggle = useCallback(() => {
    setHoverCardEnabled.update((prev) => {
      const isEnabled = !prev;
      setPreference('isBobbleheadHoverCardEnabled', isEnabled);
      return isEnabled;
    });
  }, [setPreference, setHoverCardEnabled]);

  const handleAddClick = useCallback(() => {
    void setParams({ add: true });
  }, [setParams]);

  const _hasBobbleheads = bobbleheads.length > 0;
  const _isFiltered = !!searchInput || category !== 'all' || condition !== 'all' || featured !== 'all';
  const _hasNoResults = !_hasBobbleheads && _isFiltered;
  const _hasNoBobbleheads = !_hasBobbleheads && !_hasNoResults;
  const _hasSelection = selectedIds.size > 0;

  const _isAllSelected = selectedIds.size === bobbleheads.length && bobbleheads.length > 0;

  return (
    <Fragment>
      {/* Toolbar */}
      <Toolbar
        categories={categories}
        conditions={conditions}
        filterCategory={category}
        filterCondition={condition}
        filterFeatured={featured}
        gridDensity={gridDensity}
        isHoverCardEnabled={isHoverCardEnabled}
        isSelectionMode={isSelectionMode}
        onAddClick={handleAddClick}
        onClearFilters={handleClearFilters}
        onFilterCategoryChange={(value) => {
          void setParams({ category: value, page: 1 });
        }}
        onFilterConditionChange={(value) => {
          void setParams({ condition: value as typeof condition, page: 1 });
        }}
        onFilterFeaturedChange={(value) => {
          void setParams({ featured: value as typeof featured, page: 1 });
        }}
        onGridDensityToggle={handleGridDensityToggle}
        onHoverCardToggle={handleHoverCardToggle}
        onSearchChange={setSearchInput}
        onSearchClear={() => {
          setSearchInput('');
        }}
        onSelectionModeToggle={handleSelectionModeToggle}
        onSortChange={(value) => {
          void setParams({ page: 1, sortBy: value as typeof sortBy });
        }}
        searchValue={searchInput}
        sortBy={sortBy}
      />

      {/* Bulk Actions Bar */}
      <Conditional isCondition={_hasSelection}>
        <BulkActionsBar
          isAllSelected={_isAllSelected}
          onBulkDelete={handleBulkDelete}
          onBulkFeature={handleBulkFeature}
          onSelectAll={handleSelectAll}
          selectedCount={selectedIds.size}
        />
      </Conditional>

      {/* Bobblehead Grid */}
      <BobbleheadGrid gridDensity={gridDensity} isEmpty={!_hasBobbleheads}>
        <Conditional isCondition={_hasBobbleheads}>
          {bobbleheads.map((bobblehead) => (
            <BobbleheadCard
              bobblehead={bobblehead}
              isHoverCardEnabled={isHoverCardEnabled}
              isSelected={selectedIds.has(bobblehead.id)}
              isSelectionMode={isSelectionMode}
              key={bobblehead.id}
              onDelete={handleDeleteBobblehead}
              onEdit={handleEditBobblehead}
              onFeatureToggle={handleFeatureToggle}
              onSelectionChange={handleSelectionChange}
            />
          ))}
        </Conditional>

        <Conditional isCondition={_hasNoResults}>
          <NoResults onClearFilters={handleClearFilters} />
        </Conditional>

        <Conditional isCondition={_hasNoBobbleheads}>
          <NoBobbleheads />
        </Conditional>
      </BobbleheadGrid>

      {/* Pagination */}
      <Conditional isCondition={pagination !== undefined && pagination.totalCount > 0}>
        <BobbleheadPagination
          currentPage={pagination?.currentPage ?? 1}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSize={pagination?.pageSize ?? 24}
          totalCount={pagination?.totalCount ?? 0}
          totalPages={pagination?.totalPages ?? 1}
        />
      </Conditional>
    </Fragment>
  );
};
