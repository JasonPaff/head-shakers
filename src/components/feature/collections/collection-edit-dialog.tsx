'use client';

import { useAuth } from '@clerk/nextjs';
import { revalidateLogic } from '@tanstack/form-core';
import { useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { UpdateCollectionInput } from '@/lib/validations/collections.validation';

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
import { updateCollectionAction } from '@/lib/actions/collections/collections.actions';
import { CloudinaryPathBuilder } from '@/lib/constants/cloudinary-paths';
import { generateTestId } from '@/lib/test-ids';
import { updateCollectionSchema } from '@/lib/validations/collections.validation';

interface CollectionEditDialogProps extends ComponentTestIdProps {
  collection: CollectionForEdit;
  isOpen: boolean;
  onClose: () => void;
}

interface CollectionForEdit {
  coverImageUrl?: null | string;
  description: null | string;
  id: string;
  isPublic: boolean;
  name: string;
}

export const CollectionEditDialog = withFocusManagement(
  ({ collection, isOpen, onClose, testId }: CollectionEditDialogProps) => {
    const dialogTestId = testId || generateTestId('feature', 'collection-edit-dialog');
    const formTestId = generateTestId('feature', 'collection-edit-form');
    const cancelButtonTestId = generateTestId('feature', 'collection-edit-cancel');
    const submitButtonTestId = generateTestId('feature', 'collection-edit-submit');

    // useState hooks
    const [coverImageUrl, setCoverImageUrl] = useState<null | string | undefined>(collection.coverImageUrl);

    const { focusFirstError } = useFocusContext();
    const { userId } = useAuth();

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
        coverImageUrl: collection.coverImageUrl || undefined,
        description: collection.description || '',
        isPublic: collection.isPublic,
        name: collection.name,
      } as UpdateCollectionInput,
      onSubmit: async ({ value }) => {
        await executeAsync({ ...value, coverImageUrl: coverImageUrl || undefined });
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

    // Event handlers
    const handleClose = () => {
      setTimeout(() => form.reset(), 300);
      onClose();
    };

    const handleUploadComplete = (_publicId: string, secureUrl: string) => {
      setCoverImageUrl(secureUrl);
    };

    const handleRemoveCover = () => {
      setCoverImageUrl(null);
    };

    return (
      <Dialog
        onOpenChange={(open) => {
          if (open) return;
          handleClose();
        }}
        open={isOpen}
      >
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

              {/* Cover Photo */}
              {userId && (
                <div className={'space-y-2'}>
                  <Label>Cover Photo (Optional)</Label>
                  <CloudinaryCoverUpload
                    currentImageUrl={coverImageUrl || undefined}
                    isDisabled={isExecuting}
                    onRemove={handleRemoveCover}
                    onUploadComplete={handleUploadComplete}
                    uploadFolder={CloudinaryPathBuilder.tempPath(userId)}
                  />
                </div>
              )}

              {/* Visibility */}
              <form.AppField name={'isPublic'}>
                {(field) => <field.SwitchField label={'Public Collection'} />}
              </form.AppField>
            </div>

            {/* Action Buttons */}
            <DialogFooter>
              <Button
                disabled={isExecuting}
                onClick={handleClose}
                testId={cancelButtonTestId}
                variant={'outline'}
              >
                Cancel
              </Button>
              <Button disabled={isExecuting} testId={submitButtonTestId} type={'submit'}>
                {isExecuting ? 'Updating...' : 'Update Collection'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);
