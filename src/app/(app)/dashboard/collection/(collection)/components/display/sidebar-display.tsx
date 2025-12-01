'use client';

import { useQueryStates } from 'nuqs';
import { Fragment, useCallback, useMemo, useState } from 'react';

import type { CollectionCreatedResult } from '@/components/feature/collections/hooks/use-collection-upsert-form';
import type { CollectionSortOption } from '@/hooks/use-user-preferences';
import type { CollectionDashboardListData } from '@/lib/queries/collections/collections.query';

import { CollectionUpsertDialog } from '@/components/feature/collections/collection-upsert-dialog';
import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { sortCollections } from '@/lib/utils/collection.utils';

import type { CollectionCardStyle } from '../sidebar/sidebar-search';

import { collectionDashboardParsers } from '../../search-params';
import { NoCollections } from '../empty-states/no-collections';
import { NoFilteredCollections } from '../empty-states/no-filtered-collections';
import { CollectionCardCompact } from '../sidebar/cards/collection-card-compact';
import { CollectionCardCover } from '../sidebar/cards/collection-card-cover';
import { CollectionCardDetailed } from '../sidebar/cards/collection-card-detailed';
import { SidebarCollectionList } from '../sidebar/sidebar-collection-list';
import { SidebarFooter } from '../sidebar/sidebar-footer';
import { SidebarHeader } from '../sidebar/sidebar-header';
import { SidebarSearch } from '../sidebar/sidebar-search';

type CollectionForEdit = {
  coverImageUrl?: null | string;
  description: null | string;
  id: string;
  isPublic: boolean;
  name: string;
};

type SidebarDisplayProps = {
  collections: Array<CollectionDashboardListData>;
  initialCardStyle?: CollectionCardStyle;
  initialSortOption?: CollectionSortOption;
};

export const SidebarDisplay = ({
  collections,
  initialCardStyle = 'compact',
  initialSortOption = 'name-asc',
}: SidebarDisplayProps) => {
  const [cardStyle, setCardStyleState] = useState<CollectionCardStyle>(initialCardStyle);
  const [editingCollection, setEditingCollection] = useState<CollectionForEdit | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [sortOption, setSortOptionState] = useState<CollectionSortOption>(initialSortOption);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useToggle();
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();

  const [{ collectionSlug }, setParams] = useQueryStates(
    { collectionSlug: collectionDashboardParsers.collectionSlug },
    { shallow: false },
  );

  const { setPreference } = useUserPreferences();

  // Filter and sort collections using the shared utility
  const filteredCollections = useMemo(() => {
    const filtered =
      searchValue.trim() ?
        collections.filter(
          (c) =>
            c.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchValue.toLowerCase()),
        )
      : collections;

    return sortCollections(filtered, sortOption);
  }, [collections, searchValue, sortOption]);

  // Server-side auto-selection ensures collectionSlug is always set when collections exist
  // This fallback handles edge cases like deleted collections or race conditions
  const selectedCollectionSlug = collectionSlug ?? filteredCollections[0]?.slug;

  const setCardStyle = useCallback(
    (newStyle: CollectionCardStyle) => {
      setCardStyleState(newStyle);
      setPreference('collectionSidebarView', newStyle);
    },
    [setPreference],
  );

  const setSortOption = useCallback(
    (newSortOption: CollectionSortOption) => {
      setSortOptionState(newSortOption);
      setPreference('collectionSidebarSort', newSortOption);
    },
    [setPreference],
  );

  const handleCreateCollection = () => {
    setIsCreateDialogOpen.on();
  };

  const handleCollectionCreated = (newCollection: CollectionCreatedResult) => {
    void setParams({ collectionSlug: newCollection.slug });
  };

  const handleCollectionSelect = (slug: string) => {
    void setParams({ collectionSlug: slug });
  };

  const handleEditCollection = (id: string) => {
    const collection = collections.find((c) => c.id === id);
    if (collection) {
      setEditingCollection({
        coverImageUrl: collection.coverImageUrl || null,
        description: collection.description || null,
        id: collection.id,
        isPublic: collection.isPublic,
        name: collection.name,
      });
      setIsEditDialogOpen.on();
    }
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen.off();
    setEditingCollection(null);
  };

  const hasAnyCollections = collections.length > 0;
  const hasFilteredResults = filteredCollections.length > 0;

  return (
    <Fragment>
      {/* Header */}
      <SidebarHeader onCreateClick={handleCreateCollection} />

      {/* Search Bar */}
      <SidebarSearch
        cardStyle={cardStyle}
        isDisabled={!hasAnyCollections}
        onCardStyleChange={setCardStyle}
        onSearchChange={setSearchValue}
        onSearchClear={() => {
          setSearchValue('');
        }}
        onSortChange={setSortOption}
        searchValue={searchValue}
        sortOption={sortOption}
      />

      {/* Collection List */}
      <SidebarCollectionList cardStyle={cardStyle}>
        {hasFilteredResults ?
          filteredCollections.map((collection) => (
            <CollectionCardMapper
              cardStyle={cardStyle}
              collection={collection}
              key={collection.id}
              onCollectionSelect={handleCollectionSelect}
              onEditCollection={handleEditCollection}
              selectedCollectionSlug={selectedCollectionSlug}
            />
          ))
        : hasAnyCollections ?
          <NoFilteredCollections onClearSearch={() => setSearchValue('')} />
        : <NoCollections onCreateClick={handleCreateCollection} />}
      </SidebarCollectionList>

      {/* Footer */}
      <SidebarFooter totalCount={collections.length} />

      {/* Create Collection Dialog */}
      <CollectionUpsertDialog
        isOpen={isCreateDialogOpen}
        onClose={setIsCreateDialogOpen.off}
        onSuccess={handleCollectionCreated}
      />

      {/* Edit Collection Details Dialog */}
      <Conditional isCondition={!!editingCollection}>
        <CollectionUpsertDialog
          collection={editingCollection!}
          isOpen={isEditDialogOpen}
          onClose={handleEditDialogClose}
        />
      </Conditional>
    </Fragment>
  );
};

interface CollectionCardMapperProps {
  cardStyle: CollectionCardStyle;
  collection: CollectionDashboardListData;
  onCollectionSelect: (slug: string) => void;
  onEditCollection: (id: string) => void;
  selectedCollectionSlug?: string;
}

const CollectionCardMapper = ({
  cardStyle,
  collection,
  onCollectionSelect,
  onEditCollection,
  selectedCollectionSlug,
}: CollectionCardMapperProps) => {
  const isActive = collection.slug === selectedCollectionSlug;

  if (cardStyle === 'cover') {
    return (
      <CollectionCardCover
        collection={collection}
        isActive={isActive}
        onClick={onCollectionSelect}
        onEdit={onEditCollection}
      />
    );
  }

  if (cardStyle === 'detailed') {
    return (
      <CollectionCardDetailed
        collection={collection}
        isActive={isActive}
        onClick={onCollectionSelect}
        onEdit={onEditCollection}
      />
    );
  }
  return (
    <CollectionCardCompact
      collection={collection}
      isActive={isActive}
      onClick={onCollectionSelect}
      onEdit={onEditCollection}
    />
  );
};
