'use client';

import type { ComponentProps } from 'react';

import { Lightbulb, SparklesIcon, UsersIcon } from 'lucide-react';

import type { RefinementSettings } from '@/lib/validations/feature-planner.validation';

import { FeatureSuggestionDialog } from '@/app/(app)/feature-planner/components/feature-suggestion-dialog';
import { useSuggestFeature } from '@/app/(app)/feature-planner/hooks/use-suggest-feature';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface RequestInputProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  isRefining: boolean;
  onChange: (value: string) => void;
  onParallelRefineRequest: () => void;
  onRefineRequest: () => void;
  settings: RefinementSettings;
  value: string;
}

export const RequestInput = ({
  className,
  isRefining,
  onChange,
  onParallelRefineRequest,
  onRefineRequest,
  settings,
  value,
  ...props
}: RequestInputProps) => {
  const requestInputTestId = generateTestId('feature', 'form');

  // Feature suggestion hook
  const {
    clearResults,
    closeDialog,
    error,
    invokeSuggestion,
    isDialogOpen,
    isLoading,
    openDialog,
    suggestions,
  } = useSuggestFeature();

  const _isRefineEnabled = value.length > 0 && !isRefining;
  const _characterCount = value.length;
  const _isValidLength = _characterCount >= 50 && _characterCount <= 500;

  return (
    <div className={cn('space-y-6', className)} data-testid={requestInputTestId} {...props}>
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <SparklesIcon aria-hidden className={'size-5 text-primary'} />
            Step 1: Feature Request Input
          </CardTitle>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'space-y-2'}>
            <Label htmlFor={'feature-request'}>Feature Description</Label>
            <Textarea
              className={'min-h-[120px] resize-none'}
              disabled={isRefining}
              id={'feature-request'}
              onChange={(e) => {
                onChange(e.target.value);
              }}
              placeholder={'Describe the feature you want to implement... (50-500 characters recommended)'}
              value={value}
            />
            <div className={'flex items-center justify-between text-sm'}>
              <span
                className={cn('text-muted-foreground', {
                  'text-green-600': _isValidLength,
                  'text-orange-600': _characterCount > 0 && !_isValidLength,
                })}
              >
                {_characterCount} characters
                <Conditional isCondition={_characterCount > 0}>
                  <span className={'ml-1'}>{_isValidLength ? '✓ Good length' : '(50-500 recommended)'}</span>
                </Conditional>
              </span>
              <Conditional isCondition={_isValidLength}>
                <Badge className={'text-xs'} variant={'secondary'}>
                  Optimal length
                </Badge>
              </Conditional>
            </div>
          </div>

          <div className={'space-y-3'}>
            {/* Primary Refinement Actions */}
            <div className={'flex gap-3'}>
              <Button
                className={'flex-1'}
                disabled={!_isRefineEnabled}
                onClick={onParallelRefineRequest}
                size={'lg'}
              >
                <UsersIcon aria-hidden className={'mr-2 size-4'} />
                {isRefining ? 'Processing...' : `Parallel Refine (${settings.agentCount} Agents)`}
              </Button>
              <Button disabled={!_isRefineEnabled} onClick={onRefineRequest} size={'lg'} variant={'outline'}>
                <SparklesIcon aria-hidden className={'mr-2 size-4'} />
                Single Refine
              </Button>
            </div>

            {/* AI Feature Suggestion */}
            <div className={'flex gap-3'}>
              <Button className={'flex-1'} onClick={openDialog} size={'lg'} variant={'secondary'}>
                <Lightbulb aria-hidden className={'mr-2 size-4'} />
                AI Suggest Feature
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Suggestion Dialog */}
      <FeatureSuggestionDialog
        error={error}
        initialPageOrComponent={''}
        isLoading={isLoading}
        isOpen={isDialogOpen}
        onBackToForm={clearResults}
        onClose={closeDialog}
        onSubmit={invokeSuggestion}
        suggestions={suggestions}
      />
    </div>
  );
};
