'use client';

import type { ComponentProps } from 'react';

import { TrashIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { Button } from '@/components/ui/button';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { deleteCollectionAction } from '@/lib/actions/collections/collections.actions';
import { cn } from '@/utils/tailwind-utils';

type CollectionDeleteProps = Children<{
  collectionId: string;
  collectionName: string;
}> &
  Omit<ComponentProps<typeof Button>, 'children' | 'onClick'>;

export const CollectionDelete = ({ children, collectionId, collectionName, ...props }: CollectionDeleteProps) => {
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useToggle();

  const router = useRouter();

  const { executeAsync, isExecuting } = useServerAction(deleteCollectionAction, {
    toastMessages: {
      error: 'Failed to delete collection. Please try again.',
      loading: 'Deleting collection...',
      success: 'Collection deleted successfully!',
    },
  });

  const handleDeleteAsync = async () => {
    await executeAsync({ collectionId }).then(() => {
      router.push($path({ route: '/dashboard/collection' }));
    });
  };

  return (
    <Fragment>
      <Button
        disabled={isExecuting}
        onClick={setIsConfirmDeleteDialogOpen.on}
        size={'sm'}
        variant={'destructive'}
        {...props}
      >
        <TrashIcon
          aria-hidden
          aria-label={'delete collection'}
          className={cn(!!children && 'mr-2', 'size-4')}
        />
        {children}
      </Button>

      <ConfirmDeleteAlertDialog
        confirmationText={collectionName}
        isOpen={isConfirmDeleteDialogOpen}
        onClose={setIsConfirmDeleteDialogOpen.off}
        onDeleteAsync={handleDeleteAsync}
      >
        This will permanently delete this collection and any subcollections and bobbleheads within.
      </ConfirmDeleteAlertDialog>
    </Fragment>
  );
};
