'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { InsertCollectionInput } from '@/lib/validations/collections.validation';

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
import { createCollectionAction } from '@/lib/actions/collections.actions';
import { DEFAULTS } from '@/lib/constants';
import { insertCollectionSchema } from '@/lib/validations/collections.validation';

interface CollectionCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCollectionCreated?: (collection: ComboboxItem) => void;
}

export const CollectionCreateDialog = ({
  isOpen,
  onClose,
  onCollectionCreated,
}: CollectionCreateDialogProps) => {
  const { executeAsync, isExecuting } = useAction(createCollectionAction, {
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to create collection');
    },
    onSuccess: ({ data }) => {
      if (!data) return;
      toast.success('Collection created successfully!');
      onCollectionCreated?.({
        id: data.data!.id,
        name: data.data!.name,
      });
      handleClose();
    },
  });

  const form = useAppForm({
    defaultValues: {
      description: '',
      isPublic: DEFAULTS.COLLECTION.IS_PUBLIC,
      name: '',
    } as InsertCollectionInput,
    onSubmit: async ({ value }) => {
      await executeAsync(value);
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
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Add a new collection to organize your bobbleheads. You can edit these details later.
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
              {(field) => <field.SwitchField label={'Public Collection'} />}
            </form.AppField>
          </div>

          {/* Action Buttons */}
          <DialogFooter>
            <Button disabled={isExecuting} onClick={handleClose} variant={'outline'}>
              Cancel
            </Button>
            <Button disabled={isExecuting} type={'submit'}>
              {isExecuting ? 'Creating...' : 'Create Collection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
