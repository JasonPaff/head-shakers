'use client';

import type { ComponentProps } from 'react';

import { ArrowRightIcon, RotateCcwIcon, SparklesIcon, UsersIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { RefinementSettings } from '@/lib/validations/feature-planner.validation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface RequestInputProps extends ComponentTestIdProps, Omit<ComponentProps<'div'>, 'onChange'> {
  isRefining: boolean;
  onChange: (value: string) => void;
  onParallelRefineRequest: () => void;
  onRefinedRequestChange: (value: string) => void;
  onRefineRequest: () => void;
  onSkipToFileDiscovery: () => void;
  onUseOriginalRequest: () => void;
  onUseRefinedRequest: () => void;
  refinedRequest: null | string;
  settings: RefinementSettings;
  value: string;
}

export const RequestInput = ({
  className,
  isRefining,
  onChange,
  onParallelRefineRequest,
  onRefinedRequestChange,
  onRefineRequest,
  onSkipToFileDiscovery,
  onUseOriginalRequest,
  onUseRefinedRequest,
  refinedRequest,
  settings,
  testId,
  value,
  ...props
}: RequestInputProps) => {
  const requestInputTestId = testId || generateTestId('feature', 'form');
  const characterCount = value.length;
  const isValidLength = characterCount >= 50 && characterCount <= 500;
  const canRefine = value.length > 0 && !isRefining;
  const canSkip = value.length > 0;

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
                  'text-green-600': isValidLength,
                  'text-orange-600': characterCount > 0 && !isValidLength,
                })}
              >
                {characterCount} characters
                <Conditional isCondition={characterCount > 0}>
                  <span className={'ml-1'}>{isValidLength ? '✓ Good length' : '(50-500 recommended)'}</span>
                </Conditional>
              </span>
              <Conditional isCondition={isValidLength}>
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
                disabled={!canRefine}
                onClick={onParallelRefineRequest}
                size={'lg'}
              >
                <UsersIcon aria-hidden className={'mr-2 size-4'} />
                {isRefining ? 'Processing...' : `Parallel Refine (${settings.agentCount} Agents)`}
              </Button>
              <Button disabled={!canRefine} onClick={onRefineRequest} size={'lg'} variant={'outline'}>
                <SparklesIcon aria-hidden className={'mr-2 size-4'} />
                Single Refine
              </Button>
            </div>

            {/* Secondary Action */}
            <Button
              className={'w-full'}
              disabled={!canSkip}
              onClick={onSkipToFileDiscovery}
              size={'lg'}
              variant={'ghost'}
            >
              Skip to File Discovery
              <ArrowRightIcon aria-hidden className={'ml-2 size-4'} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Refinement Result */}
      <Conditional isCondition={!!refinedRequest}>
        <Card>
          <CardHeader>
            <CardTitle className={'text-lg text-green-600'}>Refinement Complete</CardTitle>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            <div className={'space-y-3'}>
              <div>
                <Label className={'text-sm font-medium text-muted-foreground'}>Original Request:</Label>
                <p className={'mt-1 rounded-md bg-muted p-3 text-sm'}>{value}</p>
              </div>

              <Separator />

              <div>
                <Label className={'text-sm font-medium text-muted-foreground'} htmlFor={'enhanced-request'}>
                  Enhanced Request (editable):
                </Label>
                <Textarea
                  className={
                    'mt-1 min-h-[120px] resize-none border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                  }
                  id={'enhanced-request'}
                  onChange={(e) => {
                    onRefinedRequestChange(e.target.value);
                  }}
                  placeholder={'Your enhanced feature request will appear here for editing...'}
                  value={refinedRequest || ''}
                />
                <div className={'mt-1 text-xs text-muted-foreground'}>
                  You can edit this refined request before proceeding to file discovery.
                </div>
              </div>
            </div>

            <div className={'flex gap-3'}>
              <Button className={'flex-1'} onClick={onUseRefinedRequest} size={'lg'}>
                Use Enhanced Request
                <ArrowRightIcon aria-hidden className={'ml-2 size-4'} />
              </Button>
              <Button onClick={onUseOriginalRequest} size={'lg'} variant={'outline'}>
                <RotateCcwIcon aria-hidden className={'mr-2 size-4'} />
                Use Original
              </Button>
            </div>
          </CardContent>
        </Card>
      </Conditional>
    </div>
  );
};
