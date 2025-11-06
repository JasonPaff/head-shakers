'use client';

import { useAuth } from '@clerk/nextjs';
import { revalidateLogic } from '@tanstack/form-core';
import { useState } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { InsertSubCollectionInput } from '@/lib/validations/subcollections.validation';

import { Button } from '@/components/ui/button';
import { CloudinaryCoverUpload } from '@/components/ui/cloudinary-cover-upload';
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
import { Label } from '@/components/ui/label';
import { useServerAction } from '@/hooks/use-server-action';
import { createSubCollectionAction } from '@/lib/actions/collections/subcollections.actions';
import { DEFAULTS } from '@/lib/constants';
import { CloudinaryPathBuilder } from '@/lib/constants/cloudinary-paths';
import { insertSubCollectionSchema } from '@/lib/validations/subcollections.validation';

interface SubcollectionCreateDialogProps {
  collectionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubCollectionCreated?: (subCollection: ComboboxItem) => void;
}

export const SubcollectionCreateDialog = withFocusManagement(
  ({ collectionId, isOpen, onClose, onSubCollectionCreated }: SubcollectionCreateDialogProps) => {
    // useState hooks
    const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined);

    const { focusFirstError } = useFocusContext();
    const { userId } = useAuth();

    const { executeAsync, isExecuting } = useServerAction(createSubCollectionAction, {
      onSuccess: ({ data }) => {
        onSubCollectionCreated?.({
          id: data.data.id,
          name: data.data.name,
        });
        handleClose();
      },
      toastMessages: {
        error: 'Failed to create subcollection. Please try again.',
        loading: 'Creating subcollection...',
        success: 'Subcollection created successfully!',
      },
    });

    const form = useAppForm({
      defaultValues: {
        collectionId,
        coverImageUrl: undefined,
        description: '',
        isPublic: DEFAULTS.SUB_COLLECTION.IS_PUBLIC,
        name: '',
        sortOrder: DEFAULTS.SUB_COLLECTION.SORT_ORDER,
      } as InsertSubCollectionInput,
      onSubmit: async ({ value }) => {
        await executeAsync({ ...value, coverImageUrl });
      },
      onSubmitInvalid: ({ formApi }) => {
        focusFirstError(formApi);
      },
      validationLogic: revalidateLogic({
        mode: 'submit',
        modeAfterSubmission: 'change',
      }),
      validators: {
        onSubmit: insertSubCollectionSchema,
      },
    });

    // Event handlers
    const handleOpenChange = (isOpen: boolean) => {
      if (isOpen) return;
      handleClose();
    };

    const handleClose = () => {
      setTimeout(() => {
        form.reset();
        setCoverImageUrl(undefined);
      }, 300);
      onClose();
    };

    const handleUploadComplete = (_publicId: string, secureUrl: string) => {
      setCoverImageUrl(secureUrl);
    };

    const handleRemoveCover = () => {
      setCoverImageUrl(undefined);
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

              {/* Cover Photo */}
              {userId && (
                <div className={'space-y-2'}>
                  <Label>Cover Photo (Optional)</Label>
                  <CloudinaryCoverUpload
                    currentImageUrl={coverImageUrl}
                    isDisabled={isExecuting}
                    onRemove={handleRemoveCover}
                    onUploadComplete={handleUploadComplete}
                    uploadFolder={CloudinaryPathBuilder.tempPath(userId)}
                  />
                </div>
              )}

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
  },
);
