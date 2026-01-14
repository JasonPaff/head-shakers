'use client';

import type { FormEvent } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';

import type { BobbleheadForUpsert, CollectionSelectorRecord } from './bobblehead-upsert-form.types';
import type { BobbleheadCreatedResult } from './hooks/use-bobblehead-upsert-form';

import { BobbleheadFormFields } from './bobblehead-form-fields';
import { useBobbleheadUpsertForm } from './hooks/use-bobblehead-upsert-form';

/**
 * Props for the BobbleheadUpsertForm component.
 */
interface BobbleheadUpsertFormProps extends ComponentTestIdProps {
  /**
   * When provided, form is in edit mode.
   * When undefined, form is in create mode.
   */
  bobblehead?: BobbleheadForUpsert;
  /**
   * The collection ID where the bobblehead will be created/lives.
   * Required for create mode, used to set default collectionId.
   */
  collectionId: string;
  /**
   * Available collections for the collection selector dropdown.
   */
  collections: Array<CollectionSelectorRecord>;
  /**
   * Called when the user clicks the Cancel button.
   */
  onCancel?: () => void;
  /**
   * Called on successful create or update.
   */
  onSuccess?: (result: BobbleheadCreatedResult) => void;
}

/**
 * BobbleheadUpsertForm is the main form component for creating or editing bobbleheads.
 *
 * It orchestrates:
 * - The useBobbleheadUpsertForm hook for form state and submission
 * - The BobbleheadFormFields component for rendering all form fields
 * - Header with dynamic title/description based on mode
 * - Footer with Cancel and Submit buttons
 *
 * Wrapped with withFocusManagement HOC for automatic focus management on validation errors.
 */
export const BobbleheadUpsertForm = withFocusManagement(
  ({ bobblehead, collectionId, collections, onCancel, onSuccess, testId }: BobbleheadUpsertFormProps) => {
    const { form, handlePhotosChange, isEditMode, isExecuting, isSubmitting, labels, photos, resetForm } =
      useBobbleheadUpsertForm({
        bobblehead,
        collectionId,
        onSuccess: (result) => {
          onSuccess?.(result);
        },
      });

    // Event handlers
    const handleFormSubmit = (e: FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      void form.handleSubmit();
    };

    const handleCancelClick = () => {
      resetForm();
      onCancel?.();
    };

    // Derived values
    const _isFormDisabled = isExecuting || isSubmitting;

    // Test IDs - use simple string literals matching the testIdPrefix pattern
    const modePrefix = isEditMode ? 'bobblehead-edit' : 'bobblehead-create';
    const formTestId = testId || `${modePrefix}-form`;
    const headerTestId = `${modePrefix}-header`;
    const cancelButtonTestId = `${modePrefix}-cancel`;
    const submitButtonTestId = `${modePrefix}-submit`;

    return (
      <form data-testid={formTestId} onSubmit={handleFormSubmit}>
        <form.AppForm>
          {/* Form Header Card */}
          <Card className={'mb-6'} testId={headerTestId}>
            <CardHeader>
              <CardTitle>{labels.title}</CardTitle>
              <CardDescription>{labels.description}</CardDescription>
            </CardHeader>
          </Card>

          {/* Form Fields */}
          <BobbleheadFormFields
            bobbleheadId={bobblehead?.id}
            collections={collections}
            form={form}
            isSubmitting={_isFormDisabled}
            onPhotosChange={handlePhotosChange}
            photos={photos}
            testIdPrefix={modePrefix}
          />

          {/* Form Footer */}
          <Card className={'mt-6'}>
            <CardContent>
              <CardFooter className={'flex justify-end gap-3 px-0'}>
                {/* Cancel Button */}
                <Button
                  disabled={_isFormDisabled}
                  onClick={handleCancelClick}
                  testId={cancelButtonTestId}
                  type={'button'}
                  variant={'outline'}
                >
                  Cancel
                </Button>

                {/* Submit Button */}
                <form.SubmitButton isDisabled={_isFormDisabled} testId={submitButtonTestId}>
                  {_isFormDisabled ? labels.submitButtonLoading : labels.submitButton}
                </form.SubmitButton>
              </CardFooter>
            </CardContent>
          </Card>
        </form.AppForm>
      </form>
    );
  },
);
