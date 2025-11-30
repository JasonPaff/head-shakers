'use client';

import { Fragment, useMemo, useState } from 'react';

import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';

import type { BobbleheadData } from '../async/bobblehead-grid-async';

import { NoBobbleheads } from '../empty-states/no-bobbleheads';
import { NoResults } from '../empty-states/no-results';
import { BobbleheadCard } from '../main/bobblehead-card';
import { BobbleheadGrid } from '../main/bobblehead-grid';
import { BulkActionsBar } from '../main/bulk-actions-bar';
import { Toolbar } from '../main/toolbar';

type BobbleheadGridDisplayProps = {
  bobbleheads: Array<BobbleheadData>;
  categories: Array<string>;
  conditions: Array<string>;
};

export const BobbleheadGridDisplay = ({
  bobbleheads,
  categories,
  conditions,
}: BobbleheadGridDisplayProps) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [gridDensity, setGridDensity] = useState<'comfortable' | 'compact'>('compact');
  const [isSelectionMode, setIsSelectionMode] = useToggle();
  const [searchValue, setSearchValue] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('newest');

  const filteredBobbleheads = useMemo(() => {
    let result = [...bobbleheads];

    // Search filter
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
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
    if (filterCondition !== 'all') {
      result = result.filter((b) => b.condition === filterCondition);
    }

    // Featured filter
    if (filterFeatured === 'featured') {
      result = result.filter((b) => b.isFeatured);
    } else if (filterFeatured === 'not-featured') {
      result = result.filter((b) => !b.isFeatured);
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
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
  }, [bobbleheads, searchValue, filterCondition, filterFeatured, sortBy]);

  const handleAddBobblehead = () => {
    console.log('Add bobblehead clicked');
  };

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
    setSearchValue('');
    setFilterCategory('all');
    setFilterCondition('all');
    setFilterFeatured('all');
  };

  const _hasBobbleheads = filteredBobbleheads.length > 0;
  const _hasNoResults =
    !_hasBobbleheads && (!!searchValue || filterCategory !== 'all' || filterCondition !== 'all');
  const _hasSelection = selectedIds.size > 0;
  const _isAllSelected = selectedIds.size === filteredBobbleheads.length && filteredBobbleheads.length > 0;

  return (
    <Fragment>
      {/* Toolbar */}
      <Toolbar
        categories={categories}
        conditions={conditions}
        filterCategory={filterCategory}
        filterCondition={filterCondition}
        filterFeatured={filterFeatured}
        gridDensity={gridDensity}
        isSelectionMode={isSelectionMode}
        onAddBobblehead={handleAddBobblehead}
        onFilterCategoryChange={setFilterCategory}
        onFilterConditionChange={setFilterCondition}
        onFilterFeaturedChange={setFilterFeatured}
        onGridDensityToggle={() => {
          setGridDensity((prev) => (prev === 'compact' ? 'comfortable' : 'compact'));
        }}
        onSearchChange={setSearchValue}
        onSearchClear={() => {
          setSearchValue('');
        }}
        onSelectionModeToggle={handleSelectionModeToggle}
        onSortChange={setSortBy}
        searchValue={searchValue}
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
              characterName={bobblehead.characterName}
              commentCount={bobblehead.commentCount}
              condition={bobblehead.condition}
              height={bobblehead.height}
              id={bobblehead.id}
              imageUrl={bobblehead.imageUrl}
              isFeatured={bobblehead.isFeatured}
              isSelected={selectedIds.has(bobblehead.id)}
              isSelectionMode={isSelectionMode}
              key={bobblehead.id}
              likeCount={bobblehead.likeCount}
              manufacturer={bobblehead.manufacturer}
              material={bobblehead.material}
              name={bobblehead.name}
              onDelete={handleDeleteBobblehead}
              onEdit={handleEditBobblehead}
              onFeatureToggle={handleFeatureToggle}
              onSelectionChange={handleSelectionChange}
              purchasePrice={bobblehead.purchasePrice}
              series={bobblehead.series}
              viewCount={bobblehead.viewCount}
              year={bobblehead.year}
            />
          ))}
        </Conditional>

        <Conditional isCondition={_hasNoResults}>
          <NoResults onClearFilters={handleClearFilters} />
        </Conditional>

        <Conditional isCondition={!_hasBobbleheads && !_hasNoResults}>
          <NoBobbleheads onAddClick={handleAddBobblehead} />
        </Conditional>
      </BobbleheadGrid>
    </Fragment>
  );
};
