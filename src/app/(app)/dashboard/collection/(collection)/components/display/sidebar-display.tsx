'use client';

import { useQueryStates } from 'nuqs';
import { Fragment, useCallback, useMemo, useState } from 'react';

import type { CollectionCreatedResult } from '@/components/feature/collections/hooks/use-collection-upsert-form';
import type { CollectionSortOption, UserPreferences } from '@/hooks/use-user-preferences';
import type { CollectionDashboardListRecord } from '@/lib/queries/collections/collections.query';

import { collectionDashboardParsers } from '@/app/(app)/dashboard/collection/(collection)/route-type';
import { CollectionUpsertDialog } from '@/components/feature/collections/collection-upsert-dialog';
import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { Conditional } from '@/components/ui/conditional';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { deleteCollectionAction } from '@/lib/actions/collections/collections.actions';
import { sortCollections } from '@/lib/utils/collection.utils';

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
  collections: Array<CollectionDashboardListRecord>;
  userPreferences: UserPreferences;
};

export const SidebarDisplay = ({ collections, userPreferences }: SidebarDisplayProps) => {
  const [cardStyle, setCardStyleState] = useState<CollectionCardStyle>(
    userPreferences?.collectionSidebarView ?? 'compact',
  );
  const [editingCollection, setEditingCollection] = useState<CollectionForEdit | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [sortOption, setSortOptionState] = useState<CollectionSortOption>(
    userPreferences.collectionSidebarSort ?? 'name-asc',
  );

  const [deletingCollectionId, setDeletingCollectionId] = useState<null | string>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useToggle();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useToggle();
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();
  const [isHoverCardEnabled, setHoverCardEnabled] = useToggle(userPreferences.isCollectionHoverCardEnabled);

  const [{ collectionSlug }, setParams] = useQueryStates(
    { collectionSlug: collectionDashboardParsers.collectionSlug },
    { shallow: false },
  );

  const { setPreference } = useUserPreferences();

  const { executeAsync: executeDeleteAsync } = useServerAction(deleteCollectionAction, {
    loadingMessage: 'Deleting collection...',
    onAfterSuccess: () => {
      void setParams({ collectionSlug: null });
      setIsDeleteDialogOpen.off();
      setDeletingCollectionId(null);
    },
  });

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

  const handleHoverCardToggle = useCallback(() => {
    setHoverCardEnabled.update((prev) => {
      const isEnabled = !prev;
      setPreference('isCollectionHoverCardEnabled', isEnabled);
      return isEnabled;
    });
  }, [setPreference, setHoverCardEnabled]);

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

  const handleDeleteCollection = (id: string) => {
    setDeletingCollectionId(id);
    setIsDeleteDialogOpen.on();
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen.off();
    setDeletingCollectionId(null);
  };

  const handleDeleteAsync = async () => {
    if (deletingCollectionId) {
      await executeDeleteAsync({ collectionId: deletingCollectionId });
    }
  };

  const deletingCollection =
    deletingCollectionId ? collections.find((c) => c.id === deletingCollectionId) : null;

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
        isHoverCardEnabled={isHoverCardEnabled}
        onCardStyleChange={setCardStyle}
        onHoverCardToggle={handleHoverCardToggle}
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
              isHoverCardEnabled={isHoverCardEnabled}
              key={collection.id}
              onCollectionSelect={handleCollectionSelect}
              onDeleteCollection={handleDeleteCollection}
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

      {/* Delete Collection Confirmation Dialog */}
      <Conditional isCondition={!!deletingCollection}>
        <ConfirmDeleteAlertDialog
          confirmationText={deletingCollection?.name ?? ''}
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onDeleteAsync={handleDeleteAsync}
        >
          This will permanently delete this collection and all bobbleheads within.
        </ConfirmDeleteAlertDialog>
      </Conditional>
    </Fragment>
  );
};

interface CollectionCardMapperProps {
  cardStyle: CollectionCardStyle;
  collection: CollectionDashboardListRecord;
  isHoverCardEnabled: boolean;
  onCollectionSelect: (slug: string) => void;
  onDeleteCollection: (id: string) => void;
  onEditCollection: (id: string) => void;
  selectedCollectionSlug?: string;
}

const CollectionCardMapper = ({
  cardStyle,
  collection,
  isHoverCardEnabled,
  onCollectionSelect,
  onDeleteCollection,
  onEditCollection,
  selectedCollectionSlug,
}: CollectionCardMapperProps) => {
  const isActive = collection.slug === selectedCollectionSlug;

  if (cardStyle === 'cover') {
    return (
      <CollectionCardCover
        collection={collection}
        isActive={isActive}
        isHoverCardEnabled={isHoverCardEnabled}
        onClick={onCollectionSelect}
        onDelete={onDeleteCollection}
        onEdit={onEditCollection}
      />
    );
  }

  if (cardStyle === 'detailed') {
    return (
      <CollectionCardDetailed
        collection={collection}
        isActive={isActive}
        isHoverCardEnabled={isHoverCardEnabled}
        onClick={onCollectionSelect}
        onDelete={onDeleteCollection}
        onEdit={onEditCollection}
      />
    );
  }
  return (
    <CollectionCardCompact
      collection={collection}
      isActive={isActive}
      isHoverCardEnabled={isHoverCardEnabled}
      onClick={onCollectionSelect}
      onDelete={onDeleteCollection}
      onEdit={onEditCollection}
    />
  );
};
