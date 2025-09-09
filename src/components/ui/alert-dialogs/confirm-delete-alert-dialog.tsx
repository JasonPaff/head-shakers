'use client';

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

interface ConfirmDeleteAlertDialogProps {
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (() => Promise<void>) | (() => void);
}

export const ConfirmDeleteAlertDialog = ({
  description,
  isOpen,
  onClose,
  onDelete,
}: ConfirmDeleteAlertDialogProps) => {
  const handleCancel = () => {
    onClose();
  };

  const handleConfirm = async () => {
    console.log('deleting');
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
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={() => {
                void handleConfirm();
              }}
              variant={'destructive'}
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
