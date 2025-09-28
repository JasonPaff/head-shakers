'use client';

import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useCallback, useState } from 'react';

import type {
  ParallelRefinementResponse,
  RefinementSettings as RefinementSettingsType,
  StepData,
} from '@/lib/validations/feature-planner.validation';

import { ActionControls } from '@/app/(app)/feature-planner/components/action-controls';
import { RefinementComparison } from '@/app/(app)/feature-planner/components/refinement-comparison';
import { RefinementSettings } from '@/app/(app)/feature-planner/components/refinement-settings';
import { RequestInput } from '@/app/(app)/feature-planner/components/request-input';
import { StreamingPanel } from '@/app/(app)/feature-planner/components/streaming-panel';
import { WorkflowProgress } from '@/app/(app)/feature-planner/components/workflow-progress';
import { PageContent } from '@/components/layout/page-content';
import { Conditional } from '@/components/ui/conditional';
import { useServerAction } from '@/hooks/use-server-action';
import { refineFeatureRequestAction } from '@/lib/actions/feature-planner/feature-planner.actions';

export interface FeaturePlannerState {
  isSettingsExpanded: boolean;
  originalRequest: string;
  parallelResults: null | ParallelRefinementResponse;
  refinedRequest: null | string;
  settings: RefinementSettingsType;
  stepData: StepData;
}

export type WorkflowStep = 1 | 2 | 3;

/**
 * Enhanced feature planner with URL state management and modular step architecture
 */
export default function FeaturePlannerPage() {
  // URL state management with nuqs
  const [currentStep, setCurrentStep] = useQueryState(
    'step',
    parseAsInteger.withDefault(1).withOptions({ history: 'push' })
  );
  const [selectedAgentId, setSelectedAgentId] = useQueryState(
    'agent',
    parseAsString.withOptions({ history: 'push' })
  );

  // Local component state
  const [state, setState] = useState<FeaturePlannerState>({
    isSettingsExpanded: false,
    originalRequest: '',
    parallelResults: null,
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

  /**
   * Updates local state with partial updates
   */
  const updateState = useCallback((updates: Partial<FeaturePlannerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
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
    updateState({
      parallelResults: null,
      refinedRequest: null,
    });
    void setSelectedAgentId(null);

    await executeAsync({
      originalRequest: state.originalRequest,
      settings: {
        agentCount: state.settings.agentCount,
        includeProjectContext: state.settings.includeProjectContext,
        maxOutputLength: state.settings.maxOutputLength,
      },
    });
  }, [executeAsync, state.originalRequest, state.settings, updateState, setSelectedAgentId]);

  /**
   * Handles agent selection with URL state sync
   */
  const handleSelectRefinement = useCallback((agentId: string) => {
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
  }, [state.parallelResults, state.originalRequest, state.stepData, updateState, setSelectedAgentId]);

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

  /**
   * Handles step navigation with validation
   */
  const handleStepChange = useCallback((step: WorkflowStep) => {
    // Validate step transition
    if (step === 2 && !state.originalRequest) {
      return; // Can't go to step 2 without a request
    }
    if (step === 3 && !state.stepData.step1) {
      return; // Can't go to step 3 without completing step 1
    }

    void setCurrentStep(step);
  }, [state.originalRequest, state.stepData.step1, setCurrentStep]);

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

  const handleRefinedRequestChange = useCallback((refinedRequest: string) => {
    updateState({ refinedRequest });
  }, [updateState]);

  const handleSettingsChange = useCallback((settings: RefinementSettingsType) => {
    updateState({ settings });
  }, [updateState]);

  const handleToggleSettings = useCallback(() => {
    updateState({ isSettingsExpanded: !state.isSettingsExpanded });
  }, [state.isSettingsExpanded, updateState]);

  const shouldShowFullWidthParallelResults = currentStep === 1 && state.parallelResults;

  return (
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

      {/* Main Content Area */}
      <div className={'mt-8 space-y-8'}>
        {/* Settings Panel */}
        <RefinementSettings
          isExpanded={state.isSettingsExpanded}
          onSettingsChange={handleSettingsChange}
          onToggleExpanded={handleToggleSettings}
          settings={state.settings}
        />

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
              progress={[]}
            />
          </div>
        : <div className={'grid grid-cols-1 gap-8 lg:grid-cols-2'}>
            {/* Left Panel - Step Content */}
            <div className={'space-y-6'}>
              {/* Step 1 */}
              <Conditional isCondition={currentStep === 1}>
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
              </Conditional>

              {/* Step 2 */}
              <Conditional isCondition={currentStep === 2}>
                <div className={'rounded-lg border p-6'}>
                  <h2 className={'mb-4 text-xl font-semibold'}>Step 2: File Discovery</h2>
                  <p className={'text-muted-foreground'}>File discovery implementation coming in Phase 2</p>
                </div>
              </Conditional>

              {/* Step 3 */}
              <Conditional isCondition={currentStep === 3}>
                <div className={'rounded-lg border p-6'}>
                  <h2 className={'mb-4 text-xl font-semibold'}>Step 3: Implementation Planning</h2>
                  <p className={'text-muted-foreground'}>Implementation planning coming in Phase 2</p>
                </div>
              </Conditional>
            </div>

            {/* Right Panel - Streaming Updates */}
            <div>
              <StreamingPanel
                currentStep={currentStep as WorkflowStep}
                hasError={!!result.serverError}
                isActive={isExecuting}
                progress={[]}
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
    </PageContent>
  );
}
