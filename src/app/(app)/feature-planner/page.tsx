'use client';

import { parseAsInteger, useQueryState } from 'nuqs';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type {
  ParallelRefinementResponse,
  RefinementSettings as RefinementSettingsType,
  RefineResponse,
  StepData,
} from '@/lib/validations/feature-planner.validation';

import { ActionControls } from '@/app/(app)/feature-planner/components/action-controls';
import { RefinementSettings } from '@/app/(app)/feature-planner/components/refinement-settings';
import { RequestInput } from '@/app/(app)/feature-planner/components/request-input';
import {
  StepOrchestrator,
  type WorkflowStep,
} from '@/app/(app)/feature-planner/components/steps/step-orchestrator';
import { WorkflowProgress } from '@/app/(app)/feature-planner/components/workflow-progress';
import { PageContent } from '@/components/layout/page-content';
import { Conditional } from '@/components/ui/conditional';

export interface FeaturePlannerState {
  originalRequest: string;
  parallelResults: null | ParallelRefinementResponse;
  refinedRequest: null | string;
  settings: RefinementSettingsType;
  stepData: StepData;
}

export default function FeaturePlannerPage() {
  const [currentStep, setCurrentStep] = useQueryState(
    'step',
    parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
  );

  const [state, setState] = useState<FeaturePlannerState>({
    originalRequest: '',
    parallelResults: null,
    refinedRequest: null,
    settings: {
      agentCount: 3,
      includeProjectContext: true,
      maxOutputLength: 250,
      minOutputLength: 150,
    },
    stepData: {},
  });

  const updateState = useCallback((updates: Partial<FeaturePlannerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleRefineRequest = useCallback(async () => {}, []);

  const handleParallelRefineRequest = useCallback(async () => {
    if (!state.originalRequest.trim()) {
      toast.error('Please enter a feature request');
      return;
    }

    try {
      const response = await fetch('/api/feature-planner/refine', {
        body: JSON.stringify({
          featureRequest: state.originalRequest,
          settings: state.settings,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const data = (await response.json()) as RefineResponse;

      if (response.ok && data.isSuccess) {
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to refine feature request');
      }
    } catch (error) {
      console.error('Error refining feature request:', error);
      toast.error('An unexpected error occurred');
    }
  }, [state.originalRequest, state.settings]);

  const handleStepChange = useCallback(
    (step: WorkflowStep) => {
      if (step === 2 && !state.originalRequest) return;
      if (step === 3 && !state.stepData.step1) return;
      void setCurrentStep(step);
    },
    [state.originalRequest, state.stepData.step1, setCurrentStep],
  );

  const handleSkipToFileDiscovery = useCallback(() => {
    handleStepChange(2);
  }, [handleStepChange]);

  const handleUseRefinedRequest = useCallback(() => {
    handleStepChange(2);
  }, [handleStepChange]);

  const handleUseOriginalRequest = useCallback(() => {
    updateState({ refinedRequest: null });
    handleStepChange(2);
  }, [handleStepChange, updateState]);

  const handleRefinedRequestChange = useCallback(
    (refinedRequest: string) => {
      updateState({ refinedRequest });
    },
    [updateState],
  );

  const handleSettingsChange = useCallback(
    (settings: RefinementSettingsType) => {
      updateState({ settings });
    },
    [updateState],
  );

  const _shouldShowFullWidthParallelResults = currentStep === 1 && !!state.parallelResults;

  return (
    <PageContent>
      <WorkflowProgress currentStep={currentStep as WorkflowStep} />

      <div className={'mt-8 space-y-8'}>
        {/* Refinement Settings */}
        <RefinementSettings onSettingsChange={handleSettingsChange} settings={state.settings} />

        <Conditional
          fallback={
            <div className={'grid grid-cols-1 gap-8 lg:grid-cols-2'}>
              {/* Parallel Results */}
              <div className={'space-y-6'}>
                <StepOrchestrator
                  currentStep={currentStep as WorkflowStep}
                  isRefining={false}
                  onChange={(value) => {
                    updateState({ originalRequest: value });
                  }}
                  onParallelRefineRequest={handleParallelRefineRequest}
                  onRefinedRequestChange={handleRefinedRequestChange}
                  onRefineRequest={handleRefineRequest}
                  onSkipToFileDiscovery={handleSkipToFileDiscovery}
                  onUseOriginalRequest={handleUseOriginalRequest}
                  onUseRefinedRequest={handleUseRefinedRequest}
                  refinedRequest={state.refinedRequest}
                  settings={state.settings}
                  stepData={state.stepData}
                  value={state.originalRequest}
                />
              </div>
            </div>
          }
          isCondition={_shouldShowFullWidthParallelResults}
        >
          {/* Request Input */}
          <div className={'space-y-6'}>
            <RequestInput
              isRefining={false}
              onChange={(value) => {
                updateState({ originalRequest: value });
              }}
              onParallelRefineRequest={() => {}}
              onRefinedRequestChange={handleRefinedRequestChange}
              onRefineRequest={handleRefineRequest}
              onSkipToFileDiscovery={handleSkipToFileDiscovery}
              onUseOriginalRequest={handleUseOriginalRequest}
              onUseRefinedRequest={handleUseRefinedRequest}
              refinedRequest={state.refinedRequest}
              settings={state.settings}
              value={state.originalRequest}
            />
          </div>
        </Conditional>
      </div>

      {/* Action Controls */}
      <ActionControls
        canProceed={state.originalRequest.length > 0}
        currentStep={currentStep as WorkflowStep}
        onStepChange={handleStepChange}
      />
    </PageContent>
  );
}
