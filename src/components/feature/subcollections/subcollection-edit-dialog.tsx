'use client';

import { revalidateLogic } from '@tanstack/form-core';

import type { UpdateSubCollectionInput } from '@/lib/validations/subcollections.validation';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useServerAction } from '@/hooks/use-server-action';
import { updateSubCollectionAction } from '@/lib/actions/collections/subcollections.actions';
import { updateSubCollectionSchema } from '@/lib/validations/subcollections.validation';

interface SubcollectionEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subcollection: {
    description: null | string;
    id: string;
    name: string;
  };
}

export const SubcollectionEditDialog = withFocusManagement(
  ({ isOpen, onClose, subcollection }: SubcollectionEditDialogProps) => {
    const { focusFirstError } = useFocusContext();

    const { executeAsync, isExecuting } = useServerAction(updateSubCollectionAction, {
      onAfterSuccess: () => {
        handleClose();
      },
      toastMessages: {
        error: 'Failed to update subcollection. Please try again.',
        loading: 'Updating subcollection...',
        success: 'Subcollection updated successfully!',
      },
    });

    const form = useAppForm({
      defaultValues: {
        description: subcollection.description || '',
        name: subcollection.name,
        subcollectionId: subcollection.id,
      } as UpdateSubCollectionInput,
      onSubmit: async ({ value }) => {
        await executeAsync(value);
      },
      onSubmitInvalid: ({ formApi }) => {
        focusFirstError(formApi);
      },
      validationLogic: revalidateLogic({
        mode: 'submit',
        modeAfterSubmission: 'change',
      }),
      validators: {
        onSubmit: updateSubCollectionSchema,
      },
    });

    const handleClose = () => {
      setTimeout(() => form.reset(), 300);
      onClose();
    };

    return (
      <Dialog
        onOpenChange={(open) => {
          if (open) return;
          handleClose();
        }}
        open={isOpen}
      >
        <DialogContent className={'sm:max-w-[425px]'}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            {/* Header */}
            <DialogHeader>
              <DialogTitle>Update Subcollection</DialogTitle>
              <DialogDescription>
                Update the details of your subcollection below. You can change the name and description.
              </DialogDescription>
            </DialogHeader>

            {/* Form Fields */}
            <div className={'grid gap-4 py-4'}>
              {/* Name */}
              <form.AppField name={'name'}>
                {(field) => (
                  <field.TextField isRequired label={'Name'} placeholder={'Enter subcollection name'} />
                )}
              </form.AppField>

              {/* Description */}
              <form.AppField name={'description'}>
                {(field) => (
                  <field.TextareaField
                    label={'Description'}
                    placeholder={'Enter subcollection description'}
                  />
                )}
              </form.AppField>
            </div>

            {/* Action Buttons */}
            <DialogFooter>
              <Button disabled={isExecuting} onClick={handleClose} variant={'outline'}>
                Cancel
              </Button>
              <Button disabled={isExecuting} type={'submit'}>
                {isExecuting ? 'Updating...' : 'Update Subcollection'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);
