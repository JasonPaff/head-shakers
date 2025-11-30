'use client';

import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';

import { CollectionCreateDialog } from '@/components/feature/collections/collection-create-dialog';
import { CollectionEditDialog } from '@/components/feature/collections/collection-edit-dialog';
import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';

import type { CollectionCardStyle } from '../sidebar/sidebar-search';

import { NoCollections } from '../empty-states/no-collections';
import { CollectionCardCompact } from '../sidebar/cards/collection-card-compact';
import { CollectionCardCover } from '../sidebar/cards/collection-card-cover';
import { CollectionCardDetailed } from '../sidebar/cards/collection-card-detailed';
import { SidebarCollectionList } from '../sidebar/sidebar-collection-list';
import { SidebarFooter } from '../sidebar/sidebar-footer';
import { SidebarHeader } from '../sidebar/sidebar-header';
import { SidebarSearch } from '../sidebar/sidebar-search';

export type CollectionDisplayData = {
  bobbleheadCount: number;
  commentCount: number;
  coverImageUrl: string;
  description: string;
  featuredCount: number;
  id: string;
  isPublic: boolean;
  likeCount: number;
  name: string;
  totalValue: number;
  viewCount: number;
};

type CollectionForEdit = {
  coverImageUrl?: null | string;
  description: null | string;
  id: string;
  isPublic: boolean;
  name: string;
};

type SidebarDisplayProps = {
  collections: Array<CollectionDisplayData>;
  initialSelectedId?: string;
};

export const SidebarDisplay = ({ collections, initialSelectedId }: SidebarDisplayProps) => {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState('');
  const [cardStyle, setCardStyle] = useState<CollectionCardStyle>('compact');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | undefined>(initialSelectedId);
  const [editingCollection, setEditingCollection] = useState<CollectionForEdit | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useToggle();
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();

  // Filter collections based on search
  const filteredCollections =
    searchValue.trim() ?
      collections.filter(
        (c) =>
          c.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          c.description.toLowerCase().includes(searchValue.toLowerCase()),
      )
    : collections;

  const hasCollections = filteredCollections.length > 0;

  const handleCreateCollection = () => {
    setIsCreateDialogOpen.on();
  };

  const handleCollectionCreated = (newCollection: ComboboxItem) => {
    setSelectedCollectionId(newCollection.id);
    router.refresh();
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

  const renderCollectionCard = (collection: CollectionDisplayData) => {
    const isActive = collection.id === selectedCollectionId;

    switch (cardStyle) {
      case 'cover':
        return (
          <CollectionCardCover
            bobbleheadCount={collection.bobbleheadCount}
            coverImageUrl={collection.coverImageUrl}
            description={collection.description}
            id={collection.id}
            isActive={isActive}
            key={collection.id}
            likeCount={collection.likeCount}
            name={collection.name}
            onClick={handleCollectionSelect}
            onEdit={handleEditCollection}
            totalValue={collection.totalValue}
          />
        );
      case 'detailed':
        return (
          <CollectionCardDetailed
            bobbleheadCount={collection.bobbleheadCount}
            commentCount={collection.commentCount}
            coverImageUrl={collection.coverImageUrl}
            description={collection.description}
            featuredCount={collection.featuredCount}
            id={collection.id}
            isActive={isActive}
            key={collection.id}
            likeCount={collection.likeCount}
            name={collection.name}
            onClick={handleCollectionSelect}
            onEdit={handleEditCollection}
            totalValue={collection.totalValue}
            viewCount={collection.viewCount}
          />
        );
      default:
        return (
          <CollectionCardCompact
            bobbleheadCount={collection.bobbleheadCount}
            coverImageUrl={collection.coverImageUrl}
            id={collection.id}
            isActive={isActive}
            key={collection.id}
            name={collection.name}
            onClick={handleCollectionSelect}
            onEdit={handleEditCollection}
            totalValue={collection.totalValue}
          />
        );
    }
  };

  return (
    <Fragment>
      {/* Header */}
      <SidebarHeader onCreateClick={handleCreateCollection} />

      {/* Search Bar */}
      <SidebarSearch
        cardStyle={cardStyle}
        onCardStyleChange={setCardStyle}
        onSearchChange={setSearchValue}
        onSearchClear={() => {
          setSearchValue('');
        }}
        searchValue={searchValue}
      />

      {/* Collection List */}
      <SidebarCollectionList cardStyle={cardStyle}>
        {hasCollections ?
          filteredCollections.map(renderCollectionCard)
        : <NoCollections onCreateClick={handleCreateCollection} />}
      </SidebarCollectionList>

      {/* Footer */}
      <SidebarFooter totalCount={collections.length} />

      {/* Create Collection Dialog */}
      <CollectionCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={setIsCreateDialogOpen.off}
        onCollectionCreated={handleCollectionCreated}
      />

      {/* Edit Collection Details Dialog */}
      <Conditional isCondition={!!editingCollection}>
        <CollectionEditDialog
          collection={editingCollection!}
          isOpen={isEditDialogOpen}
          onClose={handleEditDialogClose}
        />
      </Conditional>
    </Fragment>
  );
};
