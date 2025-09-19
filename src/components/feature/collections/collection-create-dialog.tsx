'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { useRef } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { InsertCollectionInput } from '@/lib/validations/collections.validation';
import type { ComponentTestIdProps } from '@/lib/test-ids';

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
import { createCollectionAction } from '@/lib/actions/collections/collections.actions';
import { DEFAULTS } from '@/lib/constants';
import { generateTestId } from '@/lib/test-ids';
import { insertCollectionSchema } from '@/lib/validations/collections.validation';

interface CollectionCreateDialogProps extends ComponentTestIdProps {
  isOpen: boolean;
  onClose: () => void;
  onCollectionCreated?: (collection: ComboboxItem) => void;
}

export const CollectionCreateDialog = withFocusManagement(
  ({ isOpen, onClose, onCollectionCreated, testId }: CollectionCreateDialogProps) => {
    // Generate testids for components
    const dialogTestId = testId || generateTestId('feature', 'collection-create-dialog');
    const formTestId = generateTestId('feature', 'collection-create-form');
    const cancelButtonTestId = generateTestId('feature', 'collection-create-cancel');
    const submitButtonTestId = generateTestId('feature', 'collection-create-submit');

    const { focusFirstError } = useFocusContext();

    const { executeAsync, isExecuting } = useServerAction(createCollectionAction, {
      onSuccess: ({ data }) => {
        onCollectionCreated?.({
          id: data.data.id,
          name: data.data.name,
        });
        handleClose();
      },
      toastMessages: {
        error: 'Failed to create collection. Please try again.',
        loading: 'Creating collection...',
        success: 'Collection created successfully!',
      },
    });

    const form = useAppForm({
      canSubmitWhenInvalid: true,
      defaultValues: {
        description: '',
        isPublic: DEFAULTS.COLLECTION.IS_PUBLIC,
        name: '',
      } as InsertCollectionInput,
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
        onSubmit: insertCollectionSchema,
      },
    });

    const handleOpenChange = (isOpen: boolean) => {
      if (isOpen) return;
      handleClose();
    };

    const handleClose = () => {
      setTimeout(() => form.reset(), 300);
      onClose();
    };

    const nameRef = useRef<HTMLInputElement>(null);

    return (
      <Dialog onOpenChange={handleOpenChange} open={isOpen}>
        <DialogContent className={'sm:max-w-[425px]'} testId={dialogTestId}>
          <form
            data-testid={formTestId}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            {/* Header */}
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Add a new collection to organize your bobbleheads. You can edit these details later.
              </DialogDescription>
            </DialogHeader>

            {/* Form Fields */}
            <div className={'grid gap-4 py-4'}>
              {/* Name */}
              <form.AppField name={'name'}>
                {(field) => (
                  <field.TextField
                    focusRef={nameRef}
                    isRequired
                    label={'Name'}
                    placeholder={'Enter collection name'}
                  />
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
              <Button disabled={isExecuting} onClick={handleClose} testId={cancelButtonTestId} variant={'outline'}>
                Cancel
              </Button>
              <Button disabled={isExecuting} testId={submitButtonTestId} type={'submit'}>
                {isExecuting ? 'Creating...' : 'Create Collection'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);
