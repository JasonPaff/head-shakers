'use client';

import type { ComponentProps } from 'react';

import type { FileDiscoverySession } from '@/lib/db/schema/feature-planner.schema';
import type { RefinementSettings, StepData } from '@/lib/validations/feature-planner.validation';

import { StepOne } from '@/app/(app)/feature-planner/components/steps/step-one';
import { StepThree } from '@/app/(app)/feature-planner/components/steps/step-three';
import { StepTwo } from '@/app/(app)/feature-planner/components/steps/step-two';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

export type WorkflowStep = 1 | 2 | 3;

interface StepOrchestratorProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  currentStep: WorkflowStep;
  discoverySession: FileDiscoverySession | null;
  isRefining: boolean;
  onChange: (value: string) => void;
  onFileDiscovery: () => void;
  onImplementationPlanning: () => void;
  onParallelRefineRequest: () => void;
  onRefinedRequestChange: (value: string) => void;
  onRefineRequest: () => void;
  onSkipToFileDiscovery: () => void;
  onUseOriginalRequest: () => void;
  onUseRefinedRequest: () => void;
  refinedRequest: null | string;
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
  discoverySession,
  isRefining,
  onChange,
  onFileDiscovery,
  onImplementationPlanning,
  onParallelRefineRequest,
  onRefinedRequestChange,
  onRefineRequest,
  onSkipToFileDiscovery,
  onUseOriginalRequest,
  onUseRefinedRequest,
  refinedRequest,
  settings,
  stepData,
  value,
  ...props
}: StepOrchestratorProps) => {
  const orchestratorTestId = generateTestId('feature', 'form');

  return (
    <div className={cn('space-y-6', className)} data-testid={orchestratorTestId} {...props}>
      {/* Step 1: Feature Request Refinement */}
      <Conditional isCondition={currentStep === 1}>
        <StepOne
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
      </Conditional>

      {/* Step 2: File Discovery */}
      <Conditional isCondition={currentStep === 2}>
        <StepTwo
          discoverySession={discoverySession}
          onFileAdded={() => {}}
          onFileDiscovery={onFileDiscovery}
          onFileSelection={() => {}}
          selectedFiles={stepData.step2?.selectedFiles}
        />
      </Conditional>

      {/* Step 3: Implementation Planning */}
      <Conditional isCondition={currentStep === 3}>
        <StepThree
          implementationPlan={stepData.step3?.implementationPlan}
          onImplementationPlanning={onImplementationPlanning}
          validationCommands={stepData.step3?.validationCommands}
        />
      </Conditional>
    </div>
  );
};
