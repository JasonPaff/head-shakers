'use client';

import { useQueryStates } from 'nuqs';
import { Fragment, useState } from 'react';

import type { CollectionForUpsert } from '@/components/feature/collections/collection-upsert-dialog.types';

import { CollectionUpsertDialog } from '@/components/feature/collections/collection-upsert-dialog';
import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { Conditional } from '@/components/ui/conditional';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { deleteCollectionAction } from '@/lib/actions/collections/collections.actions';

import type { CollectionHeaderData } from '../async/collection-header-async';

import { collectionDashboardParsers } from '../../search-params';
import { CollectionHeaderCard } from '../main/collection-header-card';

type CollectionHeaderDisplayProps = {
  collection: CollectionHeaderData | null;
};

export const CollectionHeaderDisplay = ({ collection }: CollectionHeaderDisplayProps) => {
  const [editingCollection, setEditingCollection] = useState<CollectionForUpsert | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useToggle();
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();

  const [, setParams] = useQueryStates(
    { collectionSlug: collectionDashboardParsers.collectionSlug },
    { shallow: false },
  );

  const { executeAsync } = useServerAction(deleteCollectionAction, {
    loadingMessage: 'Deleting collection...',
    onAfterSuccess: () => {
      void setParams({ collectionSlug: null });
    },
  });

  if (!collection) {
    return null;
  }

  const handleEdit = () => {
    setEditingCollection({
      coverImageUrl: collection.coverImageUrl || null,
      description: collection.description || null,
      id: collection.id,
      isPublic: collection.isPublic,
      name: collection.name,
    });
    setIsEditDialogOpen.on();
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen.off();
    setEditingCollection(null);
  };

  const handleDelete = () => {
    setIsConfirmDeleteDialogOpen.on();
  };

  const handleDeleteAsync = async () => {
    await executeAsync({ collectionId: collection.id });
  };

  return (
    <Fragment>
      <CollectionHeaderCard
        bobbleheadCount={collection.bobbleheadCount}
        collectionSlug={collection.slug}
        coverImageUrl={collection.coverImageUrl}
        description={collection.description}
        featuredCount={collection.featuredCount}
        likeCount={collection.likeCount}
        name={collection.name}
        onDelete={handleDelete}
        onEdit={handleEdit}
        totalValue={collection.totalValue}
        viewCount={collection.viewCount}
      />

      <ConfirmDeleteAlertDialog
        confirmationText={collection.name}
        isOpen={isConfirmDeleteDialogOpen}
        onClose={setIsConfirmDeleteDialogOpen.off}
        onDeleteAsync={handleDeleteAsync}
      >
        This will permanently delete this collection and all bobbleheads within.
      </ConfirmDeleteAlertDialog>

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
