'use client';

import type { ComponentProps } from 'react';

import { ArrowRightIcon, RotateCcwIcon, SparklesIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

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
  onRefineRequest: () => void;
  onSkipToFileDiscovery: () => void;
  onUseOriginalRequest: () => void;
  onUseRefinedRequest: () => void;
  refinedRequest: null | string;
  value: string;
}

export const RequestInput = ({
  className,
  isRefining,
  onChange,
  onRefineRequest,
  onSkipToFileDiscovery,
  onUseOriginalRequest,
  onUseRefinedRequest,
  refinedRequest,
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

          <div className={'flex gap-3'}>
            <Button className={'flex-1'} disabled={!canRefine} onClick={onRefineRequest} size={'lg'}>
              <SparklesIcon aria-hidden className={'mr-2 size-4'} />
              {isRefining ? 'Refining...' : 'Refine Request'}
            </Button>
            <Button disabled={!canSkip} onClick={onSkipToFileDiscovery} size={'lg'} variant={'outline'}>
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
                <Label className={'text-sm font-medium text-muted-foreground'}>Enhanced Request:</Label>
                <p
                  className={
                    'mt-1 rounded-md border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950'
                  }
                >
                  {refinedRequest}
                </p>
              </div>
            </div>

            <div className={'flex gap-3'}>
              <Button className={'flex-1'} onClick={onUseRefinedRequest} size={'lg'}>
                Use Enhanced Request
                <ArrowRightIcon className={'ml-2 size-4'} />
              </Button>
              <Button onClick={onUseOriginalRequest} size={'lg'} variant={'outline'}>
                <RotateCcwIcon className={'mr-2 size-4'} />
                Use Original
              </Button>
            </div>
          </CardContent>
        </Card>
      </Conditional>
    </div>
  );
};
