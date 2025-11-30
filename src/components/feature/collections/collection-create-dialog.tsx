'use client';

import { useAuth } from '@clerk/nextjs';
import { revalidateLogic } from '@tanstack/form-core';
import { useStore } from '@tanstack/react-form';
import { useRef, useState } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { InsertCollectionInput } from '@/lib/validations/collections.validation';

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
import { createCollectionAction } from '@/lib/actions/collections/collections.actions';
import { DEFAULTS } from '@/lib/constants';
import { CloudinaryPathBuilder } from '@/lib/constants/cloudinary-paths';
import { generateTestId } from '@/lib/test-ids';
import { insertCollectionSchema } from '@/lib/validations/collections.validation';

interface CollectionCreateDialogProps extends ComponentTestIdProps {
  isOpen: boolean;
  onClose: () => void;
  onCollectionCreated?: (collection: ComboboxItem) => void;
}

export const CollectionCreateDialog = withFocusManagement(
  ({ isOpen, onClose, onCollectionCreated, testId }: CollectionCreateDialogProps) => {
    const [coverImageUrl, setCoverImageUrl] = useState<string>();

    const nameRef = useRef<HTMLInputElement>(null);

    const { focusFirstError } = useFocusContext();
    const { userId } = useAuth();

    const { trackCancel, trackConfirm, trackedOnOpenChange } = useDialogTracking({
      dialogName: 'collection-create-dialog',
    });

    const { executeAsync } = useServerAction(createCollectionAction, {
      breadcrumbContext: {
        action: 'create-collection',
        component: 'CollectionCreateDialog',
      },
      loadingMessage: 'Creating collection...',
      onAfterSuccess: (data) => {
        onCollectionCreated?.({
          id: data.id,
          name: data.name,
        });
        handleClose();
      },
    });

    const form = useAppForm({
      canSubmitWhenInvalid: true,
      defaultValues: {
        coverImageUrl: undefined,
        description: '',
        isPublic: DEFAULTS.COLLECTION.IS_PUBLIC,
        name: '',
      } as InsertCollectionInput,
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
        onSubmit: insertCollectionSchema,
      },
    });

    const [isSubmitting] = useStore(form.store, (state) => [state.isSubmitting]);

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

    const dialogTestId = testId || generateTestId('feature', 'collection-create-dialog');
    const formTestId = generateTestId('feature', 'collection-create-form');
    const cancelButtonTestId = generateTestId('feature', 'collection-create-cancel');
    const submitButtonTestId = generateTestId('feature', 'collection-create-submit');

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
                <div className={'space-y-2'}>
                  <Label>Cover Photo (Optional)</Label>
                  <CloudinaryCoverUpload
                    currentImageUrl={coverImageUrl}
                    isDisabled={isSubmitting}
                    onRemove={handleRemoveCover}
                    onUploadComplete={handleUploadComplete}
                    uploadFolder={CloudinaryPathBuilder.tempPath(userId!)}
                  />
                </div>

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
              <DialogFooter>
                <Button
                  disabled={isSubmitting}
                  onClick={handleCancelClick}
                  testId={cancelButtonTestId}
                  variant={'outline'}
                >
                  Cancel
                </Button>
                <form.SubmitButton testId={submitButtonTestId}>
                  {isSubmitting ? 'Creating...' : 'Create Collection'}
                </form.SubmitButton>
              </DialogFooter>
            </form.AppForm>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);
