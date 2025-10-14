'use client';

import { $path } from 'next-typesafe-url';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import type { FeatureSuggestionAgent } from '@/lib/types/feature-suggestion-agent';

import { suggestionAgentFormOptions } from '@/app/(app)/feature-planner/suggestion-agent/components/suggestion-agent-form-options';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { Separator } from '@/components/ui/separator';
import { useServerAction } from '@/hooks/use-server-action';
import {
  createFeatureSuggestionAgentAction,
  updateFeatureSuggestionAgentAction,
} from '@/lib/actions/feature-planner/manage-suggestion-agents.action';
import { featureSuggestionAgentInputSchema } from '@/lib/validations/feature-planner.validation';

interface SuggestionAgentFormProps {
  agent?: FeatureSuggestionAgent | null;
  mode: 'create' | 'edit';
}

export const SuggestionAgentForm = withFocusManagement(({ agent, mode }: SuggestionAgentFormProps) => {
  const router = useRouter();
  const { focusFirstError } = useFocusContext();

  const { executeAsync: createAgentAsync, isExecuting: isCreating } = useServerAction(
    createFeatureSuggestionAgentAction,
    {
      onAfterSuccess: () => {
        router.push($path({ route: '/feature-planner' }));
        router.refresh();
      },
      toastMessages: {
        error: 'Failed to create suggestion agent',
        loading: 'Creating suggestion agent...',
        success: 'Suggestion agent created successfully',
      },
    },
  );

  const { executeAsync: updateAgentAsync, isExecuting: isUpdating } = useServerAction(
    updateFeatureSuggestionAgentAction,
    {
      onAfterSuccess: () => {
        router.push($path({ route: '/feature-planner' }));
        router.refresh();
      },
      toastMessages: {
        error: 'Failed to update suggestion agent',
        loading: 'Updating suggestion agent...',
        success: 'Suggestion agent updated successfully',
      },
    },
  );

  const form = useAppForm({
    ...suggestionAgentFormOptions,
    onSubmit: async ({ value }) => {
      if (mode === 'create') {
        await createAgentAsync(value);
      } else {
        await updateAgentAsync({
          agentId: agent?.agentId || '',
          updates: {
            focus: value.focus,
            name: value.name,
            role: value.role,
            systemPrompt: value.systemPrompt,
            temperature: value.temperature,
            tools: value.tools,
          },
        });
      }
    },
    onSubmitInvalid: ({ formApi }) => {
      focusFirstError(formApi);
    },
    validators: { onSubmit: featureSuggestionAgentInputSchema },
  });

  // load existing agent data in edit mode
  useEffect(() => {
    if (mode === 'edit' && agent) {
      form.setFieldValue('agentId', agent.agentId);
      form.setFieldValue('name', agent.name);
      form.setFieldValue('role', agent.role);
      form.setFieldValue('focus', agent.focus);
      form.setFieldValue('temperature', agent.temperature);
      form.setFieldValue('tools', agent.tools);
      form.setFieldValue('systemPrompt', agent.systemPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, agent]);

  const handleCancel = () => {
    router.push($path({ route: '/feature-planner' }));
  };

  const _isSubmitting = isCreating || isUpdating;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'New Suggestion Agent' : 'Edit Suggestion Agent'}</CardTitle>
          <CardDescription>
            {mode === 'create' ?
              'Configure the agent with a unique identifier, role, and system prompt that defines its strategic perspective.'
            : 'Update the agent configuration. Changes will apply to future feature suggestion sessions.'}
          </CardDescription>
        </CardHeader>

        <CardContent className={'space-y-6'}>
          {/* Basic Information */}
          <div className={'space-y-4'}>
            <h3 className={'text-lg font-semibold'}>Basic Information</h3>

            {/* Agent ID */}
            <form.AppField name={'agentId'}>
              {(field) => (
                <field.TextField
                  disabled={mode === 'edit'}
                  isRequired
                  label={'Agent ID'}
                  placeholder={'feature-strategist'}
                />
              )}
            </form.AppField>
            <p className={'text-xs text-muted-foreground'}>
              {mode === 'create' ?
                'A unique identifier in kebab-case (e.g., feature-strategist)'
              : 'Agent ID cannot be changed after creation'}
            </p>

            {/* Agent Name */}
            <form.AppField name={'name'}>
              {(field) => (
                <field.TextField isRequired label={'Agent Name'} placeholder={'Feature Strategist'} />
              )}
            </form.AppField>
            <p className={'text-xs text-muted-foreground'}>Display name shown in the UI</p>

            {/* Agent Role */}
            <form.AppField name={'role'}>
              {(field) => (
                <field.TextField isRequired label={'Agent Role'} placeholder={'Senior Product Strategist'} />
              )}
            </form.AppField>
            <p className={'text-xs text-muted-foreground'}>Professional role or title for the agent</p>

            {/* Focus Area */}
            <form.AppField name={'focus'}>
              {(field) => (
                <field.TextareaField
                  isRequired
                  label={'Focus Area'}
                  placeholder={'Strategic feature ideation, user needs analysis, technical feasibility'}
                  rows={3}
                />
              )}
            </form.AppField>
            <p className={'text-xs text-muted-foreground'}>Primary areas of expertise and analysis focus</p>
          </div>

          <Separator />

          {/* Configuration */}
          <div className={'space-y-4'}>
            <h3 className={'text-lg font-semibold'}>Configuration</h3>

            {/* Temperature */}
            <form.AppField name={'temperature'}>
              {(field) => (
                <field.TextField
                  isRequired
                  label={'Temperature'}
                  max={2.0}
                  min={0.0}
                  step={0.1}
                  type={'number'}
                />
              )}
            </form.AppField>
            <p className={'text-xs text-muted-foreground'}>
              Control creativity (0.0-2.0). Higher values are more creative; lower values are more focused.
            </p>

            {/* Tools */}
            <form.AppField name={'tools'}>
              {(field) => (
                <field.TagField
                  description={'Tools the agent can use for code analysis (e.g., Read, Grep, Glob)'}
                  isRequired
                  label={'Tools'}
                  placeholder={'Type a tool name and press Enter (e.g., Read, Grep, Glob)'}
                />
              )}
            </form.AppField>
          </div>

          <Separator />

          {/* System Prompt */}
          <div className={'space-y-4'}>
            <h3 className={'text-lg font-semibold'}>System Prompt</h3>

            <form.AppField name={'systemPrompt'}>
              {(field) => (
                <field.TextareaField
                  isRequired
                  label={'System Prompt'}
                  placeholder={
                    'You are a product strategist analyzing a codebase for feature opportunities. Your role is to suggest strategic features that align with user needs and technical capabilities...'
                  }
                  rows={12}
                />
              )}
            </form.AppField>
            <p className={'text-xs text-muted-foreground'}>
              Instructions that define the agent&apos;s behavior, strategic perspective, and analysis approach
            </p>
          </div>

          {/* Form Actions */}
          <form.AppForm>
            <div className={'flex gap-3 pt-4'}>
              <div className={'flex-1'}>
                <form.SubmitButton isDisabled={_isSubmitting}>
                  {mode === 'create' ? 'Create Agent' : 'Save Changes'}
                </form.SubmitButton>
              </div>
              <Button disabled={_isSubmitting} onClick={handleCancel} type={'button'} variant={'outline'}>
                Cancel
              </Button>
            </div>
          </form.AppForm>
        </CardContent>
      </Card>
    </form>
  );
});
