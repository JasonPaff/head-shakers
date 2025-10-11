'use client';

import { parseAsInteger, useQueryState } from 'nuqs';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { WorkflowStep } from '@/app/(app)/feature-planner/components/steps/step-orchestrator';
import type {
  FeatureRefinement,
  FileDiscoverySession,
} from '@/lib/db/schema/feature-planner.schema';
import type {
  RefinementSettings as RefinementSettingsType,
  RefineResponse,
  StepData,
} from '@/lib/validations/feature-planner.validation';

import { ActionControls } from '@/app/(app)/feature-planner/components/action-controls';
import { ParallelRefinementResults } from '@/app/(app)/feature-planner/components/parallel-refinement-results';
import { RefinementSettings } from '@/app/(app)/feature-planner/components/refinement-settings';
import { StepOrchestrator } from '@/app/(app)/feature-planner/components/steps/step-orchestrator';
import { WorkflowProgress } from '@/app/(app)/feature-planner/components/workflow-progress';
import { PageContent } from '@/components/layout/page-content';
import { Conditional } from '@/components/ui/conditional';

export interface FeaturePlannerState {
  discoverySession: FileDiscoverySession | null;
  isRefining: boolean;
  originalRequest: string;
  parallelResults: FeatureRefinement[] | null;
  planId: null | string;
  refinedRequest: null | string;
  selectedRefinementId: null | string;
  settings: RefinementSettingsType;
  stepData: StepData;
}

export default function FeaturePlannerPage() {
  const [currentStep, setCurrentStep] = useQueryState(
    'step',
    parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
  );

  const [state, setState] = useState<FeaturePlannerState>({
    discoverySession: null,
    isRefining: false,
    originalRequest: '',
    parallelResults: null,
    planId: null,
    refinedRequest: null,
    selectedRefinementId: null,
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

  const handleRefineRequest = useCallback(async () => {
    if (!state.originalRequest.trim()) {
      toast.error('Please enter a feature request');
      return;
    }

    updateState({ isRefining: true });

    try {
      const response = await fetch('/api/feature-planner/refine', {
        body: JSON.stringify({
          featureRequest: state.originalRequest,
          planId: state.planId,
          settings: {
            ...state.settings,
            agentCount: 1, // Single refinement
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const data = (await response.json()) as RefineResponse;

      if (response.ok && data.isSuccess) {
        toast.success(data.message);
        // Store the refinement data in state
        if (data.data) {
          const responseData = data.data as {
            planId: string;
            refinements: FeatureRefinement[];
          };

          // For single refinement, automatically set as the refined request
          const refinement = responseData.refinements[0];
          if (refinement?.refinedRequest) {
            updateState({
              isRefining: false,
              planId: responseData.planId,
              refinedRequest: refinement.refinedRequest,
              selectedRefinementId: refinement.id,
            });
          } else {
            toast.error('Refinement completed but no result received');
            updateState({ isRefining: false });
          }
        }
      } else {
        toast.error(data.message || 'Failed to refine feature request');
        updateState({ isRefining: false });
      }
    } catch (error) {
      console.error('Error in single refinement:', error);
      const errorMessage =
        error instanceof Error ? `Refinement failed: ${error.message}` : 'An unexpected error occurred during refinement';
      toast.error(errorMessage);
      updateState({ isRefining: false });
    }
  }, [state.originalRequest, state.planId, state.settings, updateState]);

  const handleParallelRefineRequest = useCallback(async () => {
    if (!state.originalRequest.trim()) {
      toast.error('Please enter a feature request');
      return;
    }

    updateState({ isRefining: true });
    toast.loading(`Starting ${state.settings.agentCount} parallel refinements...`, { id: 'parallel-refine' });

    try {
      const response = await fetch('/api/feature-planner/refine', {
        body: JSON.stringify({
          featureRequest: state.originalRequest,
          planId: state.planId,
          settings: state.settings,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const data = (await response.json()) as RefineResponse;

      toast.dismiss('parallel-refine');

      if (response.ok && data.isSuccess) {
        toast.success(data.message);
        // Store the refinement data in state
        if (data.data) {
          const responseData = data.data as {
            planId: string;
            refinements: FeatureRefinement[];
          };

          const completedCount = responseData.refinements.filter((r) => r.status === 'completed').length;
          const failedCount = responseData.refinements.filter((r) => r.status === 'failed').length;

          if (failedCount > 0) {
            toast.warning(`${completedCount} refinements succeeded, ${failedCount} failed`);
          }

          updateState({
            isRefining: false,
            parallelResults: responseData.refinements,
            planId: responseData.planId,
            stepData: {
              ...state.stepData,
              step1: {
                originalRequest: state.originalRequest,
                refinements: responseData.refinements.map((r) => ({
                  agentId: r.agentId,
                  id: r.id,
                  refinedRequest: r.refinedRequest || '',
                })),
                selectedRefinement: null,
              },
            },
          });
        }
      } else {
        const errorMsg = data.message || 'Failed to refine feature request';
        toast.error(errorMsg);
        updateState({ isRefining: false });
      }
    } catch (error) {
      console.error('Error in parallel refinement:', error);
      toast.dismiss('parallel-refine');
      const errorMessage =
        error instanceof Error ?
          `Parallel refinement failed: ${error.message}`
        : 'An unexpected error occurred during parallel refinement';
      toast.error(errorMessage);
      updateState({ isRefining: false });
    }
  }, [state.originalRequest, state.planId, state.settings, state.stepData, updateState]);

  const handleStepChange = useCallback(
    (step: WorkflowStep) => {
      if (step === 2 && !state.originalRequest) return;
      if (step === 3 && !state.stepData.step1) return;
      void setCurrentStep(step);
    },
    [state.originalRequest, state.stepData.step1, setCurrentStep],
  );

  const handleSkipToFileDiscovery = useCallback(() => {
    // Mark step 1 as complete with original request
    updateState({
      stepData: {
        ...state.stepData,
        step1: {
          originalRequest: state.originalRequest,
          refinements: [],
          selectedRefinement: null,
        },
      },
    });
    handleStepChange(2);
  }, [handleStepChange, state.originalRequest, state.stepData, updateState]);

  const handleSelectRefinement = useCallback(
    async (refinementId: string, refinedRequest: string) => {
      if (!state.planId) {
        toast.error('Cannot select refinement: Plan ID is missing');
        return;
      }

      try {
        toast.loading('Selecting refinement...', { id: 'select-refinement' });

        const response = await fetch(`/api/feature-planner/${state.planId}/select-refinement`, {
          body: JSON.stringify({ refinementId }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        const data = (await response.json()) as { message: string; success: boolean };

        toast.dismiss('select-refinement');

        if (response.ok && data.success) {
          toast.success('Refinement selected successfully');
          updateState({
            refinedRequest,
            selectedRefinementId: refinementId,
          });
        } else {
          const errorMsg = data.message || 'Failed to select refinement';
          toast.error(errorMsg);
        }
      } catch (error) {
        console.error('Error selecting refinement:', error);
        toast.dismiss('select-refinement');
        const errorMessage =
          error instanceof Error ?
            `Failed to select refinement: ${error.message}`
          : 'An unexpected error occurred while selecting refinement';
        toast.error(errorMessage);
      }
    },
    [state.planId, updateState],
  );

  const handleUseRefinedRequest = useCallback(() => {
    if (!state.refinedRequest) {
      toast.error('Please select a refinement first');
      return;
    }

    // Ensure step 1 is marked complete before moving to step 2
    updateState({
      stepData: {
        ...state.stepData,
        step1: {
          originalRequest: state.originalRequest,
          refinements:
            state.parallelResults?.map((r) => ({
              agentId: r.agentId,
              id: r.id,
              refinedRequest: r.refinedRequest || '',
            })) || [],
          selectedRefinement: state.refinedRequest,
        },
      },
    });
    handleStepChange(2);
  }, [handleStepChange, state.originalRequest, state.parallelResults, state.refinedRequest, state.stepData, updateState]);

  const handleUseOriginalRequest = useCallback(() => {
    updateState({
      refinedRequest: null,
      selectedRefinementId: null,
      stepData: {
        ...state.stepData,
        step1: {
          originalRequest: state.originalRequest,
          refinements:
            state.parallelResults?.map((r) => ({
              agentId: r.agentId,
              id: r.id,
              refinedRequest: r.refinedRequest || '',
            })) || [],
          selectedRefinement: null,
        },
      },
    });
    handleStepChange(2);
  }, [handleStepChange, state.originalRequest, state.parallelResults, state.stepData, updateState]);

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

  const handleFileDiscovery = useCallback(async () => {
    if (!state.planId) {
      toast.error('Please complete step 1 first - plan ID is missing');
      return;
    }

    if (!state.stepData.step1?.originalRequest) {
      toast.error('Please complete step 1 first');
      return;
    }

    try {
      toast.info('Starting file discovery...');

      const response = await fetch('/api/feature-planner/discover', {
        body: JSON.stringify({
          customModel: state.settings.customModel,
          planId: state.planId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const data = (await response.json()) as {
        data?: FileDiscoverySession;
        message: string;
        success: boolean;
      };

      if (response.ok && data.success) {
        toast.success(data.message);

        if (data.data) {
          updateState({
            discoverySession: data.data,
            stepData: {
              ...state.stepData,
              step2: {
                discoveredFiles: data.data.discoveredFiles || [],
                selectedFiles: [],
              },
            },
          });
        }
      } else {
        toast.error(data.message || 'Failed to discover files');
      }
    } catch (error) {
      console.error('File discovery error:', error);
      toast.error('Failed to discover files');
    }
  }, [state.planId, state.settings.customModel, state.stepData, updateState]);

  const handleImplementationPlanning = useCallback(async () => {
    if (!state.planId) {
      toast.error('Please complete step 1 first - plan ID is missing');
      return;
    }

    if (!state.stepData.step2) {
      toast.error('Please complete step 2 first');
      return;
    }

    try {
      toast.info('Generating implementation plan...');

      const response = await fetch('/api/feature-planner/plan', {
        body: JSON.stringify({
          customModel: state.settings.customModel,
          planId: state.planId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const data = (await response.json()) as {
        data?: {
          implementationPlan?: string;
          steps?: Array<{
            commands: string[];
            description: string;
            title: string;
            validationCommands: string[];
          }>;
        };
        message: string;
        success: boolean;
      };

      if (response.ok && data.success) {
        toast.success(data.message);

        if (data.data) {
          const validationCommands =
            data.data.steps?.flatMap((step) => step.validationCommands).filter(Boolean) || [];

          updateState({
            stepData: {
              ...state.stepData,
              step3: {
                implementationPlan: data.data.implementationPlan || '',
                validationCommands,
              },
            },
          });
        }
      } else {
        toast.error(data.message || 'Failed to generate implementation plan');
      }
    } catch (error) {
      console.error('Implementation planning error:', error);
      toast.error('Failed to generate implementation plan');
    }
  }, [state.planId, state.settings.customModel, state.stepData, updateState]);

  const _shouldShowParallelResults =
    currentStep === 1 && !!state.parallelResults && state.parallelResults.length > 0;

  return (
    <PageContent>
      <WorkflowProgress currentStep={currentStep as WorkflowStep} />

      <div className={'mt-8 space-y-8'}>
        {/* Refinement Settings */}
        <RefinementSettings onSettingsChange={handleSettingsChange} settings={state.settings} />

        {/* Step Orchestrator */}
        <StepOrchestrator
          currentStep={currentStep as WorkflowStep}
          discoverySession={state.discoverySession}
          isRefining={state.isRefining}
          onChange={(value) => {
            updateState({ originalRequest: value });
          }}
          onFileDiscovery={handleFileDiscovery}
          onImplementationPlanning={handleImplementationPlanning}
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

        {/* Parallel Refinement Results */}
        <Conditional isCondition={_shouldShowParallelResults}>
          <ParallelRefinementResults
            onSelectRefinement={handleSelectRefinement}
            onUseOriginal={handleUseOriginalRequest}
            refinements={state.parallelResults || []}
            selectedRefinementId={state.selectedRefinementId || undefined}
          />
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
