'use client';

import { Fragment, useState } from 'react';

import type { CollectionCardStyle } from './sidebar-search';

import { NoCollections } from '../empty-states/no-collections';
import { SidebarCollectionList } from './sidebar-collection-list';
import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarSearch } from './sidebar-search';

export const SidebarContent = () => {
  const [searchValue, setSearchValue] = useState('');
  const [cardStyle, setCardStyle] = useState<CollectionCardStyle>('compact');

  // Placeholder values - will be replaced with real data
  const collectionsCount = 0;
  const hasCollections = collectionsCount > 0;

  const handleCreateCollection = () => {
    // TODO: Navigate to create collection or open dialog
    console.log('Create collection clicked');
  };

  return (
    <Fragment>
      <SidebarHeader onCreateClick={handleCreateCollection} />

      <SidebarSearch
        cardStyle={cardStyle}
        onCardStyleChange={setCardStyle}
        onSearchChange={setSearchValue}
        onSearchClear={() => setSearchValue('')}
        searchValue={searchValue}
      />

      <SidebarCollectionList cardStyle={cardStyle}>
        {hasCollections ?
          // TODO: Map over collections and render appropriate card type
          <div>Collections will render here</div>
        : <NoCollections onCreateClick={handleCreateCollection} />}
      </SidebarCollectionList>

      <SidebarFooter totalCount={collectionsCount} />
    </Fragment>
  );
};
