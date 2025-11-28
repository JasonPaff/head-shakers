'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { useStore } from '@tanstack/react-form';

import { Alert } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { trackDialog } from '@/lib/utils/sentry-breadcrumbs';
import { createConfirmationSchema } from '@/lib/validations/confirmation.validation';

type ConfirmDeleteAlertDialogProps = Children<{
  confirmationText?: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onDeleteAsync?: () => Promise<void>;
}>;

export const ConfirmDeleteAlertDialog = withFocusManagement(
  ({
    children,
    confirmationText,
    isOpen,
    onClose,
    onDelete,
    onDeleteAsync,
  }: ConfirmDeleteAlertDialogProps) => {
    const { focusFirstError } = useFocusContext();

    const form = useAppForm({
      canSubmitWhenInvalid: true,
      defaultValues: {
        confirmationName: '',
      },
      onSubmit: async () => {
        await handleConfirm();
      },
      onSubmitInvalid: ({ formApi }) => {
        focusFirstError(formApi);
      },
      validationLogic: revalidateLogic({
        mode: 'submit',
        modeAfterSubmission: 'change',
      }),
      validators: {
        onSubmit: confirmationText ? createConfirmationSchema(confirmationText) : undefined,
      },
    });

    const handleCancel = () => {
      trackDialog('confirm-delete', 'cancelled');
      form.reset();
      onClose();
    };

    const handleConfirm = async () => {
      trackDialog('confirm-delete', 'confirmed');
      onDelete?.();
      await onDeleteAsync?.();
      form.reset();
      onClose();
    };

    const handleOpenChange = (isOpenValue: boolean) => {
      if (isOpenValue) return;
      handleCancel();
    };

    const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
    const canSubmit = useStore(form.store, (state) => state.canSubmit);

    const _isDeleteDisabled = confirmationText ? !canSubmit || isSubmitting : isSubmitting;

    return (
      <AlertDialog onOpenChange={handleOpenChange} open={isOpen} trackingName={'confirm-delete'}>
        <AlertDialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <Alert variant={'error'}>This action cannot be undone</Alert>
              <AlertDialogDescription className={'py-4 text-base'}>{children}</AlertDialogDescription>

              {/* Confirmation Field */}
              {confirmationText && (
                <div className={'space-y-2'}>
                  <p className={'text-sm text-muted-foreground'}>
                    Type <span className={'font-semibold text-foreground'}>{confirmationText}</span> to
                    confirm:
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

            {/* Action Buttons */}
            <AlertDialogFooter className={'mt-2'}>
              <AlertDialogCancel disabled={isSubmitting} onClick={handleCancel}>
                Cancel
              </AlertDialogCancel>
              <Button disabled={_isDeleteDisabled} type={'submit'} variant={'destructive'}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);
