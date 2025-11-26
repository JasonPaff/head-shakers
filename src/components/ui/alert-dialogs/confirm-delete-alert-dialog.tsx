'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { useStore } from '@tanstack/react-form';

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
import { useAppForm } from '@/components/ui/form';
import { createConfirmationSchema } from '@/lib/validations/confirmation.validation';

type ConfirmDeleteAlertDialogProps = Children<{
  confirmationText?: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onDeleteAsync?: () => Promise<void>;
}>;

export const ConfirmDeleteAlertDialog = ({
  children,
  confirmationText,
  isOpen,
  onClose,
  onDelete,
  onDeleteAsync,
}: ConfirmDeleteAlertDialogProps) => {
  // Always create form (hooks cannot be conditional)
  const form = useAppForm({
    canSubmitWhenInvalid: true,
    defaultValues: {
      confirmationName: '',
    },
    onSubmit: async () => {
      await handleConfirm();
    },
    validationLogic: revalidateLogic({
      mode: 'change',
    }),
    validators: {
      onChange: confirmationText ? createConfirmationSchema(confirmationText) : undefined,
    },
  });

  // Get current form value for validation
  const confirmationValue = useStore(form.store, (state) => state.values.confirmationName);
  const _isConfirmationValid = confirmationText ? confirmationValue === confirmationText : true;

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const handleConfirm = async () => {
    onDelete?.();
    await onDeleteAsync?.();
    form.reset();
    onClose();
  };

  const handleOpenChange = (isOpenValue: boolean) => {
    if (isOpenValue) return;
    handleCancel();
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <Alert variant={'error'}>This action cannot be undone</Alert>
          <AlertDialogDescription className={'py-4 text-base'}>{children}</AlertDialogDescription>

          {/* Confirmation Field */}
          {confirmationText && (
            <div className={'space-y-2'}>
              <p className={'text-sm text-muted-foreground'}>
                Type <span className={'font-semibold text-foreground'}>{confirmationText}</span> to confirm:
              </p>
              <form.AppField name={'confirmationName'}>
                {(field) => (
                  <field.TextField
                    autoComplete={'off'}
                    label={'Confirmation'}
                    placeholder={confirmationText}
                    testId={'confirm-delete-input'}
                  />
                )}
              </form.AppField>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <Button
            asChild
            disabled={!_isConfirmationValid}
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
