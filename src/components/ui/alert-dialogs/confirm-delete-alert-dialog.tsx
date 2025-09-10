'use client';

import { Alert } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type ConfirmDeleteAlertDialogProps = Children<{
  isOpen: boolean;
  onClose: () => void;
  onDelete: (() => Promise<void>) | (() => void);
}>;

export const ConfirmDeleteAlertDialog = ({
  children,
  isOpen,
  onClose,
  onDelete,
}: ConfirmDeleteAlertDialogProps) => {
  const handleCancel = () => {
    onClose();
  };

  const handleConfirm = async () => {
    await onDelete();
    onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) return;
    onClose();
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <Alert variant={'error'}>This action cannot be undone</Alert>
          <AlertDialogDescription className={'py-4'}>{children}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <Button
            asChild
            onClick={() => {
              void handleConfirm();
            }}
            variant={'destructive'}
          >
            <AlertDialogAction>Delete</AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
