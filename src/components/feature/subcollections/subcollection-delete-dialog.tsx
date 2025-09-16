'use client';

import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { useServerAction } from '@/hooks/use-server-action';
import { deleteSubCollectionAction } from '@/lib/actions/collections/subcollections.actions';

interface SubcollectionDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subcollectionId: string;
}

export const SubcollectionDeleteDialog = ({
  isOpen,
  onClose,
  subcollectionId,
}: SubcollectionDeleteDialogProps) => {
  const { executeAsync } = useServerAction(deleteSubCollectionAction, {
    toastMessages: {
      error: 'Failed to delete subcollection. Please try again.',
      loading: 'Deleting subcollection...',
      success: 'Subcollection deleted successfully!',
    },
  });

  const handleDeleteAsync = async () => {
    await executeAsync({ subcollectionId });
    onClose();
  };

  return (
    <ConfirmDeleteAlertDialog isOpen={isOpen} onClose={onClose} onDeleteAsync={handleDeleteAsync}>
      This will permanently delete this subcollection and any bobbleheads assigned to it.
    </ConfirmDeleteAlertDialog>
  );
};
