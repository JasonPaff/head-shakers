'use client';

import type { ComponentProps } from 'react';

import { Sparkles } from 'lucide-react';

import type { FeatureType, PriorityLevel } from '@/lib/validations/feature-planner.validation';

import { featureSuggestionFormOptions } from '@/app/(app)/feature-planner/components/feature-suggestion-form-options';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { generateTestId } from '@/lib/test-ids';
import { suggestFeatureInputSchema } from '@/lib/validations/feature-planner.validation';
import { cn } from '@/utils/tailwind-utils';

interface FeatureSuggestionFormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  initialPageOrComponent?: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (params: {
    additionalContext?: string;
    featureType: FeatureType;
    pageOrComponent: string;
    priorityLevel: PriorityLevel;
  }) => void;
}

const FEATURE_TYPE_OPTIONS = [
  { label: 'Enhancement', value: 'enhancement' },
  { label: 'New Capability', value: 'new-capability' },
  { label: 'Optimization', value: 'optimization' },
  { label: 'UI Improvement', value: 'ui-improvement' },
  { label: 'Integration', value: 'integration' },
];

const PRIORITY_LEVEL_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
];

export const FeatureSuggestionForm = withFocusManagement(
  ({
    className,
    initialPageOrComponent = '',
    isSubmitting,
    onCancel,
    onSubmit,
    ...props
  }: FeatureSuggestionFormProps) => {
    const formTestId = generateTestId('feature', 'form');
    const { focusFirstError } = useFocusContext();

    const form = useAppForm({
      ...featureSuggestionFormOptions,
      defaultValues: {
        ...featureSuggestionFormOptions.defaultValues,
        pageOrComponent: initialPageOrComponent,
      },
      onSubmit: ({ value }) => {
        // Only include additionalContext if it has content
        const submitData = {
          featureType: value.featureType,
          pageOrComponent: value.pageOrComponent,
          priorityLevel: value.priorityLevel,
          ...(value.additionalContext?.trim() && { additionalContext: value.additionalContext }),
        };

        onSubmit(submitData);
      },
      onSubmitInvalid: ({ formApi }) => {
        focusFirstError(formApi);
      },
      validators: { onSubmit: suggestFeatureInputSchema },
    });

    return (
      <form
        className={cn('space-y-6', className)}
        data-testid={formTestId}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        {...props}
      >
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2'}>
              <Sparkles aria-hidden className={'size-5 text-primary'} />
              Configure Feature Suggestion
            </CardTitle>
            <CardDescription>
              Provide context for AI to generate relevant feature suggestions tailored to your needs.
            </CardDescription>
          </CardHeader>

          <CardContent className={'space-y-6'}>
            {/* Page or Component Name */}
            <form.AppField name={'pageOrComponent'}>
              {(field) => (
                <field.TextField
                  description={'Specify the page, component, or area you want to improve'}
                  disabled={isSubmitting}
                  isRequired
                  label={'Page or Component Name'}
                  placeholder={'e.g., "Dashboard", "UserProfile", "CollectionGrid"'}
                />
              )}
            </form.AppField>

            {/* Feature Type */}
            <form.AppField name={'featureType'}>
              {(field) => (
                <field.SelectField
                  description={'What type of feature are you looking to add or improve?'}
                  label={'Feature Type'}
                  options={FEATURE_TYPE_OPTIONS}
                  placeholder={'Select feature type'}
                />
              )}
            </form.AppField>

            {/* Priority Level */}
            <form.AppField name={'priorityLevel'}>
              {(field) => (
                <field.SelectField
                  description={'How important is this feature to your project?'}
                  label={'Priority Level'}
                  options={PRIORITY_LEVEL_OPTIONS}
                  placeholder={'Select priority level'}
                />
              )}
            </form.AppField>

            {/* Additional Context (Optional) */}
            <form.AppField name={'additionalContext'}>
              {(field) => (
                <field.TextareaField
                  description={'Add specific details to get more tailored suggestions'}
                  disabled={isSubmitting}
                  label={'Additional Context (Optional)'}
                  placeholder={
                    'Provide any additional details, constraints, or specific requirements for the feature suggestions...'
                  }
                />
              )}
            </form.AppField>

            {/* Form Actions */}
            <form.AppForm>
              <div className={'flex items-center gap-3 pt-4'}>
                <div className={'flex-1'}>
                  <form.SubmitButton isDisabled={isSubmitting}>
                    {isSubmitting ? 'Generating Suggestions...' : 'Generate Suggestions'}
                  </form.SubmitButton>
                </div>
                <Button disabled={isSubmitting} onClick={onCancel} type={'button'} variant={'outline'}>
                  Cancel
                </Button>
              </div>
            </form.AppForm>
          </CardContent>
        </Card>
      </form>
    );
  },
);
