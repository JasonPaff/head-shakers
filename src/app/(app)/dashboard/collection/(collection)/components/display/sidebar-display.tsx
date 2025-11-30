'use client';

import { Fragment, useState } from 'react';

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
  likeCount: number;
  name: string;
  totalValue: number;
  viewCount: number;
};

type SidebarDisplayProps = {
  collections: Array<CollectionDisplayData>;
  initialSelectedId?: string;
};

export const SidebarDisplay = ({ collections, initialSelectedId }: SidebarDisplayProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [cardStyle, setCardStyle] = useState<CollectionCardStyle>('compact');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | undefined>(initialSelectedId);

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
    // TODO: Navigate to create collection or open dialog
    console.log('Create collection clicked');
  };

  const handleCollectionSelect = (id: string) => {
    setSelectedCollectionId(id);
    // TODO: Update URL params with nuqs or navigate
    console.log('Selected collection:', id);
  };

  const handleEditCollection = (id: string) => {
    // TODO: Navigate to edit collection
    console.log('Edit collection:', id);
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
      <SidebarHeader onCreateClick={handleCreateCollection} />

      <SidebarSearch
        cardStyle={cardStyle}
        onCardStyleChange={setCardStyle}
        onSearchChange={setSearchValue}
        onSearchClear={() => {
          setSearchValue('');
        }}
        searchValue={searchValue}
      />

      <SidebarCollectionList cardStyle={cardStyle}>
        {hasCollections ?
          filteredCollections.map(renderCollectionCard)
        : <NoCollections onCreateClick={handleCreateCollection} />}
      </SidebarCollectionList>

      <SidebarFooter totalCount={collections.length} />
    </Fragment>
  );
};
