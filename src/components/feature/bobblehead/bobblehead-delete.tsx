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
import { deleteBobbleheadAction } from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { cn } from '@/utils/tailwind-utils';

type BobbleheadDeleteProps = Children<{
  bobbleheadId: string;
  collectionSlug: string;
}> &
  Omit<ComponentProps<typeof Button>, 'children' | 'onClick'>;

export const BobbleheadDelete = ({
  bobbleheadId,
  children,
  collectionSlug,
  ...props
}: BobbleheadDeleteProps) => {
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useToggle();

  const router = useRouter();

  const { executeAsync, isExecuting } = useServerAction(deleteBobbleheadAction, {
    toastMessages: {
      error: 'Failed to delete bobblehead. Please try again.',
      loading: 'Deleting bobblehead...',
      success: '',
    },
  });

  const handleDeleteAsync = async () => {
    await executeAsync({ bobbleheadId }).then(() => {
      // redirect to parent collection
      router.push(
        $path({
          route: '/collections/[collectionSlug]',
          routeParams: {
            collectionSlug,
          },
        }),
      );
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
        {...props}
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
        This will permanently delete all information and photos attached to this bobblehead.
      </ConfirmDeleteAlertDialog>
    </Fragment>
  );
};
