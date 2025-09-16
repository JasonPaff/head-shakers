'use client';

import { $path } from 'next-typesafe-url';
import { useRouter } from 'next/navigation';

import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { useServerAction } from '@/hooks/use-server-action';
import { deleteBobbleheadAction } from '@/lib/actions/bobbleheads/bobbleheads.actions';

interface BobbleheadDeleteDialogProps {
  bobbleheadId: string;
  collectionId: string;
  isOpen: boolean;
  onClose: () => void;
  subcollectionId?: null | string;
}

export const BobbleheadDeleteDialog = ({
  bobbleheadId,
  collectionId,
  isOpen,
  onClose,
  subcollectionId,
}: BobbleheadDeleteDialogProps) => {
  const router = useRouter();

  const { executeAsync } = useServerAction(deleteBobbleheadAction, {
    toastMessages: {
      error: 'Failed to delete bobblehead. Please try again.',
      loading: 'Deleting bobblehead...',
      success: '',
    },
  });

  const handleDeleteAsync = async () => {
    await executeAsync({ bobbleheadId }).then(() => {
      // redirect to parent collection or subcollection
      if (subcollectionId)
        router.push(
          $path({
            route: '/collections/[collectionId]/subcollection/[subcollectionId]',
            routeParams: {
              collectionId,
              subcollectionId,
            },
          }),
        );
      else {
        router.push(
          $path({
            route: '/collections/[collectionId]',
            routeParams: {
              collectionId,
            },
          }),
        );
      }
    });
    onClose();
  };

  return (
    <ConfirmDeleteAlertDialog isOpen={isOpen} onClose={onClose} onDeleteAsync={handleDeleteAsync}>
      This will permanently delete all information and photos attached to this bobblehead.
    </ConfirmDeleteAlertDialog>
  );
};
