'use client';

import { TrashIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';
import { toast } from 'sonner';

import { ConfirmDeleteAlertDialog } from '@/components/ui/alert-dialogs/confirm-delete-alert-dialog';
import { Button } from '@/components/ui/button';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { deleteBobbleheadAction } from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { cn } from '@/utils/tailwind-utils';

type BobbleheadDeleteProps = Children<{
  bobbleheadId: string;
  collectionId: string;
  subcollectionId?: null | string;
}>;

export const BobbleheadDelete = ({
  bobbleheadId,
  children,
  collectionId,
  subcollectionId,
}: BobbleheadDeleteProps) => {
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useToggle();

  const router = useRouter();

  const { executeAsync, isExecuting } = useServerAction(deleteBobbleheadAction);

  const handleDeleteAsync = async () => {
    await executeAsync({ bobbleheadId }).then(() => {
      toast.success('Bobblehead deleted successfully!');

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
  };

  return (
    <Fragment>
      {/* Delete Button */}
      <Button
        disabled={isExecuting}
        onClick={setIsConfirmDeleteDialogOpen.on}
        size={'sm'}
        variant={'destructive'}
      >
        <TrashIcon
          aria-hidden
          aria-label={'delete bobblehead'}
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
        This will permanently delete all information and photos attached to this bobblehead record.
      </ConfirmDeleteAlertDialog>
    </Fragment>
  );
};
