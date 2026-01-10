'use client';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { CollectionDelete } from '@/components/feature/collections/collection-delete';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { generateTestId } from '@/lib/test-ids';

import type { CollectionForUpsert } from './collection-upsert-dialog.types';
import type { CollectionCreatedResult } from './hooks/use-collection-upsert-form';

import { CollectionFormFields } from './collection-form-fields';
import { useCollectionUpsertForm } from './hooks/use-collection-upsert-form';

interface CollectionUpsertDialogProps extends ComponentTestIdProps {
  /**
   * When provided, dialog is in edit mode.
   * When undefined, dialog is in create mode.
   */
  collection?: CollectionForUpsert;
  isOpen: boolean;
  onClose: () => void;
  /**
   * Called on successful create (with new collection) or edit (with updated collection).
   */
  onSuccess?: (collection: CollectionCreatedResult) => void;
}

export const CollectionUpsertDialog = withFocusManagement(
  ({ collection, isOpen, onClose, onSuccess, testId }: CollectionUpsertDialogProps) => {
    const {
      coverImageUrl,
      form,
      handleRemoveCover,
      handleUploadComplete,
      isEditMode,
      isSubmitting,
      labels,
      resetForm,
    } = useCollectionUpsertForm({
      collection,
      onSuccess: (result) => {
        onSuccess?.(result);
        handleClose();
      },
    });

    const handleClose = () => {
      setTimeout(resetForm, 300);
      onClose();
    };

    const handleOpenChange = (open: boolean) => {
      if (open) return;
      handleClose();
    };

    const handleCancelClick = () => {
      handleClose();
    };

    // Test IDs
    const modePrefix = isEditMode ? 'collection-edit' : 'collection-create';
    const dialogTestId = testId || generateTestId('feature', `${modePrefix}-dialog`);
    const formTestId = generateTestId('feature', `${modePrefix}-form`);
    const cancelButtonTestId = generateTestId('feature', `${modePrefix}-cancel`);
    const submitButtonTestId = generateTestId('feature', `${modePrefix}-submit`);
    const deleteButtonTestId = generateTestId('feature', 'collection-edit-delete');

    return (
      <Dialog onOpenChange={handleOpenChange} open={isOpen}>
        <DialogContent className={'sm:max-w-md'} testId={dialogTestId}>
          <form
            data-testid={formTestId}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <form.AppForm>
              {/* Header */}
              <DialogHeader>
                <DialogTitle>{labels.title}</DialogTitle>
                <DialogDescription>{labels.description}</DialogDescription>
              </DialogHeader>

              {/* Form Fields */}
              <CollectionFormFields
                coverImageUrl={coverImageUrl}
                form={form}
                isSubmitting={isSubmitting}
                onRemoveCover={handleRemoveCover}
                onUploadComplete={handleUploadComplete}
                testIdPrefix={dialogTestId}
              />

              {/* Action Buttons */}
              <DialogFooter className={isEditMode ? 'sm:justify-between' : undefined}>
                {/* Delete Button - Edit Mode Only */}
                {isEditMode && collection && (
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
                )}

                {/* Cancel / Submit */}
                <div className={isEditMode ? 'flex gap-2' : undefined}>
                  <Button
                    disabled={isSubmitting}
                    onClick={handleCancelClick}
                    testId={cancelButtonTestId}
                    variant={'outline'}
                  >
                    Cancel
                  </Button>
                  <form.SubmitButton isDisabled={isSubmitting} testId={submitButtonTestId}>
                    {isSubmitting ? labels.submitButtonLoading : labels.submitButton}
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
