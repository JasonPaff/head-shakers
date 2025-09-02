'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { useAction } from 'next-safe-action/hooks';
import { $path } from 'next-typesafe-url';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';

import { AcquisitionDetails } from '@/app/(app)/items/add/components/acquisition-details';
import { addItemFormOptions } from '@/app/(app)/items/add/components/add-item-form-options';
import { BasicInformation } from '@/app/(app)/items/add/components/basic-information';
import { CollectionAssignment } from '@/app/(app)/items/add/components/collection-assignment';
import { CustomFields } from '@/app/(app)/items/add/components/custom-fields';
import { ItemPhotos } from '@/app/(app)/items/add/components/item-photos';
import { ItemSettings } from '@/app/(app)/items/add/components/item-settings';
import { ItemTags } from '@/app/(app)/items/add/components/item-tags';
import { PhysicalAttributes } from '@/app/(app)/items/add/components/physical-attributes';
import { Button } from '@/components/ui/button';
import { useAppForm } from '@/components/ui/form';
import { createBobbleheadWithPhotosAction } from '@/lib/actions/bobbleheads-with-photos.actions';
import { createBobbleheadWithPhotosSchema } from '@/lib/validations/bobbleheads.validation';

interface AddItemFormClientProps {
  collections: Array<ComboboxItem>;
}

export const AddItemFormClient = ({ collections }: AddItemFormClientProps) => {
  const router = useRouter();

  const { executeAsync, isExecuting } = useAction(createBobbleheadWithPhotosAction, {
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to create bobblehead');
    },
    onSuccess: ({ input }) => {
      toast.success('Bobblehead created successfully!');
      router.push(
        $path({ route: '/collections/[collectionId]', routeParams: { collectionId: input.collectionId } }),
        { scroll: true },
      );
    },
  });

  const form = useAppForm({
    ...addItemFormOptions,
    onSubmit: async ({ value }) => {
      await executeAsync(value);
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
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
