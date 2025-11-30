'use client';

import type { CollectionHeaderData } from '../async/collection-header-async';

import { CollectionHeaderCard } from '../main/collection-header-card';

type CollectionHeaderDisplayProps = {
  collection: CollectionHeaderData | null;
};

export const CollectionHeaderDisplay = ({ collection }: CollectionHeaderDisplayProps) => {
  // Early return if no collection data - header won't be shown
  if (!collection) {
    return null;
  }

  // Action handlers - TODO: Implement real actions
  const handleEdit = () => {
    console.log('Edit collection:', collection.id);
  };

  const handleShare = () => {
    console.log('Share collection:', collection.id);
  };

  const handleDelete = () => {
    console.log('Delete collection:', collection.id);
  };

  const handleSettings = () => {
    console.log('Collection settings:', collection.id);
  };

  return (
    <CollectionHeaderCard
      bobbleheadCount={collection.bobbleheadCount}
      coverImageUrl={collection.coverImageUrl}
      description={collection.description}
      featuredCount={collection.featuredCount}
      likeCount={collection.likeCount}
      name={collection.name}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onSettings={handleSettings}
      onShare={handleShare}
      totalValue={collection.totalValue}
      viewCount={collection.viewCount}
    />
  );
};
