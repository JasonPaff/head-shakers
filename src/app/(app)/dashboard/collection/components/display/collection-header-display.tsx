'use client';

import { useQueryStates } from 'nuqs';
import { Fragment, useState } from 'react';

import type { CollectionForUpsert } from '@/components/feature/collections/collection-upsert-dialog.types';
import type { CollectionDashboardHeaderRecord } from '@/lib/queries/collections/collections-dashboard.query';

import { collectionDashboardParsers } from '@/app/(app)/dashboard/collection/route-type';
import { CollectionUpsertDialog } from '@/components/feature/collections/collection-upsert-dialog';
import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { Conditional } from '@/components/ui/conditional';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { deleteCollectionAction } from '@/lib/actions/collections/collections.actions';

import { CollectionHeaderCard } from '../main/collection-header-card';

type CollectionHeaderDisplayProps = {
  collection: CollectionDashboardHeaderRecord;
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
      {/* Collection Header Card */}
      <CollectionHeaderCard collection={collection} onDelete={handleDelete} onEdit={handleEdit} />

      {/* Delete Collection Confirmation Dialog */}
      <ConfirmDeleteAlertDialog
        confirmationText={collection.name}
        isOpen={isConfirmDeleteDialogOpen}
        onClose={setIsConfirmDeleteDialogOpen.off}
        onDeleteAsync={handleDeleteAsync}
      >
        This will permanently delete this collection and all bobbleheads within.
      </ConfirmDeleteAlertDialog>

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
