'use client';

import { useAuth } from '@clerk/nextjs';
import { revalidateLogic } from '@tanstack/form-core';
import { useStore } from '@tanstack/react-form';
import { useRef, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { UpdateCollectionInput } from '@/lib/validations/collections.validation';

import { CollectionDelete } from '@/components/feature/collections/collection-delete';
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
import { useDialogTracking } from '@/hooks/use-dialog-tracking';
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
    const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(
      collection.coverImageUrl ?? undefined,
    );

    const nameRef = useRef<HTMLInputElement>(null);

    const { focusFirstError } = useFocusContext();
    const { userId } = useAuth();

    const { trackCancel, trackConfirm, trackedOnOpenChange } = useDialogTracking({
      dialogName: 'collection-edit-dialog',
    });

    const { executeAsync } = useServerAction(updateCollectionAction, {
      breadcrumbContext: {
        action: 'update-collection',
        component: 'CollectionEditDialog',
      },
      loadingMessage: 'Updating collection...',
      onAfterSuccess: () => {
        handleClose();
      },
    });

    const form = useAppForm({
      canSubmitWhenInvalid: true,
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

    const [isSubmitting] = useStore(form.store, (state) => [state.isSubmitting]);

    const handleClose = () => {
      setTimeout(() => form.reset(), 300);
      onClose();
    };

    const handleOpenChange = (open: boolean) => {
      if (open) return;
      handleClose();
    };

    const handleCancelClick = () => {
      trackCancel();
      handleClose();
    };

    const handleUploadComplete = (_publicId: string, secureUrl: string) => {
      setCoverImageUrl(secureUrl);
    };

    const handleRemoveCover = () => {
      setCoverImageUrl(undefined);
    };

    const dialogTestId = testId || generateTestId('feature', 'collection-edit-dialog');
    const formTestId = generateTestId('feature', 'collection-edit-form');
    const cancelButtonTestId = generateTestId('feature', 'collection-edit-cancel');
    const submitButtonTestId = generateTestId('feature', 'collection-edit-submit');
    const deleteButtonTestId = generateTestId('feature', 'collection-edit-delete');

    return (
      <Dialog onOpenChange={trackedOnOpenChange(handleOpenChange)} open={isOpen}>
        <DialogContent className={'sm:max-w-md'} testId={dialogTestId}>
          <form
            data-testid={formTestId}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              trackConfirm();
              void form.handleSubmit();
            }}
          >
            <form.AppForm>
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
                    <field.TextField
                      focusRef={nameRef}
                      isRequired
                      label={'Name'}
                      placeholder={'Enter collection name'}
                      testId={`${dialogTestId}-name-field`}
                    />
                  )}
                </form.AppField>

                {/* Description */}
                <form.AppField name={'description'}>
                  {(field) => (
                    <field.TextareaField
                      label={'Description'}
                      placeholder={'Enter collection description'}
                      testId={`${dialogTestId}-description-field`}
                    />
                  )}
                </form.AppField>

                {/* Cover Photo */}
                {userId && (
                  <div className={'space-y-2'}>
                    <Label>Cover Photo (Optional)</Label>
                    <CloudinaryCoverUpload
                      currentImageUrl={coverImageUrl}
                      isDisabled={isSubmitting}
                      onRemove={handleRemoveCover}
                      onUploadComplete={handleUploadComplete}
                      uploadFolder={CloudinaryPathBuilder.tempPath(userId)}
                    />
                  </div>
                )}

                {/* Visibility */}
                <form.AppField name={'isPublic'}>
                  {(field) => (
                    <field.SwitchField
                      label={'Public Collection'}
                      testId={`${dialogTestId}-is-public-field`}
                    />
                  )}
                </form.AppField>
              </div>

              {/* Action Buttons */}
              <DialogFooter className={'sm:justify-between'}>
                {/* Delete */}
                <CollectionDelete
                  collectionId={collection.id}
                  collectionName={collection.name}
                  disabled={isSubmitting}
                  onSuccess={onClose}
                  testId={deleteButtonTestId}
                  variant={'ghost'}
                >
                  Delete
                </CollectionDelete>

                {/* Cancel / Submit */}
                <div className={'flex gap-2'}>
                  <Button
                    disabled={isSubmitting}
                    onClick={handleCancelClick}
                    testId={cancelButtonTestId}
                    variant={'outline'}
                  >
                    Cancel
                  </Button>
                  <form.SubmitButton testId={submitButtonTestId}>
                    {isSubmitting ? 'Updating...' : 'Update Collection'}
                  </form.SubmitButton>
                </div>
              </DialogFooter>
            </form.AppForm>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);
