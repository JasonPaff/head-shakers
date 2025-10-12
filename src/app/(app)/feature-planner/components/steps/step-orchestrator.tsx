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
  isDiscoveringFiles: boolean;
  isRefining: boolean;
  onChange: (value: string) => void;
  onFileDiscovery: () => void;
  onFileSelection: (selectedFiles: string[]) => void;
  onImplementationPlanning: () => void;
  onParallelRefineRequest: () => void;
  onRefineRequest: () => void;
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
  isDiscoveringFiles,
  isRefining,
  onChange,
  onFileDiscovery,
  onFileSelection,
  onImplementationPlanning,
  onParallelRefineRequest,
  onRefineRequest,
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
          onRefineRequest={onRefineRequest}
          settings={settings}
          value={value}
        />
      </Conditional>

      {/* Step 2: File Discovery */}
      <Conditional isCondition={currentStep === 2}>
        <StepTwo
          discoverySession={discoverySession}
          isDiscoveringFiles={isDiscoveringFiles}
          onFileAdded={() => {}}
          onFileDiscovery={onFileDiscovery}
          onFileSelection={onFileSelection}
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
