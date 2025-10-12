'use client';

import { parseAsInteger, useQueryState } from 'nuqs';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { WorkflowStep } from '@/app/(app)/feature-planner/components/steps/step-orchestrator';
import type { FeatureRefinement, FileDiscoverySession } from '@/lib/db/schema/feature-planner.schema';
import type {
  RefinementSettings as RefinementSettingsType,
  RefineResponse,
  StepData,
} from '@/lib/validations/feature-planner.validation';

import { ActionControls } from '@/app/(app)/feature-planner/components/action-controls';
import { RefinementResults } from '@/app/(app)/feature-planner/components/refinement-results';
import { RefinementSettings } from '@/app/(app)/feature-planner/components/refinement-settings';
import { StepOrchestrator } from '@/app/(app)/feature-planner/components/steps/step-orchestrator';
import { WorkflowProgress } from '@/app/(app)/feature-planner/components/workflow-progress';
import { PlanViewerClient } from '@/components/feature/feature-planner/plan-viewer-client';
import { PageContent } from '@/components/layout/page-content';
import { Conditional } from '@/components/ui/conditional';

export interface FeaturePlannerState {
  allRefinements: FeatureRefinement[] | null;
  discoverySession: FileDiscoverySession | null;
  isDiscoveringFiles: boolean;
  isGeneratingPlan: boolean;
  isRefining: boolean;
  isSelectingRefinement: boolean;
  manualFiles: Array<{
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
  }>;
  originalRequest: string;
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
    allRefinements: null,
    discoverySession: null,
    isDiscoveringFiles: false,
    isGeneratingPlan: false,
    isRefining: false,
    isSelectingRefinement: false,
    manualFiles: [],
    originalRequest: '',
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
    toast.loading('Refining feature request...', { id: 'single-refine' });

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

      toast.dismiss('single-refine');

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
            // Persist the selection to the backend
            try {
              toast.loading('Saving refinement...', { id: 'save-refinement' });

              const selectResponse = await fetch(
                `/api/feature-planner/${responseData.planId}/select-refinement`,
                {
                  body: JSON.stringify({
                    refinedRequest: refinement.refinedRequest,
                    refinementId: refinement.id,
                  }),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  method: 'POST',
                },
              );

              const selectData = (await selectResponse.json()) as { isSuccess: boolean; message: string };

              toast.dismiss('save-refinement');

              if (selectResponse.ok && selectData.isSuccess) {
                updateState({
                  allRefinements: responseData.refinements,
                  isRefining: false,
                  planId: responseData.planId,
                  refinedRequest: refinement.refinedRequest,
                  selectedRefinementId: refinement.id,
                  stepData: {
                    ...state.stepData,
                    step1: {
                      originalRequest: state.originalRequest,
                      refinements: [
                        {
                          agentId: refinement.agentId,
                          id: refinement.id,
                          refinedRequest: refinement.refinedRequest,
                        },
                      ],
                      selectedRefinement: refinement.refinedRequest,
                    },
                  },
                });
              } else {
                toast.error(selectData.message || 'Failed to save refinement');
                updateState({ isRefining: false });
              }
            } catch (selectError) {
              console.error('Error saving refinement:', selectError);
              toast.dismiss('save-refinement');
              toast.error('Failed to save refinement selection');
              updateState({ isRefining: false });
            }
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
      toast.dismiss('single-refine');
      const errorMessage =
        error instanceof Error ?
          `Refinement failed: ${error.message}`
        : 'An unexpected error occurred during refinement';
      toast.error(errorMessage);
      updateState({ isRefining: false });
    }
  }, [state.originalRequest, state.planId, state.settings, state.stepData, updateState]);

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
            allRefinements: responseData.refinements,
            isRefining: false,
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

  const handleSelectRefinement = useCallback(
    async (refinementId: string, refinedRequest: string) => {
      if (!state.planId) {
        toast.error('Cannot select refinement: Plan ID is missing');
        return;
      }

      updateState({ isSelectingRefinement: true });

      try {
        toast.loading('Selecting refinement...', { id: 'select-refinement' });

        const response = await fetch(`/api/feature-planner/${state.planId}/select-refinement`, {
          body: JSON.stringify({ refinedRequest, refinementId }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        const data = (await response.json()) as { isSuccess: boolean; message: string };

        toast.dismiss('select-refinement');

        if (response.ok && data.isSuccess) {
          toast.success('Refinement selected successfully');
          updateState({
            isSelectingRefinement: false,
            refinedRequest,
            selectedRefinementId: refinementId,
          });
        } else {
          const errorMsg = data.message || 'Failed to select refinement';
          toast.error(errorMsg);
          updateState({ isSelectingRefinement: false });
        }
      } catch (error) {
        console.error('Error selecting refinement:', error);
        toast.dismiss('select-refinement');
        const errorMessage =
          error instanceof Error ?
            `Failed to select refinement: ${error.message}`
          : 'An unexpected error occurred while selecting refinement';
        toast.error(errorMessage);
        updateState({ isSelectingRefinement: false });
      }
    },
    [state.planId, updateState],
  );

  const handleProceedWithRefinedRequest = useCallback(() => {
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
            state.allRefinements?.map((r) => ({
              agentId: r.agentId,
              id: r.id,
              refinedRequest: r.refinedRequest || '',
            })) || [],
          selectedRefinement: state.refinedRequest,
        },
      },
    });
    handleStepChange(2);
  }, [
    handleStepChange,
    state.allRefinements,
    state.originalRequest,
    state.refinedRequest,
    state.stepData,
    updateState,
  ]);

  const handleUseOriginalRequest = useCallback(() => {
    updateState({
      refinedRequest: null,
      selectedRefinementId: null,
      stepData: {
        ...state.stepData,
        step1: {
          originalRequest: state.originalRequest,
          refinements:
            state.allRefinements?.map((r) => ({
              agentId: r.agentId,
              id: r.id,
              refinedRequest: r.refinedRequest || '',
            })) || [],
          selectedRefinement: null,
        },
      },
    });
    handleStepChange(2);
  }, [handleStepChange, state.allRefinements, state.originalRequest, state.stepData, updateState]);

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

    updateState({ isDiscoveringFiles: true });
    toast.loading('Analyzing codebase and discovering relevant files...', { id: 'file-discovery' });

    try {
      const response = await fetch('/api/feature-planner/discover', {
        body: JSON.stringify({
          customModel: state.settings.customModel,
          planId: state.planId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: AbortSignal.timeout(620000), // 12-minute timeout
      });

      const data = (await response.json()) as {
        data?: FileDiscoverySession;
        isSuccess: boolean;
        message: string;
      };

      toast.dismiss('file-discovery');

      if (response.ok && data.isSuccess) {
        toast.success(data.message);

        if (data.data) {
          updateState({
            discoverySession: data.data,
            isDiscoveringFiles: false,
            stepData: {
              ...state.stepData,
              step2: {
                discoveredFiles: data.data.discoveredFiles || [],
                selectedFiles: [],
              },
            },
          });
        } else {
          updateState({ isDiscoveringFiles: false });
        }
      } else {
        toast.error(data.message || 'Failed to discover files');
        updateState({ isDiscoveringFiles: false });
      }
    } catch (error) {
      console.error('File discovery error:', error);
      toast.dismiss('file-discovery');
      toast.error('Failed to discover files');
      updateState({ isDiscoveringFiles: false });
    }
  }, [state.planId, state.settings.customModel, state.stepData, updateState]);

  const handleFileSelection = useCallback(
    (selectedFiles: string[]) => {
      updateState({
        stepData: {
          ...state.stepData,
          step2: {
            ...state.stepData.step2,
            discoveredFiles: state.stepData.step2?.discoveredFiles || [],
            selectedFiles,
          },
        },
      });
    },
    [state.stepData, updateState],
  );

  const handleFileAdded = useCallback(
    (file: { description: string; filePath: string; priority: 'critical' | 'high' | 'low' | 'medium' }) => {
      updateState({
        manualFiles: [...state.manualFiles, file],
      });
      toast.success('File added manually');
    },
    [state.manualFiles, updateState],
  );

  const handleRemoveManualFile = useCallback(
    (filePath: string) => {
      updateState({
        manualFiles: state.manualFiles.filter((f) => f.filePath !== filePath),
      });
      toast.success('File removed');
    },
    [state.manualFiles, updateState],
  );

  const handleImplementationPlanning = useCallback(async () => {
    if (!state.planId) {
      toast.error('Please complete step 1 first - plan ID is missing');
      return;
    }

    if (!state.stepData.step2) {
      toast.error('Please complete step 2 first');
      return;
    }

    updateState({ isGeneratingPlan: true });
    toast.loading('Generating implementation plan...', { id: 'plan-generation' });

    try {
      const response = await fetch('/api/feature-planner/plan', {
        body: JSON.stringify({
          customModel: state.settings.customModel,
          planId: state.planId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: AbortSignal.timeout(620000), // 12-minute timeout
      });

      const data = (await response.json()) as {
        data?: {
          completionTokens?: number;
          estimatedDuration?: string;
          executionTimeMs?: number;
          id?: string;
          implementationPlan?: string;
          promptTokens?: number;
          status?: string;
          steps?: Array<{
            commands: string[];
            description: string;
            title: string;
            validationCommands: string[];
          }>;
          totalTokens?: number;
        };
        message: string;
        success: boolean;
      };

      console.log('[Plan Generation] Response received:', {
        dataPresent: !!data.data,
        generationId: data.data?.id,
        planId: state.planId,
        status: data.data?.status,
        success: data.success,
      });

      toast.dismiss('plan-generation');

      if (response.ok && data.success) {
        toast.success(data.message);

        if (data.data) {
          const validationCommands =
            data.data.steps?.flatMap((step) => step.validationCommands).filter(Boolean) || [];

          const step3Data = {
            completionTokens: data.data.completionTokens,
            estimatedDuration: data.data.estimatedDuration,
            executionTimeMs: data.data.executionTimeMs,
            generationId: data.data.id,
            implementationPlan: data.data.implementationPlan || '',
            promptTokens: data.data.promptTokens,
            status: data.data.status,
            totalTokens: data.data.totalTokens,
            validationCommands,
          };

          console.log('[Plan Generation] Updating state with step3 data:', step3Data);

          updateState({
            isGeneratingPlan: false,
            stepData: {
              ...state.stepData,
              step3: step3Data,
            },
          });

          console.log('[Plan Generation] State update complete');
        } else {
          console.error('[Plan Generation] No data in response');
          updateState({ isGeneratingPlan: false });
        }
      } else {
        console.error('[Plan Generation] Request failed:', data);
        toast.error(data.message || 'Failed to generate implementation plan');
        updateState({ isGeneratingPlan: false });
      }
    } catch (error) {
      console.error('[Plan Generation] Exception caught:', error);
      toast.dismiss('plan-generation');
      toast.error('Failed to generate implementation plan');
      updateState({ isGeneratingPlan: false });
    }
  }, [state.planId, state.settings.customModel, state.stepData, updateState]);

  const shouldShowRefinementResults =
    currentStep === 1 && !!state.allRefinements && state.allRefinements.length > 0;

  const shouldShowPlanViewer =
    currentStep === 3 && !!state.stepData.step3?.generationId && !!state.planId && !state.isGeneratingPlan;

  // Debug logging for plan viewer condition
  console.log('[Plan Viewer] Conditional check:', {
    currentStep,
    generationId: state.stepData.step3?.generationId,
    isGeneratingPlan: state.isGeneratingPlan,
    planId: state.planId,
    shouldShowPlanViewer,
    step3Data: state.stepData.step3,
  });

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
          isDiscoveringFiles={state.isDiscoveringFiles}
          isGeneratingPlan={state.isGeneratingPlan}
          isRefining={state.isRefining}
          manualFiles={state.manualFiles}
          onChange={(value) => {
            updateState({ originalRequest: value });
          }}
          onFileAdded={handleFileAdded}
          onFileDiscovery={handleFileDiscovery}
          onFileSelection={handleFileSelection}
          onImplementationPlanning={handleImplementationPlanning}
          onParallelRefineRequest={handleParallelRefineRequest}
          onRefineRequest={handleRefineRequest}
          onRemoveManualFile={handleRemoveManualFile}
          planId={state.planId}
          settings={state.settings}
          stepData={state.stepData}
          value={state.originalRequest}
        />

        {/* Unified Refinement Results */}
        <Conditional isCondition={shouldShowRefinementResults}>
          <RefinementResults
            isSelectingRefinement={state.isSelectingRefinement}
            onProceedToNextStep={handleProceedWithRefinedRequest}
            onSelectRefinement={handleSelectRefinement}
            onUseOriginal={handleUseOriginalRequest}
            originalRequest={state.originalRequest}
            refinements={state.allRefinements || []}
            selectedRefinementId={state.selectedRefinementId || undefined}
          />
        </Conditional>

        {/* Plan Viewer (Step 3) - Client Component */}
        <Conditional isCondition={shouldShowPlanViewer}>
          <PlanViewerClient planId={state.planId!} />
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
