'use client';

import type { z } from 'zod';

import { revalidateLogic } from '@tanstack/form-core';
import { $path } from 'next-typesafe-url';
import { useRouter } from 'next/navigation';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';

import { AcquisitionDetails } from '@/app/(app)/bobbleheads/add/components/acquisition-details';
import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { BasicInformation } from '@/app/(app)/bobbleheads/add/components/basic-information';
import { CollectionAssignment } from '@/app/(app)/bobbleheads/add/components/collection-assignment';
import { CustomFields } from '@/app/(app)/bobbleheads/add/components/custom-fields';
import { ItemPhotos } from '@/app/(app)/bobbleheads/add/components/item-photos';
import { ItemSettings } from '@/app/(app)/bobbleheads/add/components/item-settings';
import { ItemTags } from '@/app/(app)/bobbleheads/add/components/item-tags';
import { PhysicalAttributes } from '@/app/(app)/bobbleheads/add/components/physical-attributes';
import { Button } from '@/components/ui/button';
import { useAppForm } from '@/components/ui/form';
import { useServerAction } from '@/hooks/use-server-action';
import { createBobbleheadWithPhotosAction } from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { createBobbleheadWithPhotosSchema } from '@/lib/validations/bobbleheads.validation';

interface AddItemFormClientProps {
  collections: Array<ComboboxItem>;
  initialCollectionId?: string;
  initialSubcollectionId?: string;
}

// TODO: local storage draft save and restore

export const AddItemFormClient = ({
  collections,
  initialCollectionId,
  initialSubcollectionId,
}: AddItemFormClientProps) => {
  const router = useRouter();

  const { executeAsync, isExecuting } = useServerAction(createBobbleheadWithPhotosAction, {
    onSuccess: ({ input }) => {
      // if there is not a subcollectionId, go back to the collection page
      if (!input.subcollectionId) {
        router.push(
          $path({ route: '/collections/[collectionId]', routeParams: { collectionId: input.collectionId } }),
        );
      }
      // if there is a subcollectionId, go to the subcollection page
      else {
        router.push(
          $path({
            route: '/collections/[collectionId]/subcollection/[subcollectionId]',
            routeParams: { collectionId: input.collectionId, subcollectionId: input.subcollectionId },
          }),
        );
      }
    },
    toastMessages: {
      error: 'Failed to add bobblehead. Please try again.',
      loading: 'Adding bobblehead...',
      success: 'Bobblehead added successfully!',
    },
  });

  const form = useAppForm({
    ...addItemFormOptions,
    defaultValues: {
      ...addItemFormOptions.defaultValues,
      collectionId: initialCollectionId || '',
      subcollectionId: initialSubcollectionId || '',
    } as z.input<typeof createBobbleheadWithPhotosSchema>,
    onSubmit: async ({ value }) => {
      await executeAsync(value);
    },
    validationLogic: revalidateLogic({
      mode: 'blur',
      modeAfterSubmission: 'change',
    }),
    validators: {
      onSubmit: createBobbleheadWithPhotosSchema,
    },
  });

  const handleCancel = () => {
    router.back();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className={'space-y-6'}>
        <CollectionAssignment collections={collections} form={form} />
        <BasicInformation form={form} />
        <AcquisitionDetails form={form} />
        <PhysicalAttributes form={form} />
        <ItemTags form={form} />
        <CustomFields form={form} />
        <ItemPhotos form={form} />
        <ItemSettings form={form} />

        {/* Action Buttons */}
        <form.AppForm>
          <div className={'flex justify-end space-x-4'}>
            <Button onClick={handleCancel} variant={'outline'}>
              Cancel
            </Button>
            <form.SubmitButton isDisabled={isExecuting}>
              {isExecuting ? 'Adding...' : 'Add Bobblehead'}
            </form.SubmitButton>
          </div>
        </form.AppForm>
      </div>
    </form>
  );
};
