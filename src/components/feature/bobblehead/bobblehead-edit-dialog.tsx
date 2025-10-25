'use client';

import type { z } from 'zod';

import { revalidateLogic } from '@tanstack/form-core';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';

import { AcquisitionDetails } from '@/app/(app)/bobbleheads/add/components/acquisition-details';
import { BasicInformation } from '@/app/(app)/bobbleheads/add/components/basic-information';
import { CollectionAssignment } from '@/app/(app)/bobbleheads/add/components/collection-assignment';
import { CustomFields } from '@/app/(app)/bobbleheads/add/components/custom-fields';
import { ItemPhotos } from '@/app/(app)/bobbleheads/add/components/item-photos';
import { ItemSettings } from '@/app/(app)/bobbleheads/add/components/item-settings';
import { ItemTags } from '@/app/(app)/bobbleheads/add/components/item-tags';
import { PhysicalAttributes } from '@/app/(app)/bobbleheads/add/components/physical-attributes';
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
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useServerAction } from '@/hooks/use-server-action';
import { updateBobbleheadWithPhotosAction } from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { DEFAULTS } from '@/lib/constants';
import { updateBobbleheadWithPhotosSchema } from '@/lib/validations/bobbleheads.validation';

interface BobbleheadEditDialogProps {
  bobblehead: BobbleheadForEdit;
  collections: Array<ComboboxItem>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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

export const BobbleheadEditDialog = withFocusManagement(
  ({ bobblehead, collections, isOpen, onClose, onSuccess }: BobbleheadEditDialogProps) => {
    const { focusFirstError } = useFocusContext();

    const { executeAsync, isExecuting } = useServerAction(updateBobbleheadWithPhotosAction, {
      onAfterSuccess: () => {
        handleClose();
        onSuccess?.();
      },
      toastMessages: {
        error: 'Failed to update bobblehead. Please try again.',
        loading: 'Updating bobblehead...',
        success: 'Bobblehead updated successfully! 🎉',
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
        mode: 'blur',
        modeAfterSubmission: 'change',
      }),
      validators: {
        onSubmit: updateBobbleheadWithPhotosSchema,
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
        <DialogContent className={'max-h-[90vh] sm:max-w-[700px]'}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            {/* Header */}
            <DialogHeader>
              <DialogTitle>Edit Bobblehead Details</DialogTitle>
              <DialogDescription>
                Update the details of your bobblehead below. Add photos, update information, and manage tags.
              </DialogDescription>
            </DialogHeader>

            {/* Form Fields - Scrollable */}
            <ScrollArea className={'max-h-[calc(90vh-200px)] pr-4'}>
              <div className={'space-y-6 py-4'}>
                {/* Basic Information */}
                <BasicInformation form={form as never} />

                {/* Collection Assignment */}
                <CollectionAssignment collections={collections} form={form as never} />

                {/* Photos */}
                <ItemPhotos form={form as never} />

                {/* Physical Attributes */}
                <PhysicalAttributes form={form as never} />

                {/* Acquisition Details */}
                <AcquisitionDetails form={form as never} />

                {/* Tags */}
                <ItemTags form={form as never} />

                {/* Custom Fields */}
                <CustomFields form={form as never} />

                {/* Settings */}
                <ItemSettings form={form as never} />
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <DialogFooter>
              <Button disabled={isExecuting} onClick={handleClose} type={'button'} variant={'outline'}>
                Cancel
              </Button>
              <Button disabled={isExecuting} type={'submit'}>
                {isExecuting ? 'Updating...' : 'Update Bobblehead'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);
