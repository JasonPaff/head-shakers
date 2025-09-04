'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

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
import { updateCollectionAction } from '@/lib/actions/collections.actions';
import { updateCollectionSchema } from '@/lib/validations/collections.validation';

interface CollectionEditDialogProps {
  collectionId: string;
  description: null | string;
  isOpen: boolean;
  isPublic: boolean;
  name: string;
  onClose: () => void;
}

export const CollectionEditDialog = ({
  collectionId,
  description,
  isOpen,
  isPublic,
  name,
  onClose,
}: CollectionEditDialogProps) => {
  const { executeAsync, isExecuting } = useAction(updateCollectionAction, {
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update collection');
    },
    onSuccess: ({ data }) => {
      if (!data) return;
      toast.success('Collection updated successfully!');
      handleClose();
    },
  });

  const form = useAppForm({
    defaultValues: {
      collectionId,
      description,
      isPublic,
      name,
    } as UpdateCollectionInput,
    onSubmit: async ({ value }) => {
      await executeAsync(value);
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
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Update the details of your collection below. You can change the name, description, and
              visibility.
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
              {isExecuting ? 'Updating...' : 'Update Collection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
