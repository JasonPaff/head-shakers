'use client';

import type { z } from 'zod';

import * as Sentry from '@sentry/nextjs';
import { revalidateLogic } from '@tanstack/form-core';
import { type AnyFormApi, useStore } from '@tanstack/react-form';
import { CameraIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { bobbleheadPhotos } from '@/lib/db/schema';
import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { CloudinaryPhoto } from '@/types/cloudinary.types';

interface BobbleheadEditDialogProps extends ComponentTestIdProps {
  bobblehead: BobbleheadForEdit;
  collections: Array<ComboboxItem>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

import { AcquisitionDetails } from '@/app/(app)/bobbleheads/add/components/acquisition-details';
import { AnimatedMotivationalMessage } from '@/app/(app)/bobbleheads/add/components/animated-motivational-message';
import { BasicInformation } from '@/app/(app)/bobbleheads/add/components/basic-information';
import { CollectionAssignment } from '@/app/(app)/bobbleheads/add/components/collection-assignment';
import { CustomFields } from '@/app/(app)/bobbleheads/add/components/custom-fields';
import { ItemSettings } from '@/app/(app)/bobbleheads/add/components/item-settings';
import { ItemTags } from '@/app/(app)/bobbleheads/add/components/item-tags';
import { PhysicalAttributes } from '@/app/(app)/bobbleheads/add/components/physical-attributes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudinaryPhotoUpload } from '@/components/ui/cloudinary-photo-upload';
import { Conditional } from '@/components/ui/conditional';
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
import {
  getBobbleheadPhotosAction,
  updateBobbleheadWithPhotosAction,
} from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { DEFAULTS } from '@/lib/constants';
import { generateTestId } from '@/lib/test-ids';
import {
  extractFormatFromCloudinaryUrl,
  extractPublicIdFromCloudinaryUrl,
} from '@/lib/utils/cloudinary.utils';
import { updateBobbleheadWithPhotosSchema } from '@/lib/validations/bobbleheads.validation';

interface BobbleheadForEdit {
  acquisitionDate: Date | null;
  acquisitionMethod: null | string;
  category: null | string;
  characterName: null | string;
  collectionId: string;
  currentCondition: null | string;
  customFields: Array<Record<string, string>> | null;
  description: null | string;
  height: null | number;
  id: string;
  isFeatured: boolean;
  isPublic: boolean;
  manufacturer: null | string;
  material: null | string;
  name: null | string;
  purchaseLocation: null | string;
  purchasePrice: null | number;
  series: null | string;
  status: null | string;
  subcollectionId: null | string;
  tags?: Array<{ id: string; name: string }>;
  weight: null | number;
  year: null | number;
}

type BobbleheadPhoto = typeof bobbleheadPhotos.$inferSelect;

// Custom ItemPhotos component for editing with bobblehead support
interface ItemPhotosEditProps {
  bobbleheadId: string;
  form: AnyFormApi;
}

function ItemPhotosEditComponent({ bobbleheadId, form }: ItemPhotosEditProps) {
  const photos =
    (useStore(form.store, (state) => (state.values as { photos?: Array<CloudinaryPhoto> }).photos)) || [];

  const handlePhotosChange = (
    updatedPhotos: ((prevPhotos: Array<CloudinaryPhoto>) => Array<CloudinaryPhoto>) | Array<CloudinaryPhoto>,
  ) => {
    if (typeof updatedPhotos === 'function') {
      const currentPhotos = (form.getFieldValue('photos') as Array<CloudinaryPhoto>) || [];
      form.setFieldValue('photos', updatedPhotos(currentPhotos));
    } else {
      form.setFieldValue('photos', updatedPhotos);
    }
  };

  const shouldShowMessage = photos.length > 0;

  return (
    <Card aria-labelledby={'photos-section-title'} role={'region'}>
      <CardHeader className={'relative'}>
        <div className={'flex items-center gap-3'}>
          <div className={'flex size-10 items-center justify-center rounded-xl bg-green-500 shadow-sm'}>
            <CameraIcon aria-hidden className={'size-5 text-white'} />
          </div>
          <div>
            <CardTitle className={'text-xl font-semibold text-foreground'}>Photos</CardTitle>
            <CardDescription className={'text-muted-foreground'}>
              Manage your bobblehead photos - delete, reorder, or add new ones
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className={'relative space-y-6'} role={'main'}>
        <div aria-label={'Photo upload area'} className={'relative'} role={'region'}>
          <CloudinaryPhotoUpload
            bobbleheadId={bobbleheadId}
            maxPhotos={8}
            onPhotosChange={handlePhotosChange}
            photos={photos}
          />
        </div>

        <AnimatedMotivationalMessage className={'bg-green-100 dark:bg-green-900/40'} shouldShow={shouldShowMessage}>
          <div className={'flex items-center gap-2 text-sm text-green-700 dark:text-green-300'}>
            <div className={'size-2 rounded-full bg-green-500'} />
            <Conditional fallback={`${photos.length}/8 photos - drag to reorder`} isCondition={photos.length === 0}>
              <span>Add photos to make your bobblehead stand out!</span>
            </Conditional>
          </div>
        </AnimatedMotivationalMessage>
      </CardContent>
    </Card>
  );
}

export const BobbleheadEditDialog = withFocusManagement(
  ({ bobblehead, collections, isOpen, onClose, onSuccess, testId }: BobbleheadEditDialogProps) => {
    const dialogTestId = testId || generateTestId('feature', 'bobblehead-edit-dialog');
    const formTestId = generateTestId('feature', 'bobblehead-edit-form');
    const cancelButtonTestId = generateTestId('feature', 'bobblehead-edit-cancel');
    const submitButtonTestId = generateTestId('feature', 'bobblehead-edit-submit');

    const router = useRouter();
    const { focusFirstError } = useFocusContext();

    const [, setIsLoadingPhotos] = useState(false);
    const photosFetchedRef = useRef(false);

    const { executeAsync, isExecuting } = useServerAction(updateBobbleheadWithPhotosAction, {
      onAfterSuccess: () => {
        router.refresh();
        handleClose();
        onSuccess?.();
      },
      toastMessages: {
        error: 'Failed to update bobblehead. Please try again.',
        loading: 'Updating bobblehead...',
        success: 'Bobblehead updated successfully!',
      },
    });

    const form = useAppForm({
      canSubmitWhenInvalid: true,
      defaultValues: {
        acquisitionDate:
          bobblehead.acquisitionDate ? new Date(bobblehead.acquisitionDate).toISOString().split('T')[0] : '',
        acquisitionMethod: bobblehead.acquisitionMethod || '',
        category: bobblehead.category || '',
        characterName: bobblehead.characterName || '',
        collectionId: bobblehead.collectionId,
        currentCondition: bobblehead.currentCondition || DEFAULTS.BOBBLEHEAD.CONDITION,
        customFields: bobblehead.customFields || [],
        description: bobblehead.description || '',
        height: bobblehead.height?.toString() || '',
        id: bobblehead.id,
        isFeatured: bobblehead.isFeatured,
        isPublic: bobblehead.isPublic,
        manufacturer: bobblehead.manufacturer || '',
        material: bobblehead.material || '',
        name: bobblehead.name || '',
        photos: [],
        purchaseLocation: bobblehead.purchaseLocation || '',
        purchasePrice: bobblehead.purchasePrice?.toString() || '',
        series: bobblehead.series || '',
        status: bobblehead.status || DEFAULTS.BOBBLEHEAD.STATUS,
        subcollectionId: bobblehead.subcollectionId || '',
        tags: bobblehead.tags?.map((tag) => tag.name) || [],
        weight: bobblehead.weight?.toString() || '',
        year: bobblehead.year?.toString() || '',
      } as z.input<typeof updateBobbleheadWithPhotosSchema>,
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
        onSubmit: updateBobbleheadWithPhotosSchema,
      },
    });

    const handleClose = () => {
      photosFetchedRef.current = false;
      setTimeout(() => form.reset(), 300);
      onClose();
    };

    // fetch existing photos when dialog opens
    useEffect(() => {
      if (!isOpen || !bobblehead.id || photosFetchedRef.current) return;

      const fetchPhotos = async () => {
        photosFetchedRef.current = true;
        setIsLoadingPhotos(true);
        try {
          const result = await getBobbleheadPhotosAction({ bobbleheadId: bobblehead.id });

          if (result?.data && Array.isArray(result.data)) {
            // transform database photos to CloudinaryPhoto format
            const transformedPhotos: Array<CloudinaryPhoto> = (result.data as Array<BobbleheadPhoto>).map(
              (photo) => {
                const publicId = extractPublicIdFromCloudinaryUrl(photo.url);
                const format = extractFormatFromCloudinaryUrl(photo.url);

                return {
                  altText: photo.altText || '',
                  bytes: photo.fileSize || 0,
                  caption: photo.caption || '',
                  format: format as 'heic' | 'jpeg' | 'jpg' | 'png' | 'webp',
                  height: photo.height || 0,
                  id: photo.id,
                  isPrimary: photo.isPrimary,
                  originalFilename: '',
                  publicId: publicId || photo.url,
                  sortOrder: photo.sortOrder,
                  uploadedAt: photo.uploadedAt.toISOString(),
                  url: photo.url,
                  width: photo.width || 0,
                };
              },
            );

            // update form field with existing photos
            form.setFieldValue('photos', transformedPhotos);
          }
        } catch (error) {
          Sentry.captureException(error, {
            extra: { bobbleheadId: bobblehead.id, operation: 'fetch-photos' },
            level: 'error',
          });
        } finally {
          setIsLoadingPhotos(false);
        }
      };

      void fetchPhotos();
    }, [isOpen, bobblehead.id, form]);

    return (
      <Dialog
        onOpenChange={(open) => {
          if (open) return;
          handleClose();
        }}
        open={isOpen}
      >
        <DialogContent
          className={'flex max-h-[90vh] !grid-cols-1 flex-col overflow-hidden sm:max-w-[700px]'}
          testId={dialogTestId}
        >
          {/* Header */}
          <DialogHeader className={'shrink-0'}>
            <DialogTitle>Edit Bobblehead Details</DialogTitle>
            <DialogDescription>
              Update the details of your bobblehead below. Add photos, update information, and manage tags.
            </DialogDescription>
          </DialogHeader>

          {/* Form Fields - Scrollable */}
          <div className={'min-h-0 flex-1 overflow-y-auto pr-4'}>
            <form
              className={'space-y-6 py-4'}
              data-testid={formTestId}
              id={'edit-bobblehead-form'}
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
            >
              {/*
                Note: Form sections are typed for addItemFormOptions but work with updateBobbleheadWithPhotosSchema
                because both schemas have compatible field structures. Using 'as never' to bypass the type check
                since the forms are structurally compatible at runtime.
              */}
              <BasicInformation form={form as never} />
              <CollectionAssignment collections={collections} form={form as never} />
              <ItemPhotosEditComponent bobbleheadId={bobblehead.id} form={form} />
              <PhysicalAttributes form={form as never} />
              <AcquisitionDetails form={form as never} />
              <ItemTags form={form as never} />
              <CustomFields form={form as never} />
              <ItemSettings form={form as never} />
            </form>
          </div>

          {/* Action Buttons */}
          <DialogFooter className={'shrink-0'}>
            <Button
              disabled={isExecuting}
              onClick={handleClose}
              testId={cancelButtonTestId}
              type={'button'}
              variant={'outline'}
            >
              Cancel
            </Button>
            <Button
              disabled={isExecuting}
              form={'edit-bobblehead-form'}
              testId={submitButtonTestId}
              type={'submit'}
            >
              {isExecuting ? 'Updating...' : 'Update Bobblehead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
