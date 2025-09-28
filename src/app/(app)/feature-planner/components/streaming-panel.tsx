'use client';

import type { ComponentProps } from 'react';

import {
  ActivityIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  WifiIcon,
  WifiOffIcon,
} from 'lucide-react';
import { useMemo } from 'react';

import type { WorkflowStep } from '@/app/(app)/feature-planner/components/steps/step-orchestrator';
import type { ProgressEntry, RealTimeProgressEntry } from '@/app/(app)/feature-planner/types/streaming';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Loader } from '@/components/ui/ai-elements/loader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { useAblyRefinement } from '../hooks/use-ably-refinement';
import { AblyChannelStatus } from '../types/streaming';

interface StreamingPanelProps extends ComponentProps<'div'>, ComponentTestIdProps {
  currentStep: WorkflowStep;
  hasError: boolean;
  isActive: boolean;
  onRealtimeMessage?: (message: RealTimeProgressEntry) => void;
  progress: Array<ProgressEntry>;
  sessionId: string;
}

const stepTitles: Record<WorkflowStep, string> = {
  1: 'Feature Refinement',
  2: 'File Discovery',
  3: 'Implementation Planning',
};

export const StreamingPanel = ({
  className,
  currentStep,
  hasError,
  isActive,
  onRealtimeMessage,
  progress,
  sessionId,
  testId,
  ...props
}: StreamingPanelProps) => {
  const streamingPanelTestId = testId || generateTestId('feature', 'card');

  const {
    connectionStatus,
    error: ablyError,
    messages: realtimeMessages,
  } = useAblyRefinement({
    onError: (error) => {
      console.error('Ably connection error:', error);
    },
    onMessage: onRealtimeMessage,
    sessionId,
  });

  const allMessages = useMemo(() => {
    const combinedMessages: Array<ProgressEntry | RealTimeProgressEntry> = [...progress, ...realtimeMessages];
    return combinedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [progress, realtimeMessages]);

  const getStatusIcon = () => {
    if (hasError || ablyError) return <AlertCircleIcon aria-hidden className={'size-4 text-destructive'} />;
    if (isActive) return <Loader className={'text-primary'} size={16} />;
    if (allMessages.length > 0) return <CheckCircle2Icon aria-hidden className={'size-4 text-green-600'} />;
    return <ClockIcon aria-hidden className={'size-4 text-muted-foreground'} />;
  };

  const getStatusText = () => {
    if (hasError || ablyError) return 'Error occurred';
    if (isActive) return 'Processing...';
    if (allMessages.length > 0) return 'Completed';
    return 'Waiting';
  };

  const getStatusVariant = (): 'default' | 'destructive' | 'secondary' => {
    if (hasError || ablyError) return 'destructive';
    if (isActive) return 'default';
    if (allMessages.length > 0) return 'secondary';
    return 'secondary';
  };

  const getConnectionIcon = () => {
    if (connectionStatus === AblyChannelStatus.CONNECTED) {
      return <WifiIcon aria-hidden className={'size-3 text-green-600'} />;
    }
    return <WifiOffIcon aria-hidden className={'size-3 text-muted-foreground'} />;
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case AblyChannelStatus.CLOSED:
        return 'Closed';
      case AblyChannelStatus.CONNECTED:
        return 'Connected';
      case AblyChannelStatus.CONNECTING:
        return 'Connecting...';
      case AblyChannelStatus.DISCONNECTED:
        return 'Disconnected';
      case AblyChannelStatus.FAILED:
        return 'Failed';
      case AblyChannelStatus.SUSPENDED:
        return 'Suspended';
      default:
        return 'Unknown';
    }
  };

  const shouldShowEmptyState = allMessages.length === 0 && !isActive;
  return (
    <div className={cn('space-y-4', className)} data-testid={streamingPanelTestId} {...props}>
      <Card
        className={cn('transition-colors', {
          'border-destructive': hasError || ablyError,
          'border-green-500': allMessages.length > 0 && !isActive && !hasError && !ablyError,
          'border-primary': isActive,
        })}
      >
        <CardHeader className={'pb-3'}>
          <CardTitle className={'flex items-center justify-between'}>
            <div className={'flex items-center gap-2'}>
              <ActivityIcon aria-hidden className={'size-5'} />
              Real-time Updates
            </div>
            <div className={'flex items-center gap-2'}>
              <Badge className={'gap-1'} variant={'outline'}>
                {getConnectionIcon()}
                <span className={'text-xs'}>{getConnectionText()}</span>
              </Badge>
              <Badge className={'gap-1'} variant={getStatusVariant()}>
                {getStatusIcon()}
                {getStatusText()}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'text-sm text-muted-foreground'}>
            <strong>Current Step:</strong> {stepTitles[currentStep]}
          </div>

          {/* Progress Log */}
          <div className={'max-h-[300px] space-y-2 overflow-y-auto'}>
            <Conditional isCondition={shouldShowEmptyState}>
              <div className={'py-8 text-center text-muted-foreground'}>
                <ClockIcon aria-hidden className={'mx-auto mb-2 h-8 w-8 opacity-50'} />
                <p>Real-time updates will appear here when processing begins.</p>
              </div>
            </Conditional>

            {allMessages.map((entry) => {
              const isRealTimeMessage = 'messageId' in entry;
              const isStage = isRealTimeMessage && 'stage' in entry && !!entry.stage;

              return (
                <div
                  className={cn('rounded-md p-3 text-sm', 'border-l-2', {
                    'border-l-destructive bg-destructive/5': entry.type === 'error',
                    'border-l-green-500 bg-green-50 dark:bg-green-950': entry.type === 'success',
                    'border-l-orange-500 bg-orange-50 dark:bg-orange-950': entry.type === 'warning',
                    'border-l-primary bg-muted': entry.type === 'info',
                    'ring-1 ring-primary/20': isRealTimeMessage, // Highlight real-time messages
                  })}
                  key={entry.id}
                >
                  <div className={'flex items-start gap-2'}>
                    <span className={'mt-0.5 font-mono text-xs text-muted-foreground'}>
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                    <div className={'flex-1'}>
                      <div className={'mb-1 flex items-center gap-1'}>
                        <Conditional isCondition={!!entry.agentId}>
                          <Badge className={'text-xs'} variant={'outline'}>
                            {entry.agentId}
                          </Badge>
                        </Conditional>
                        <Conditional isCondition={isRealTimeMessage}>
                          <Badge className={'text-xs'} variant={'secondary'}>
                            Live
                          </Badge>
                        </Conditional>
                        <Conditional isCondition={isStage}>
                          <Badge className={'text-xs'} variant={'outline'}>
                            {(entry as RealTimeProgressEntry).stage?.replace(/_/g, ' ')}
                          </Badge>
                        </Conditional>
                      </div>
                      <span>{entry.message}</span>
                      <Conditional isCondition={isRealTimeMessage && !!entry.metadata?.progress}>
                        <div className={'mt-2'}>
                          <div className={'mb-1 text-xs text-muted-foreground'}>
                            Progress:{' '}
                            {Math.round(((entry as RealTimeProgressEntry).metadata?.progress || 0) * 100)}%
                          </div>
                          <div className={'h-1 overflow-hidden rounded-full bg-muted'}>
                            <div
                              className={'h-full bg-primary transition-all duration-300'}
                              style={{
                                width: `${Math.round(((entry as RealTimeProgressEntry).metadata?.progress || 0) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </Conditional>
                    </div>
                  </div>
                </div>
              );
            })}

            <Conditional isCondition={isActive}>
              <div className={'rounded-md border-l-2 border-l-primary bg-primary/5 p-3 text-sm'}>
                <div className={'flex items-center gap-2'}>
                  <Loader size={14} />
                  <span>Processing request...</span>
                </div>
              </div>
            </Conditional>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
