'use client';

import { TrashIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { Fragment } from 'react';
import { toast } from 'sonner';

import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { Button } from '@/components/ui/button';
import { useToggle } from '@/hooks/use-toggle';
import { createCollectionAction } from '@/lib/actions/collections/collections.actions';

type BobbleheadDeleteProps = Children;

export const BobbleheadDelete = ({ children }: BobbleheadDeleteProps) => {
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useToggle();

  const { executeAsync, isExecuting } = useAction(createCollectionAction, {
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to delete bobblehead');
    },
    onSuccess: ({ data }) => {
      if (!data) return;
      toast.success('Bobblehead deleted successfully!');
    },
  });

  const handleDelete = async () => {
    await executeAsync();
  };

  return (
    <Fragment>
      {/* Delete Button */}
      <Button onClick={setIsConfirmDeleteDialogOpen.on} size={'sm'} variant={'destructive'}>
        <TrashIcon aria-hidden className={'mr-2 size-4'} />
        {children}
      </Button>

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteAlertDialog
        description={'This action cannot be undone. This will permanently delete this bobblehead.'}
        isOpen={isConfirmDeleteDialogOpen}
        onClose={setIsConfirmDeleteDialogOpen.off}
        onDelete={handleDelete}
      />
    </Fragment>
  );
};
