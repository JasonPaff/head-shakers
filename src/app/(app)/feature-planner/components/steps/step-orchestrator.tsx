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
  isGeneratingPlan: boolean;
  isRefining: boolean;
  manualFiles: Array<{
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
  }>;
  onChange: (value: string) => void;
  onFileAdded: (file: {
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
  }) => void;
  onFileDiscovery: () => void;
  onFileSelection: (selectedFiles: Array<string>) => void;
  onImplementationPlanning: () => void;
  onParallelRefineRequest: () => void;
  onRefineRequest: () => void;
  onRemoveManualFile: (filePath: string) => void;
  planId: null | string;
  settings: RefinementSettings;
  stepData: StepData;
  value: string;
}

export const StepOrchestrator = ({
  className,
  currentStep,
  discoverySession,
  isDiscoveringFiles,
  isGeneratingPlan,
  isRefining,
  manualFiles,
  onChange,
  onFileAdded,
  onFileDiscovery,
  onFileSelection,
  onImplementationPlanning,
  onParallelRefineRequest,
  onRefineRequest,
  onRemoveManualFile,
  planId,
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
          manualFiles={manualFiles}
          onFileAdded={onFileAdded}
          onFileDiscovery={onFileDiscovery}
          onFileSelection={onFileSelection}
          onRemoveManualFile={onRemoveManualFile}
          selectedFiles={stepData.step2?.selectedFiles}
        />
      </Conditional>

      {/* Step 3: Implementation Planning */}
      <Conditional isCondition={currentStep === 3}>
        <StepThree
          generationData={stepData.step3}
          isGeneratingPlan={isGeneratingPlan}
          onImplementationPlanning={onImplementationPlanning}
          planId={planId}
        />
      </Conditional>
    </div>
  );
};
