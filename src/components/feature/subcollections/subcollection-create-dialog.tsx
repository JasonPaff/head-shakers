'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { InsertSubCollectionInput } from '@/lib/validations/collections.validation';

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
import { createSubCollectionAction } from '@/lib/actions/collections.actions';
import { DEFAULTS } from '@/lib/constants';
import { insertSubCollectionSchema } from '@/lib/validations/collections.validation';

interface SubcollectionCreateDialogProps {
  collectionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubCollectionCreated?: (subCollection: ComboboxItem) => void;
}

export const SubcollectionCreateDialog = ({
  collectionId,
  isOpen,
  onClose,
  onSubCollectionCreated,
}: SubcollectionCreateDialogProps) => {
  const { executeAsync, isExecuting } = useAction(createSubCollectionAction, {
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to create subcollection');
    },
    onSuccess: ({ data }) => {
      if (!data) return;
      toast.success('Subcollection created successfully!');
      onSubCollectionCreated?.({
        id: data.data!.id,
        name: data.data!.name,
      });
      handleClose();
    },
  });

  const form = useAppForm({
    defaultValues: {
      collectionId,
      description: '',
      isPublic: DEFAULTS.SUB_COLLECTION.IS_PUBLIC,
      name: '',
      sortOrder: DEFAULTS.SUB_COLLECTION.SORT_ORDER,
    } as InsertSubCollectionInput,
    onSubmit: async ({ value }) => {
      await executeAsync(value);
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: {
      onSubmit: insertSubCollectionSchema,
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

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
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
            <DialogTitle>Create New Subcollection</DialogTitle>
            <DialogDescription>
              Add a new subcollection to organize items within this collection. You can edit these details
              later.
            </DialogDescription>
          </DialogHeader>

          {/* Form Fields */}
          <div className={'grid gap-4 py-4'}>
            {/* Name */}
            <form.AppField name={'name'}>
              {(field) => <field.TextField isRequired label={'Name'} placeholder={'Enter collection name'} />}
            </form.AppField>

            {/* Description */}
            <form.AppField name={'description'}>
              {(field) => (
                <field.TextareaField label={'Description'} placeholder={'Enter collection description'} />
              )}
            </form.AppField>

            {/* Visibility */}
            <form.AppField name={'isPublic'}>
              {(field) => <field.SwitchField label={'Public Subcollection'} />}
            </form.AppField>
          </div>

          {/* Action Buttons */}
          <DialogFooter>
            <Button disabled={isExecuting} onClick={handleClose} variant={'outline'}>
              Cancel
            </Button>
            <Button disabled={isExecuting} type={'submit'}>
              {isExecuting ? 'Creating...' : 'Create Subcollection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
