'use client';

import { Realtime } from 'ably';
import { AblyProvider } from 'ably/react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useCallback, useMemo, useState } from 'react';

import type { ProgressEntry } from '@/app/(app)/feature-planner/types/streaming';
import type {
  ParallelRefinementResponse,
  RefinementSettings as RefinementSettingsType,
  StepData,
} from '@/lib/validations/feature-planner.validation';

import { ActionControls } from '@/app/(app)/feature-planner/components/action-controls';
import { RefinementComparison } from '@/app/(app)/feature-planner/components/refinement-comparison';
import { RefinementSettings } from '@/app/(app)/feature-planner/components/refinement-settings';
import { RequestInput } from '@/app/(app)/feature-planner/components/request-input';
import { ResilienceWrapper } from '@/app/(app)/feature-planner/components/resilience-wrapper';
import {
  StepOrchestrator,
  type WorkflowStep,
} from '@/app/(app)/feature-planner/components/steps/step-orchestrator';
import { StreamingPanel } from '@/app/(app)/feature-planner/components/streaming-panel';
import { WorkflowProgress } from '@/app/(app)/feature-planner/components/workflow-progress';
import { PageContent } from '@/components/layout/page-content';
import { Conditional } from '@/components/ui/conditional';
import { useServerAction } from '@/hooks/use-server-action';
import { refineFeatureRequestAction } from '@/lib/actions/feature-planner/feature-planner.actions';

export interface FeaturePlannerState {
  originalRequest: string;
  parallelResults: null | ParallelRefinementResponse;
  progress: Array<ProgressEntry>;
  refinedRequest: null | string;
  settings: RefinementSettingsType;
  stepData: StepData;
}

export default function FeaturePlannerPage() {
  const [currentStep, setCurrentStep] = useQueryState(
    'step',
    parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
  );
  const [selectedAgentId, setSelectedAgentId] = useQueryState(
    'agent',
    parseAsString.withOptions({ history: 'push' }),
  );

  const sessionId = useMemo(
    () => `feature-planner-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    [],
  );

  const ablyClient = useMemo(() => new Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY || '' }), []);

  const [state, setState] = useState<FeaturePlannerState>({
    originalRequest: '',
    parallelResults: null,
    progress: [],
    refinedRequest: null,
    settings: {
      agentCount: 3,
      includeProjectContext: true,
      maxOutputLength: 250,
    },
    stepData: {},
  });

  const { executeAsync, isExecuting, result } = useServerAction(refineFeatureRequestAction, {
    isDisableToast: true,
    onSuccess: ({ data }) => {
      if ('refinedRequest' in data) {
        updateState({
          refinedRequest: data.refinedRequest,
        });
      } else if ('results' in data) {
        updateState({
          parallelResults: data,
        });
      }
    },
  });

  const updateState = useCallback((updates: Partial<FeaturePlannerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const addProgressEntry = useCallback((entry: Omit<ProgressEntry, 'id' | 'timestamp'>) => {
    const newEntry: ProgressEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      progress: [...prev.progress, newEntry],
    }));
  }, []);

  const clearProgress = useCallback(() => {
    setState((prev) => ({ ...prev, progress: [] }));
  }, []);

  const handleRefineRequest = useCallback(async () => {
    await executeAsync({
      originalRequest: state.originalRequest,
      settings: {
        agentCount: state.settings.agentCount,
        includeProjectContext: state.settings.includeProjectContext,
        maxOutputLength: state.settings.maxOutputLength,
      },
    });
  }, [executeAsync, state.originalRequest, state.settings]);

  const handleParallelRefineRequest = useCallback(async () => {
    // clear previous state and progress
    updateState({
      parallelResults: null,
      refinedRequest: null,
    });
    clearProgress();
    void setSelectedAgentId(null);

    // add initial progress entry
    addProgressEntry({
      message: `Starting parallel refinement with ${state.settings.agentCount} agents...`,
      type: 'info',
    });

    try {
      await executeAsync({
        originalRequest: state.originalRequest,
        settings: {
          agentCount: state.settings.agentCount,
          includeProjectContext: state.settings.includeProjectContext,
          maxOutputLength: state.settings.maxOutputLength,
        },
      });

      addProgressEntry({
        message: 'Parallel refinement completed successfully',
        type: 'success',
      });
    } catch (error) {
      addProgressEntry({
        message: `Refinement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
      throw error;
    }
  }, [
    executeAsync,
    state.originalRequest,
    state.settings,
    updateState,
    setSelectedAgentId,
    clearProgress,
    addProgressEntry,
  ]);

  const handleRetryOperation = useCallback(() => {
    if (isExecuting) return;

    addProgressEntry({
      message: 'Retrying refinement operation...',
      type: 'info',
    });

    void handleParallelRefineRequest();
  }, [isExecuting, addProgressEntry, handleParallelRefineRequest]);

  const handleSelectRefinement = useCallback(
    (agentId: string) => {
      const selectedResult = state.parallelResults?.results.find((r) => r.agentId === agentId);
      if (selectedResult && selectedResult.isSuccess) {
        updateState({
          refinedRequest: selectedResult.refinedRequest,
          stepData: {
            ...state.stepData,
            step1: {
              originalRequest: state.originalRequest,
              parallelResults: state.parallelResults || undefined,
              refinedRequest: selectedResult.refinedRequest,
              selectedAgentId: agentId,
            },
          },
        });
        void setSelectedAgentId(agentId);
      }
    },
    [state.parallelResults, state.originalRequest, state.stepData, updateState, setSelectedAgentId],
  );

  const handleUseOriginalFromComparison = useCallback(() => {
    updateState({
      refinedRequest: null,
      stepData: {
        ...state.stepData,
        step1: {
          originalRequest: state.originalRequest,
          parallelResults: state.parallelResults || undefined,
          refinedRequest: state.originalRequest,
          selectedAgentId: 'original',
        },
      },
    });
    void setSelectedAgentId('original');
  }, [state.originalRequest, state.stepData, state.parallelResults, updateState, setSelectedAgentId]);

  const handleStepChange = useCallback(
    (step: WorkflowStep) => {
      // validate step transition
      if (step === 2 && !state.originalRequest) {
        return; // can't go to step 2 without a request
      }
      if (step === 3 && !state.stepData.step1) {
        return; // can't go to step 3 without completing step 1
      }

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

  const shouldShowFullWidthParallelResults = currentStep === 1 && state.parallelResults;

  return (
    <AblyProvider client={ablyClient}>
      <PageContent>
        {/* Header */}
        <div className={'mb-8'}>
          <h1 className={'text-3xl font-bold'}>Feature Planner</h1>
          <p className={'mt-2 text-muted-foreground'}>
            Interactive web interface for the sophisticated 3-step feature planning orchestration system
          </p>
        </div>

        {/* Progress Indicator */}
        <WorkflowProgress currentStep={currentStep as WorkflowStep} />

        {/* Resilience Wrapper for Error Boundaries and Connection Monitoring */}
        <ResilienceWrapper onRetry={handleRetryOperation}>
          {/* Main Content Area */}
          <div className={'mt-8 space-y-8'}>
            {/* Settings Panel */}
            <RefinementSettings onSettingsChange={handleSettingsChange} settings={state.settings} />

            {/* Conditional Layout */}
            {shouldShowFullWidthParallelResults ?
              <div className={'space-y-6'}>
                <RequestInput
                  isRefining={isExecuting}
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
                  value={state.originalRequest}
                />

                {/* Refinement Results */}
                <Conditional isCondition={!!state.parallelResults}>
                  <RefinementComparison
                    onSelectRefinement={handleSelectRefinement}
                    onUseOriginal={handleUseOriginalFromComparison}
                    originalRequest={state.originalRequest}
                    results={state.parallelResults?.results || []}
                    selectedAgentId={selectedAgentId}
                  />
                </Conditional>

                {/* Streaming Panel */}
                <StreamingPanel
                  currentStep={currentStep as WorkflowStep}
                  hasError={!!result.serverError}
                  isActive={isExecuting}
                  progress={state.progress}
                  sessionId={sessionId}
                />
              </div>
            : <div className={'grid grid-cols-1 gap-8 lg:grid-cols-2'}>
                {/* Left Panel - Step Content */}
                <div className={'space-y-6'}>
                  <StepOrchestrator
                    currentStep={currentStep as WorkflowStep}
                    isRefining={isExecuting}
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

                {/* Right Panel - Streaming Updates */}
                <div>
                  <StreamingPanel
                    currentStep={currentStep as WorkflowStep}
                    hasError={!!result.serverError}
                    isActive={isExecuting}
                    progress={state.progress}
                    sessionId={sessionId}
                  />
                </div>
              </div>
            }
          </div>

          {/* Action Controls */}
          <ActionControls
            canProceed={state.originalRequest.length > 0}
            currentStep={currentStep as WorkflowStep}
            onStepChange={handleStepChange}
          />
        </ResilienceWrapper>
      </PageContent>
    </AblyProvider>
  );
}
