'use client';

import { FolderOpen } from 'lucide-react';

import { SubcollectionCard } from '@/components/feature/subcollections/subcollection-card';
import { EmptyState } from '@/components/ui/empty-state';
import { generateTestId } from '@/lib/test-ids';

interface CollectionSubcollectionsListProps {
  collectionSlug: string;
  isOwner: boolean;
  subcollections: Array<SubcollectionForList>;
}

interface SubcollectionForList {
  bobbleheadCount: number;
  coverImageUrl?: null | string;
  description: null | string;
  id: string;
  isPublic: boolean;
  name: string;
  slug: string;
}

export const CollectionSubcollectionsList = ({
  collectionSlug,
  isOwner,
  subcollections,
}: CollectionSubcollectionsListProps) => {
  const subcollectionGridTestId = generateTestId('feature', 'subcollection-grid');

  const _hasSubcollections = subcollections.length > 0;

  if (!_hasSubcollections) {
    return (
      <EmptyState
        className={'min-h-[200px]'}
        description={'Organize your collection by creating subcollections'}
        icon={FolderOpen}
        testId={generateTestId('feature', 'subcollection-empty-state')}
        title={'No Subcollections'}
      />
    );
  }

  return (
    <div
      aria-label={'Subcollections list'}
      className={'grid grid-cols-1 gap-4 sm:grid-cols-2'}
      data-slot={'subcollection-grid'}
      data-testid={subcollectionGridTestId}
      role={'list'}
    >
      {subcollections.map((subcollection) => (
        <div
          data-slot={'subcollection-list-item'}
          data-testid={generateTestId('feature', 'subcollection-list-item', subcollection.id)}
          key={subcollection.id}
          role={'listitem'}
        >
          <SubcollectionCard
            collectionSlug={collectionSlug}
            isOwner={isOwner}
            subcollection={subcollection}
          />
        </div>
      ))}
    </div>
  );
};
