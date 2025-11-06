'use client';

import { useAuth } from '@clerk/nextjs';
import { revalidateLogic } from '@tanstack/form-core';
import { useState } from 'react';

import type { UpdateSubCollectionInput } from '@/lib/validations/subcollections.validation';

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
import { updateSubCollectionAction } from '@/lib/actions/collections/subcollections.actions';
import { CloudinaryPathBuilder } from '@/lib/constants/cloudinary-paths';
import { updateSubCollectionSchema } from '@/lib/validations/subcollections.validation';

interface SubcollectionEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subcollection: {
    coverImageUrl?: null | string;
    description: null | string;
    id: string;
    name: string;
  };
}

export const SubcollectionEditDialog = withFocusManagement(
  ({ isOpen, onClose, subcollection }: SubcollectionEditDialogProps) => {
    // useState hooks
    const [coverImageUrl, setCoverImageUrl] = useState<null | string | undefined>(
      subcollection.coverImageUrl,
    );

    const { focusFirstError } = useFocusContext();
    const { userId } = useAuth();

    const { executeAsync, isExecuting } = useServerAction(updateSubCollectionAction, {
      onAfterSuccess: () => {
        handleClose();
      },
      toastMessages: {
        error: 'Failed to update subcollection. Please try again.',
        loading: 'Updating subcollection...',
        success: 'Subcollection updated successfully!',
      },
    });

    const form = useAppForm({
      defaultValues: {
        coverImageUrl: subcollection.coverImageUrl || undefined,
        description: subcollection.description || '',
        name: subcollection.name,
        subcollectionId: subcollection.id,
      } as UpdateSubCollectionInput,
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
        onSubmit: updateSubCollectionSchema,
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
              <DialogTitle>Update Subcollection</DialogTitle>
              <DialogDescription>
                Update the details of your subcollection below. You can change the name and description.
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
                    currentImageUrl={coverImageUrl || undefined}
                    isDisabled={isExecuting}
                    onRemove={handleRemoveCover}
                    onUploadComplete={handleUploadComplete}
                    uploadFolder={CloudinaryPathBuilder.tempPath(userId)}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <DialogFooter>
              <Button disabled={isExecuting} onClick={handleClose} variant={'outline'}>
                Cancel
              </Button>
              <Button disabled={isExecuting} type={'submit'}>
                {isExecuting ? 'Updating...' : 'Update Subcollection'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);
