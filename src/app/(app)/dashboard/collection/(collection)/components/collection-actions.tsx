'use client';

import { MoreVerticalIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

import type { CollectionDashboardData } from '@/lib/facades/collections/collections.facade';

import { CollectionEditDialog } from '@/components/feature/collections/collection-edit-dialog';
import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { deleteCollectionAction } from '@/lib/actions/collections/collections.actions';

interface CollectionActionsProps {
  collection: CollectionDashboardData;
}

export const CollectionActions = ({ collection }: CollectionActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useToggle();

  const router = useRouter();

  const { executeAsync, isExecuting } = useServerAction(deleteCollectionAction, {
    toastMessages: {
      error: 'Failed to delete collection. Please try again.',
      loading: 'Deleting collection...',
      success: 'Collection deleted successfully!',
    },
  });

  const handleAddBobblehead = () => {
    router.push($path({ route: '/bobbleheads/add', searchParams: { collectionId: collection.id } }));
  };

  const handleDeleteCollectionAsync = async () => {
    await executeAsync({ collectionId: collection.id });
  };

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={'sm'} variant={'ghost'}>
            <MoreVerticalIcon aria-hidden className={'size-4'} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={'end'}>
          <DropdownMenuItem disabled={isExecuting} onClick={handleAddBobblehead}>
            <PlusIcon aria-hidden className={'mr-2 size-4'} />
            Add Bobblehead
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isExecuting} onClick={setIsEditDialogOpen.on}>
            <PencilIcon aria-hidden className={'mr-2 size-4'} />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isExecuting} onClick={setIsDeleteDialogOpen.on} variant={'destructive'}>
            <Trash2Icon aria-hidden className={'mr-2 size-4'} />
            Delete Collection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Collection Details Dialog */}
      <Conditional isCondition={isEditDialogOpen}>
        <CollectionEditDialog
          collection={collection}
          isOpen={isEditDialogOpen}
          onClose={setIsEditDialogOpen.off}
        />
      </Conditional>

      {/* Confirm Delete Dialog */}
      <Conditional isCondition={isDeleteDialogOpen}>
        <ConfirmDeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={setIsDeleteDialogOpen.off}
          onDeleteAsync={handleDeleteCollectionAsync}
        >
          This will permanently delete this collection and any subcollections.
        </ConfirmDeleteAlertDialog>
      </Conditional>
    </Fragment>
  );
};
