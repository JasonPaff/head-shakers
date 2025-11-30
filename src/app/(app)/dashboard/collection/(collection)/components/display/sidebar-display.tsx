'use client';

import { Fragment, useCallback, useMemo, useState } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { CollectionDashboardListData } from '@/lib/queries/collections/collections.query';

import { CollectionUpsertDialog } from '@/components/feature/collections/collection-upsert-dialog';
import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';
import { useUserPreferences } from '@/hooks/use-user-preferences';

import type { CollectionCardStyle } from '../sidebar/sidebar-search';

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
  initialSelectedId?: string;
};

export const SidebarDisplay = ({
  collections,
  initialCardStyle = 'compact',
  initialSelectedId,
}: SidebarDisplayProps) => {
  const [cardStyle, setCardStyleState] = useState<CollectionCardStyle>(initialCardStyle);
  const [editingCollection, setEditingCollection] = useState<CollectionForEdit | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | undefined>(initialSelectedId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useToggle();
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();

  const { setPreference } = useUserPreferences();

  const setCardStyle = useCallback(
    (newStyle: CollectionCardStyle) => {
      setCardStyleState(newStyle);
      setPreference('collectionSidebarView', newStyle);
    },
    [setPreference],
  );

  // Filter collections based on search
  const filteredCollections = useMemo(() => {
    return searchValue.trim() ?
        collections.filter(
          (c) =>
            c.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchValue.toLowerCase()),
        )
      : collections;
  }, [collections, searchValue]);

  const handleCreateCollection = () => {
    setIsCreateDialogOpen.on();
  };

  const handleCollectionCreated = (newCollection: ComboboxItem) => {
    setSelectedCollectionId(newCollection.id);
  };

  const handleCollectionSelect = (id: string) => {
    setSelectedCollectionId(id);
    // TODO: Update URL params with nuqs or navigate
    console.log('Selected collection:', id);
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
        searchValue={searchValue}
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
              selectedCollectionId={selectedCollectionId}
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
  onCollectionSelect: (id: string) => void;
  onEditCollection: (id: string) => void;
  selectedCollectionId?: string;
}

const CollectionCardMapper = ({
  cardStyle,
  collection,
  onCollectionSelect,
  onEditCollection,
  selectedCollectionId,
}: CollectionCardMapperProps) => {
  const isActive = collection.id === selectedCollectionId;

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
