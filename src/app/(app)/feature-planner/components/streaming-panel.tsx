'use client';

import type { ComponentProps } from 'react';

import { Activity, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

import type { WorkflowStep } from '@/app/(app)/feature-planner/page';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Loader } from '@/components/ui/ai-elements/loader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface StreamingPanelProps extends ComponentProps<'div'>, ComponentTestIdProps {
  currentStep: WorkflowStep;
  hasError: boolean;
  isActive: boolean;
  progress: string[];
}

const stepTitles = {
  1: 'Feature Refinement',
  2: 'File Discovery',
  3: 'Implementation Planning',
} as const;

export const StreamingPanel = ({
  className,
  currentStep,
  hasError,
  isActive,
  progress,
  testId,
  ...props
}: StreamingPanelProps) => {
  const streamingPanelTestId = testId || generateTestId('feature', 'card');

  const getStatusIcon = () => {
    if (hasError) return <AlertCircle className={'h-4 w-4 text-destructive'} />;
    if (isActive) return <Loader className={'text-primary'} size={16} />;
    if (progress.length > 0) return <CheckCircle2 className={'h-4 w-4 text-green-600'} />;
    return <Clock className={'h-4 w-4 text-muted-foreground'} />;
  };

  const getStatusText = () => {
    if (hasError) return 'Error occurred';
    if (isActive) return 'Processing...';
    if (progress.length > 0) return 'Completed';
    return 'Waiting';
  };

  const getStatusVariant = (): 'default' | 'destructive' | 'secondary' => {
    if (hasError) return 'destructive';
    if (isActive) return 'default';
    if (progress.length > 0) return 'secondary';
    return 'secondary';
  };

  const shouldShowEmptyState = progress.length === 0 && !isActive;
  return (
    <div className={cn('space-y-4', className)} data-testid={streamingPanelTestId} {...props}>
      <Card
        className={cn('transition-colors', {
          'border-destructive': hasError,
          'border-green-500': progress.length > 0 && !isActive && !hasError,
          'border-primary': isActive,
        })}
      >
        <CardHeader className={'pb-3'}>
          <CardTitle className={'flex items-center justify-between'}>
            <div className={'flex items-center gap-2'}>
              <Activity className={'h-5 w-5'} />
              Real-time Updates
            </div>
            <Badge className={'gap-1'} variant={getStatusVariant()}>
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'text-sm text-muted-foreground'}>
            <strong>Current Step:</strong> {stepTitles[currentStep]}
          </div>

          {/* Progress Log */}
          <div className={'max-h-[300px] space-y-2 overflow-y-auto'}>
            {shouldShowEmptyState ?
              <div className={'py-8 text-center text-muted-foreground'}>
                <Clock className={'mx-auto mb-2 h-8 w-8 opacity-50'} />
                <p>Real-time updates will appear here when processing begins.</p>
              </div>
            : null}

            {progress.map((message, index) => (
              <div
                className={cn('rounded-md p-3 text-sm', 'border-l-2 border-l-primary bg-muted', {
                  'border-l-destructive bg-destructive/5': message.toLowerCase().includes('error'),
                  'border-l-green-500 bg-green-50 dark:bg-green-950': message
                    .toLowerCase()
                    .includes('complete'),
                })}
                key={index}
              >
                <div className={'flex items-start gap-2'}>
                  <span className={'mt-0.5 font-mono text-xs text-muted-foreground'}>
                    {new Date().toLocaleTimeString()}
                  </span>
                  <span className={'flex-1'}>{message}</span>
                </div>
              </div>
            ))}

            {isActive && (
              <div className={'rounded-md border-l-2 border-l-primary bg-primary/5 p-3 text-sm'}>
                <div className={'flex items-center gap-2'}>
                  <Loader size={14} />
                  <span>Processing request...</span>
                </div>
              </div>
            )}
          </div>

          {/* Status Summary */}
          <div className={'border-t pt-3 text-xs text-muted-foreground'}>
            {progress.length > 0 && (
              <p>
                {progress.length} update{progress.length !== 1 ? 's' : ''} received
              </p>
            )}
            {isActive && <p>⚡ Streaming active - updates will appear in real-time</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
