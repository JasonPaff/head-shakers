'use client';

import type { ComponentProps } from 'react';

import type { ProgressEntry, RealTimeProgressEntry } from '@/app/(app)/feature-planner/types/streaming';
import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { RefinementSettings, StepData } from '@/lib/validations/feature-planner.validation';

import { FeaturePlannerErrorBoundary } from '@/app/(app)/feature-planner/components/error-boundary';
import { StepOne } from '@/app/(app)/feature-planner/components/steps/step-one';
import { StepThree } from '@/app/(app)/feature-planner/components/steps/step-three';
import { StepTwo } from '@/app/(app)/feature-planner/components/steps/step-two';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

export type WorkflowStep = 1 | 2 | 3;

interface StepOrchestratorProps extends ComponentTestIdProps, Omit<ComponentProps<'div'>, 'onChange'> {
  currentStep: WorkflowStep;
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
  stepData: StepData;
  value: string;
}

/**
 * Step Orchestrator
 * Manages the rendering and state of individual workflow steps
 * Provides a clean separation between step logic and main page state
 */
export const StepOrchestrator = ({
  className,
  currentStep,
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
  stepData,
  testId,
  value,
  ...props
}: StepOrchestratorProps) => {
  const orchestratorTestId = testId || generateTestId('feature', 'form');

  return (
    <div className={cn('space-y-6', className)} data-testid={orchestratorTestId} {...props}>
      {/* Step 1: Feature Request Refinement */}
      <Conditional isCondition={currentStep === 1}>
        <FeaturePlannerErrorBoundary>
          <StepOne
            isRefining={isRefining}
            onChange={onChange}
            onParallelRefineRequest={onParallelRefineRequest}
            onRealtimeMessage={onRealtimeMessage}
            onRefinedRequestChange={onRefinedRequestChange}
            onRefineRequest={onRefineRequest}
            onSkipToFileDiscovery={onSkipToFileDiscovery}
            onUseOriginalRequest={onUseOriginalRequest}
            onUseRefinedRequest={onUseRefinedRequest}
            progress={progress}
            refinedRequest={refinedRequest}
            sessionId={sessionId}
            settings={settings}
            value={value}
          />
        </FeaturePlannerErrorBoundary>
      </Conditional>

      {/* Step 2: File Discovery */}
      <Conditional isCondition={currentStep === 2}>
        <FeaturePlannerErrorBoundary>
          <StepTwo
            discoveredFiles={stepData.step2?.discoveredFiles}
            selectedFiles={stepData.step2?.selectedFiles}
          />
        </FeaturePlannerErrorBoundary>
      </Conditional>

      {/* Step 3: Implementation Planning */}
      <Conditional isCondition={currentStep === 3}>
        <FeaturePlannerErrorBoundary>
          <StepThree
            implementationPlan={stepData.step3?.implementationPlan}
            validationCommands={stepData.step3?.validationCommands}
          />
        </FeaturePlannerErrorBoundary>
      </Conditional>
    </div>
  );
};