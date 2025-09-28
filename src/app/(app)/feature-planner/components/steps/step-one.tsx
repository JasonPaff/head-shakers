'use client';

import type { ComponentProps } from 'react';

import type { ProgressEntry, RealTimeProgressEntry } from '@/app/(app)/feature-planner/types/streaming';
import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { RefinementSettings } from '@/lib/validations/feature-planner.validation';

import { RequestInput } from '@/app/(app)/feature-planner/components/request-input';
import { StreamingPanel } from '@/app/(app)/feature-planner/components/streaming-panel';
import { useAblyRefinement } from '@/app/(app)/feature-planner/hooks/use-ably-refinement';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface StepOneProps extends ComponentTestIdProps, Omit<ComponentProps<'div'>, 'onChange'> {
  isRefining: boolean;
  onChange: (value: string) => void;
  onParallelRefineRequest: () => void;
  onRealtimeMessage?: (message: RealTimeProgressEntry) => void;
  onRefinedRequestChange: (value: string) => void;
  onRefineRequest: () => void;
  onSkipToFileDiscovery: () => void;
  onUseOriginalRequest: () => void;
  onUseRefinedRequest: () => void;
  progress?: Array<ProgressEntry>;
  refinedRequest: null | string;
  sessionId: string;
  settings: RefinementSettings;
  value: string;
}

export const StepOne = ({
  className,
  isRefining,
  onChange,
  onParallelRefineRequest,
  onRealtimeMessage,
  onRefinedRequestChange,
  onRefineRequest,
  onSkipToFileDiscovery,
  onUseOriginalRequest,
  onUseRefinedRequest,
  progress = [],
  refinedRequest,
  sessionId,
  settings,
  testId,
  value,
  ...props
}: StepOneProps) => {
  const stepOneTestId = testId || generateTestId('feature', 'form');

  const {
    error: ablyError,
    isConnected,
    messages: realtimeMessages,
  } = useAblyRefinement({
    onError: (error) => {
      console.error('Ably connection error in StepOne:', error);
    },
    onMessage: onRealtimeMessage,
    sessionId,
  });

  const _isActiveWithRealtime = isRefining || (isConnected && realtimeMessages.length > 0);
  const _shouldShowStreamingPanel = _isActiveWithRealtime || progress.length > 0 || !!ablyError;

  return (
    <div className={cn('space-y-6', className)} data-testid={stepOneTestId} {...props}>
      <RequestInput
        isRefining={isRefining}
        onChange={onChange}
        onParallelRefineRequest={onParallelRefineRequest}
        onRefinedRequestChange={onRefinedRequestChange}
        onRefineRequest={onRefineRequest}
        onSkipToFileDiscovery={onSkipToFileDiscovery}
        onUseOriginalRequest={onUseOriginalRequest}
        onUseRefinedRequest={onUseRefinedRequest}
        refinedRequest={refinedRequest}
        settings={settings}
        value={value}
      />

      <Conditional isCondition={_shouldShowStreamingPanel}>
        <StreamingPanel
          currentStep={1}
          hasError={!!ablyError}
          isActive={_isActiveWithRealtime}
          onRealtimeMessage={onRealtimeMessage}
          progress={progress}
          sessionId={sessionId}
        />
      </Conditional>
    </div>
  );
};
