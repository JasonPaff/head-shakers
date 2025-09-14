'use client';

import { MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { Fragment } from 'react';

import { SubcollectionEditDialog } from '@/components/feature/subcollections/subcollection-edit-dialog';
import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { deleteSubCollectionAction } from '@/lib/actions/collections/subcollections.actions';

interface SubcollectionActionsProps {
  subcollection: {
    description: null | string;
    id: string;
    name: string;
  };
}

export const SubcollectionActions = ({ subcollection }: SubcollectionActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useToggle();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useToggle();

  const { executeAsync, isExecuting } = useServerAction(deleteSubCollectionAction, {
    toastMessages: {
      error: 'Failed to delete subcollection. Please try again.',
      loading: 'Deleting subcollection...',
      success: 'Subcollection deleted successfully!',
    },
  });

  const handleDeleteSubcollectionAsync = async () => {
    await executeAsync({ subcollectionId: subcollection.id });
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
          <DropdownMenuItem disabled={isExecuting} onClick={setIsEditDialogOpen.on}>
            <PencilIcon aria-hidden className={'mr-2 size-4'} />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isExecuting} onClick={setIsDeleteDialogOpen.on} variant={'destructive'}>
            <Trash2Icon aria-hidden className={'mr-2 size-4'} />
            Delete Subcollection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Subcollection Details Dialog */}
      <SubcollectionEditDialog
        isOpen={isEditDialogOpen}
        onClose={setIsEditDialogOpen.off}
        subcollection={subcollection}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteAlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={setIsDeleteDialogOpen.off}
        onDeleteAsync={handleDeleteSubcollectionAsync}
      >
        This will permanently delete this subcollection and any bobbleheads assigned to it.
      </ConfirmDeleteAlertDialog>
    </Fragment>
  );
};
