'use client';

import type { z } from 'zod';

import { revalidateLogic } from '@tanstack/form-core';
import { CheckCircle2Icon } from 'lucide-react';
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
import { Conditional } from '@/components/ui/conditional';
import { useAppForm } from '@/components/ui/form';
import { FocusProvider, useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { useServerAction } from '@/hooks/use-server-action';
import { createBobbleheadWithPhotosAction } from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { createBobbleheadWithPhotosSchema } from '@/lib/validations/bobbleheads.validation';

interface AddItemFormClientProps {
  collections: Array<ComboboxItem>;
  initialCollectionId?: string;
  initialSubcollectionId?: string;
}

type AddItemFormContentProps = AddItemFormClientProps;

const AddItemFormContent = ({
  collections,
  initialCollectionId,
  initialSubcollectionId,
}: AddItemFormContentProps) => {
  const router = useRouter();
  const { focusFirstError } = useFocusContext();

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
      loading: 'Adding your bobblehead to the collection...',
      success: 'Bobblehead added successfully! 🎉',
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
    onSubmitInvalid: ({ formApi }) => {
      // Focus the first field with an error when form submission is invalid
      focusFirstError(formApi);
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
      <div className={'space-y-8'}>
        <CollectionAssignment collections={collections} form={form} />
        <BasicInformation form={form} />
        <ItemPhotos form={form} />
        <AcquisitionDetails form={form} />
        <PhysicalAttributes form={form} />
        <ItemTags form={form} />
        <CustomFields form={form} />
        <ItemSettings form={form} />

        <form.AppForm>
          <div
            className={
              'sticky bottom-0 z-10 -mx-6 border-t border-border/50 bg-background/80 p-6 backdrop-blur-sm'
            }
          >
            <div className={'flex items-center justify-end'}>
              {/* Form actions */}
              <div className={'flex items-center gap-4'}>
                <Button className={'min-w-[100px]'} onClick={handleCancel} variant={'outline'}>
                  Cancel
                </Button>
                <form.SubmitButton isDisabled={isExecuting}>
                  <Conditional
                    fallback={
                      <div className={'flex items-center gap-2'}>
                        <CheckCircle2Icon aria-hidden className={'size-4'} />
                        <span>Add Bobblehead</span>
                      </div>
                    }
                    isCondition={isExecuting}
                  >
                    <div className={'flex items-center gap-2'}>
                      <div
                        className={'size-4 animate-spin rounded-full border-2 border-white/20 border-t-white'}
                      />
                      <span>Adding...</span>
                    </div>
                  </Conditional>
                </form.SubmitButton>
              </div>
            </div>
          </div>
        </form.AppForm>
      </div>
    </form>
  );
};

export const AddItemFormClient = (props: AddItemFormClientProps) => {
  return (
    <FocusProvider>
      <AddItemFormContent {...props} />
    </FocusProvider>
  );
};
