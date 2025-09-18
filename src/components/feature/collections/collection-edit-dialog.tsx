'use client';

import { revalidateLogic } from '@tanstack/form-core';

import type { UpdateCollectionInput } from '@/lib/validations/collections.validation';

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
import { updateCollectionAction } from '@/lib/actions/collections/collections.actions';
import { updateCollectionSchema } from '@/lib/validations/collections.validation';

interface CollectionEditDialogProps {
  collection: CollectionForEdit;
  isOpen: boolean;
  onClose: () => void;
}

interface CollectionForEdit {
  description: null | string;
  id: string;
  isPublic: boolean;
  name: string;
}

export const CollectionEditDialog = withFocusManagement(
  ({ collection, isOpen, onClose }: CollectionEditDialogProps) => {
    const { focusFirstError } = useFocusContext();

    const { executeAsync, isExecuting } = useServerAction(updateCollectionAction, {
      onAfterSuccess: () => {
        handleClose();
      },
      toastMessages: {
        error: 'Failed to update collection. Please try again.',
        loading: 'Updating collection...',
        success: 'Collection updated successfully!',
      },
    });

    const form = useAppForm({
      defaultValues: {
        collectionId: collection.id,
        description: collection.description || '',
        isPublic: collection.isPublic,
        name: collection.name,
      } as UpdateCollectionInput,
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
        onSubmit: updateCollectionSchema,
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
              <DialogTitle>Update Existing Collection</DialogTitle>
              <DialogDescription>
                Update the details of your collection below. You can change the name, description, and
                visibility.
              </DialogDescription>
            </DialogHeader>

            {/* Form Fields */}
            <div className={'grid gap-4 py-4'}>
              {/* Name */}
              <form.AppField name={'name'}>
                {(field) => (
                  <field.TextField isRequired label={'Name'} placeholder={'Enter collection name'} />
                )}
              </form.AppField>

              {/* Description */}
              <form.AppField name={'description'}>
                {(field) => (
                  <field.TextareaField label={'Description'} placeholder={'Enter collection description'} />
                )}
              </form.AppField>

              {/* Visibility */}
              <form.AppField name={'isPublic'}>
                {(field) => <field.SwitchField label={'Public Collection'} />}
              </form.AppField>
            </div>

            {/* Action Buttons */}
            <DialogFooter>
              <Button disabled={isExecuting} onClick={handleClose} variant={'outline'}>
                Cancel
              </Button>
              <Button disabled={isExecuting} type={'submit'}>
                {isExecuting ? 'Updating...' : 'Update Collection'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);
