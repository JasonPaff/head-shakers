'use client';

import type { ComponentProps } from 'react';

import { AlertCircle, CheckCircle2, Loader2, Settings2Icon, Sparkles } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type {
  FeatureType,
  PriorityLevel,
  SuggestionResult,
} from '@/lib/validations/feature-planner.validation';

import { featureSuggestionFormOptions } from '@/app/(app)/feature-planner/components/feature-suggestion-form-options';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { Progress } from '@/components/ui/progress';
import { generateTestId } from '@/lib/test-ids';
import { suggestFeatureInputSchema } from '@/lib/validations/feature-planner.validation';
import { cn } from '@/utils/tailwind-utils';

interface FeatureSuggestionFormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  error: null | string;
  initialPageOrComponent?: string;
  onCancel: () => void;
  onRetry: () => void;
  onSubmit: (params: {
    additionalContext?: string;
    featureType: FeatureType;
    pageOrComponent: string;
    priorityLevel: PriorityLevel;
  }) => void;
  partialText: string;
  progress: number;
  status: Status;
  suggestions: Array<SuggestionResult> | null;
}

type Status = 'complete' | 'connecting' | 'creating' | 'error' | 'idle' | 'streaming';

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
    error,
    initialPageOrComponent = '',
    onCancel,
    onRetry,
    onSubmit,
    partialText,
    progress,
    status,
    suggestions,
    ...props
  }: FeatureSuggestionFormProps) => {
    // 1. Other hooks
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

    // 2. Derived values for conditional rendering (prefixed with '_')
    const _isCreating = status === 'creating';
    const _isConnecting = status === 'connecting';
    const _isStreaming = status === 'streaming';
    const _isComplete = status === 'complete';
    const _isError = status === 'error';
    const _isProcessing = _isCreating || _isConnecting || _isStreaming;
    const _isFormDisabled = _isProcessing || _isComplete;
    const _shouldShowStreamingText = _isStreaming && partialText.length > 0;
    const _shouldShowSuggestions = _isComplete && suggestions && suggestions.length > 0;

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
        {/* Feature Configuration Form */}
        <Card>
          <CardHeader>
            <div className={'flex items-start justify-between gap-4'}>
              <div className={'flex-1'}>
                <CardTitle className={'flex items-center gap-2'}>
                  <Sparkles aria-hidden className={'size-5 text-primary'} />
                  Configure Feature Suggestion
                </CardTitle>
                <CardDescription>
                  Provide context for AI to generate relevant feature suggestions tailored to your needs.
                </CardDescription>
              </div>
              <Link href={$path({ route: '/feature-planner/suggestion-agent' })}>
                <Button size={'sm'} type={'button'} variant={'ghost'}>
                  <Settings2Icon aria-hidden className={'mr-2 size-4'} />
                  Agent Settings
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className={'space-y-6'}>
            {/* Page or Component Name */}
            <form.AppField name={'pageOrComponent'}>
              {(field) => (
                <field.TextField
                  description={'Specify the page, component, or area you want to improve'}
                  disabled={_isFormDisabled}
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
                  disabled={_isFormDisabled}
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
                  <form.SubmitButton isDisabled={_isFormDisabled}>
                    {_isProcessing ? 'Generating Suggestions...' : 'Generate Suggestions'}
                  </form.SubmitButton>
                </div>
                <Button disabled={_isFormDisabled} onClick={onCancel} type={'button'} variant={'outline'}>
                  Cancel
                </Button>
              </div>
            </form.AppForm>
          </CardContent>
        </Card>

        {/* Status Display Section */}
        <Conditional isCondition={_isProcessing}>
          <Card>
            <CardHeader>
              <CardTitle className={'flex items-center gap-2'}>
                <Loader2 aria-hidden className={'size-5 animate-spin text-primary'} />
                {_isCreating && 'Creating Job...'}
                {_isConnecting && 'Connecting to AI...'}
                {_isStreaming && 'Generating Suggestions...'}
              </CardTitle>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              {/* Progress Bar */}
              <Conditional isCondition={_isStreaming}>
                <div className={'space-y-2'}>
                  <Progress value={progress} />
                  <p className={'text-center text-sm text-muted-foreground'}>{progress}% complete</p>
                </div>
              </Conditional>

              {/* Streaming Text Display */}
              <Conditional isCondition={_shouldShowStreamingText}>
                <div className={'rounded-md border bg-muted/50 p-4'}>
                  <div className={'font-mono text-xs whitespace-pre-wrap'}>
                    {partialText}
                    <span className={'animate-pulse'}>▋</span>
                  </div>
                </div>
              </Conditional>
            </CardContent>
          </Card>
        </Conditional>

        {/* Error Display */}
        <Conditional isCondition={_isError && error !== null}>
          <Card className={'border-destructive'}>
            <CardHeader>
              <CardTitle className={'flex items-center gap-2 text-destructive'}>
                <AlertCircle aria-hidden className={'size-5'} />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              <p className={'text-sm text-destructive'}>{error}</p>
              <Button onClick={onRetry} type={'button'} variant={'outline'}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </Conditional>

        {/* Suggestion Results */}
        <Conditional isCondition={_shouldShowSuggestions}>
          <Card>
            <CardHeader>
              <CardTitle className={'flex items-center gap-2'}>
                <CheckCircle2 aria-hidden className={'size-5 text-green-600'} />
                Feature Suggestions
              </CardTitle>
              <CardDescription>
                AI-generated feature suggestions based on your input. Review and implement as needed.
              </CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              {suggestions?.map((suggestion, index) => (
                <Card className={'bg-muted/50'} key={index}>
                  <CardHeader>
                    <CardTitle className={'text-lg'}>{suggestion.title}</CardTitle>
                  </CardHeader>
                  <CardContent className={'space-y-4'}>
                    {/* Rationale Section */}
                    <div>
                      <h4 className={'mb-2 text-sm font-semibold'}>Rationale</h4>
                      <p className={'text-sm text-muted-foreground'}>{suggestion.rationale}</p>
                    </div>

                    {/* Description Section */}
                    <div>
                      <h4 className={'mb-2 text-sm font-semibold'}>Description</h4>
                      <p className={'text-sm text-muted-foreground'}>{suggestion.description}</p>
                    </div>

                    {/* Implementation Considerations */}
                    <Conditional isCondition={suggestion.implementationConsiderations !== undefined}>
                      <div>
                        <h4 className={'mb-2 text-sm font-semibold'}>Implementation Considerations</h4>
                        <ul className={'ml-4 list-disc space-y-1 text-sm text-muted-foreground'}>
                          {suggestion.implementationConsiderations?.map((consideration, idx) => (
                            <li key={idx}>{consideration}</li>
                          ))}
                        </ul>
                      </div>
                    </Conditional>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </Conditional>
      </form>
    );
  },
);
