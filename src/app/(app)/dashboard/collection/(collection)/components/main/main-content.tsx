'use client';

import { Fragment, useState } from 'react';

import { Conditional } from '@/components/ui/conditional';

import { NoBobbleheads } from '../empty-states/no-bobbleheads';
import { BobbleheadGrid } from './bobblehead-grid';
import { BulkActionsBar } from './bulk-actions-bar';
import { CollectionHeaderCard } from './collection-header-card';
import { Toolbar } from './toolbar';

export const MainContent = () => {
  // State for toolbar
  const [searchValue, setSearchValue] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [gridDensity, setGridDensity] = useState<'comfortable' | 'compact'>('compact');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Placeholder values - will be replaced with real data
  const hasBobbleheads = false;
  const hasSelection = selectedIds.size > 0;
  const bobbleheadsCount = 0;
  const isAllSelected = selectedIds.size === bobbleheadsCount && bobbleheadsCount > 0;

  // Handlers
  const handleAddBobblehead = () => {
    console.log('Add bobblehead clicked');
  };

  const handleSelectionModeToggle = () => {
    setIsSelectionMode((prev) => !prev);
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      // TODO: Select all bobblehead ids
      setSelectedIds(new Set());
    }
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete:', Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleBulkFeature = () => {
    console.log('Bulk feature:', Array.from(selectedIds));
  };

  return (
    <Fragment>
      {/* Collection Header Card (Desktop only) */}
      <CollectionHeaderCard
        bobbleheadCount={0}
        coverImageUrl={''}
        description={'Select a collection to view its bobbleheads'}
        featuredCount={0}
        likeCount={0}
        name={'No Collection Selected'}
        totalValue={0}
        viewCount={0}
      />

      {/* Toolbar */}
      <Toolbar
        filterCategory={filterCategory}
        filterCondition={filterCondition}
        filterFeatured={filterFeatured}
        gridDensity={gridDensity}
        isSelectionMode={isSelectionMode}
        onAddBobblehead={handleAddBobblehead}
        onFilterCategoryChange={setFilterCategory}
        onFilterConditionChange={setFilterCondition}
        onFilterFeaturedChange={setFilterFeatured}
        onGridDensityToggle={() => setGridDensity((prev) => (prev === 'compact' ? 'comfortable' : 'compact'))}
        onSearchChange={setSearchValue}
        onSearchClear={() => setSearchValue('')}
        onSelectionModeToggle={handleSelectionModeToggle}
        onSortChange={setSortBy}
        searchValue={searchValue}
        sortBy={sortBy}
      />

      {/* Bulk Actions Bar */}
      <Conditional isCondition={hasSelection}>
        <BulkActionsBar
          isAllSelected={isAllSelected}
          onBulkDelete={handleBulkDelete}
          onBulkFeature={handleBulkFeature}
          onSelectAll={handleSelectAll}
          selectedCount={selectedIds.size}
        />
      </Conditional>

      {/* Bobblehead Grid */}
      <BobbleheadGrid gridDensity={gridDensity}>
        {hasBobbleheads ?
          // TODO: Map over bobbleheads and render cards
          <div>Bobbleheads will render here</div>
        : <NoBobbleheads onAddClick={handleAddBobblehead} />}
      </BobbleheadGrid>
    </Fragment>
  );
};
