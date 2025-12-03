'use client';

import type { z } from 'zod';

import { revalidateLogic } from '@tanstack/form-core';
import { CheckCircle2Icon } from 'lucide-react';
import { useQueryStates } from 'nuqs';

import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useServerAction } from '@/hooks/use-server-action';
import { createBobbleheadWithPhotosAction } from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { createBobbleheadWithPhotosSchema } from '@/lib/validations/bobbleheads.validation';

import { collectionDashboardParsers } from '../../route-type';
import { AcquisitionDetails } from '../add-form/acquisition-details';
import { addItemFormOptions } from '../add-form/add-item-form-options';
import { AddItemHeader } from '../add-form/add-item-header';
import { BasicInformation } from '../add-form/basic-information';
import { CollectionAssignment } from '../add-form/collection-assignment';
import { CustomFields } from '../add-form/custom-fields';
import { ItemPhotos } from '../add-form/item-photos';
import { ItemSettings } from '../add-form/item-settings';
import { ItemTags } from '../add-form/item-tags';
import { PhysicalAttributes } from '../add-form/physical-attributes';

interface AddBobbleheadFormDisplayProps {
  collections: Array<ComboboxItem>;
  initialCollectionId?: string;
}

export const AddBobbleheadFormDisplay = withFocusManagement(
  ({ collections, initialCollectionId }: AddBobbleheadFormDisplayProps) => {
    const { focusFirstError } = useFocusContext();
    const [, setParams] = useQueryStates({ add: collectionDashboardParsers.add }, { shallow: false });

    const handleClose = () => {
      void setParams({ add: null });
    };

    const { executeAsync, isExecuting } = useServerAction(createBobbleheadWithPhotosAction, {
      loadingMessage: 'Adding your bobblehead to the collection...',
      onSuccess: () => {
        // Return to grid view after successful creation
        handleClose();
      },
    });

    const form = useAppForm({
      ...addItemFormOptions,
      canSubmitWhenInvalid: true,
      defaultValues: {
        ...addItemFormOptions.defaultValues,
        collectionId: initialCollectionId || '',
      } as z.input<typeof createBobbleheadWithPhotosSchema>,
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
        onSubmit: createBobbleheadWithPhotosSchema,
      },
    });

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className={'space-y-8 p-6'}>
          <AddItemHeader />
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
                  <Button
                    className={'min-w-[100px]'}
                    onClick={handleClose}
                    type={'button'}
                    variant={'outline'}
                  >
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
                          className={
                            'size-4 animate-spin rounded-full border-2 border-white/20 border-t-white'
                          }
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
  },
);
