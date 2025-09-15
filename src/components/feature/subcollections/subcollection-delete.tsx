'use client';

import type { ComponentProps } from 'react';

import { TrashIcon } from 'lucide-react';
import { Fragment } from 'react';

import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { Button } from '@/components/ui/button';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { deleteSubCollectionAction } from '@/lib/actions/collections/subcollections.actions';
import { cn } from '@/utils/tailwind-utils';

type SubcollectionDeleteProps = Children<{
  subcollectionId: string;
}> &
  Omit<ComponentProps<typeof Button>, 'children' | 'onClick'>;

export const SubcollectionDelete = ({ children, subcollectionId, ...props }: SubcollectionDeleteProps) => {
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useToggle();

  const { executeAsync, isExecuting } = useServerAction(deleteSubCollectionAction, {
    toastMessages: {
      error: 'Failed to delete subcollection. Please try again.',
      loading: 'Deleting subcollection...',
      success: 'Subcollection deleted successfully!',
    },
  });

  const handleDeleteAsync = async () => {
    await executeAsync({ subcollectionId });
  };

  return (
    <Fragment>
      {/* Delete Button */}
      <Button
        disabled={isExecuting}
        onClick={setIsConfirmDeleteDialogOpen.on}
        size={'sm'}
        variant={'destructive'}
        {...props}
      >
        <TrashIcon
          aria-hidden
          aria-label={'delete subcollection'}
          className={cn(!!children && 'mr-2', 'size-4')}
        />
        {children}
      </Button>

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteAlertDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={setIsConfirmDeleteDialogOpen.off}
        onDeleteAsync={handleDeleteAsync}
      >
        This will permanently delete this subcollection and any bobbleheads assigned to it.
      </ConfirmDeleteAlertDialog>
    </Fragment>
  );
};
