'use client';

import { $path } from 'next-typesafe-url';
import { useRouter } from 'next/navigation';

import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { useServerAction } from '@/hooks/use-server-action';
import { deleteBobbleheadAction } from '@/lib/actions/bobbleheads/bobbleheads.actions';

interface BobbleheadDeleteDialogProps {
  bobbleheadId: string;
  collectionSlug: string;
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export const BobbleheadDeleteDialog = ({
  bobbleheadId,
  collectionSlug,
  isOpen,
  onClose,
  username,
}: BobbleheadDeleteDialogProps) => {
  const router = useRouter();

  const { executeAsync } = useServerAction(deleteBobbleheadAction, {
    loadingMessage: 'Deleting bobblehead...',
  });

  const handleDeleteAsync = async () => {
    await executeAsync({ bobbleheadId }).then(() => {
      // redirect to the parent collection
      router.push(
        $path({
          route: '/user/[username]/collection/[collectionSlug]',
          routeParams: {
            collectionSlug,
            username,
          },
        }),
      );
    });
    onClose();
  };

  return (
    <ConfirmDeleteAlertDialog isOpen={isOpen} onClose={onClose} onDeleteAsync={handleDeleteAsync}>
      This will permanently delete all information and photos attached to this bobblehead.
    </ConfirmDeleteAlertDialog>
  );
};
