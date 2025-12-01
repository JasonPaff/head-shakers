'use client';

import { useQueryStates } from 'nuqs';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import type { CollectionGridDensity, UserPreferences } from '@/hooks/use-user-preferences';
import type { BobbleheadListRecord } from '@/lib/queries/collections/collections.query';

import { collectionDashboardParsers } from '@/app/(app)/dashboard/collection/(collection)/route-type';
import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';
import { useUserPreferences } from '@/hooks/use-user-preferences';

import { NoBobbleheads } from '../empty-states/no-bobbleheads';
import { NoResults } from '../empty-states/no-results';
import { BobbleheadCard } from '../main/bobblehead-card';
import { BobbleheadGrid } from '../main/bobblehead-grid';
import { BulkActionsBar } from '../main/bulk-actions-bar';
import { Toolbar } from '../main/toolbar';

type BobbleheadGridDisplayProps = {
  bobbleheads: Array<
    BobbleheadListRecord & {
      collectionId: string;
      collectionSlug: string;
      featurePhoto?: null | string;
      likeData?: { isLiked: boolean; likeCount: number; likeId: null | string };
    }
  >;
  categories: Array<string>;
  collectionId?: string;
  conditions: Array<string>;
  userPreferences: UserPreferences;
};

export const BobbleheadGridDisplay = ({
  bobbleheads,
  categories,
  collectionId,
  conditions,
  userPreferences,
}: BobbleheadGridDisplayProps) => {
  const [isHoverCardEnabled, setHoverCardEnabled] = useToggle(userPreferences.isBobbleheadHoverCardEnabled);
  const [isSelectionMode, setIsSelectionMode] = useToggle();

  const [filterCategory, setFilterCategory] = useState('all');
  const [gridDensity, setGridDensity] = useState<CollectionGridDensity>(
    userPreferences.collectionGridDensity ?? 'compact',
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [{ condition, featured, search, sortBy }, setParams] = useQueryStates(
    {
      condition: collectionDashboardParsers.condition,
      featured: collectionDashboardParsers.featured,
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

  const filteredBobbleheads = useMemo(() => {
    let result = [...bobbleheads];

    // Search filter (use local searchInput for immediate filtering)
    if (searchInput.trim()) {
      const query = searchInput.toLowerCase();
      result = result.filter(
        (b) =>
          b.name?.toLowerCase().includes(query) ||
          b.characterName?.toLowerCase().includes(query) ||
          b.manufacturer?.toLowerCase().includes(query),
      );
    }

    // Category filter
    // TODO: Add category to bobblehead data type
    // if (filterCategory !== 'all') {
    //   result = result.filter((b) => b.category === filterCategory);
    // }

    // Condition filter
    if (condition !== 'all') {
      result = result.filter((b) => b.condition === condition);
    }

    // Featured filter
    if (featured === 'featured') {
      result = result.filter((b) => b.isFeatured);
    } else if (featured === 'not-featured') {
      result = result.filter((b) => !b.isFeatured);
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name!.localeCompare(b.name!));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name!.localeCompare(a.name!));
        break;
      case 'value-high':
        result.sort((a, b) => (b.purchasePrice || 0) - (a.purchasePrice || 0));
        break;
      case 'value-low':
        result.sort((a, b) => (a.purchasePrice || 0) - (b.purchasePrice || 0));
        break;
      // newest/oldest would need createdAt field
      default:
        break;
    }

    return result;
  }, [bobbleheads, searchInput, condition, featured, sortBy]);

  const handleSelectionModeToggle = () => {
    setIsSelectionMode.toggle();
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
  };

  const handleSelectAll = () => {
    if (_isAllSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredBobbleheads.map((b) => b.id)));
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
    setFilterCategory('all');
    void setParams({
      condition: 'all',
      featured: 'all',
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

  const _hasBobbleheads = filteredBobbleheads.length > 0;
  const _isFiltered = !!searchInput || filterCategory !== 'all' || condition !== 'all';
  const _hasNoResults = !_hasBobbleheads && _isFiltered;
  const _hasNoBobbleheads = !_hasBobbleheads && !_hasNoResults;
  const _hasSelection = selectedIds.size > 0;

  const _isAllSelected = selectedIds.size === filteredBobbleheads.length && filteredBobbleheads.length > 0;

  return (
    <Fragment>
      {/* Toolbar */}
      <Toolbar
        categories={categories}
        collectionId={collectionId}
        conditions={conditions}
        filterCategory={filterCategory}
        filterCondition={condition}
        filterFeatured={featured}
        gridDensity={gridDensity}
        isHoverCardEnabled={isHoverCardEnabled}
        isSelectionMode={isSelectionMode}
        onFilterCategoryChange={setFilterCategory}
        onFilterConditionChange={(value) => {
          void setParams({ condition: value as typeof condition });
        }}
        onFilterFeaturedChange={(value) => {
          void setParams({ featured: value as typeof featured });
        }}
        onGridDensityToggle={handleGridDensityToggle}
        onHoverCardToggle={handleHoverCardToggle}
        onSearchChange={setSearchInput}
        onSearchClear={() => {
          setSearchInput('');
        }}
        onSelectionModeToggle={handleSelectionModeToggle}
        onSortChange={(value) => {
          void setParams({ sortBy: value as typeof sortBy });
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
          {filteredBobbleheads.map((bobblehead) => (
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
          <NoBobbleheads collectionId={collectionId} />
        </Conditional>
      </BobbleheadGrid>
    </Fragment>
  );
};
