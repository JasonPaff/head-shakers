'use client';

import { useState } from 'react';

import type {
  ParallelRefinementResponse,
  RefinementSettings as RefinementSettingsType,
} from '@/lib/validations/feature-planner.validation';

import { ActionControls } from '@/app/(app)/feature-planner/components/action-controls';
import { RefinementComparison } from '@/app/(app)/feature-planner/components/refinement-comparison';
import { RefinementSettings } from '@/app/(app)/feature-planner/components/refinement-settings';
import { RequestInput } from '@/app/(app)/feature-planner/components/request-input';
import { StreamingPanel } from '@/app/(app)/feature-planner/components/streaming-panel';
import { WorkflowProgress } from '@/app/(app)/feature-planner/components/workflow-progress';
import { useFeatureRefinement } from '@/app/(app)/feature-planner/hooks/use-feature-refinement';
import { PageContent } from '@/components/layout/page-content';

export interface FeaturePlannerState {
  currentStep: WorkflowStep;
  isSettingsExpanded: boolean;
  originalRequest: string;
  parallelResults: null | ParallelRefinementResponse;
  refinedRequest: null | string;
  selectedAgentId: null | string;
  settings: RefinementSettingsType;
}

export type WorkflowStep = 1 | 2 | 3;

export default function FeaturePlannerPage() {
  const [state, setState] = useState<FeaturePlannerState>({
    currentStep: 1,
    isSettingsExpanded: false,
    originalRequest: '',
    parallelResults: null,
    refinedRequest: null,
    selectedAgentId: null,
    settings: {
      agentCount: 3,
      agentTimeoutMs: 30000,
      includeProjectContext: true,
      maxOutputLength: 250,
      refinementStyle: 'balanced',
      technicalDetailLevel: 'moderate',
    },
  });

  const { error, isRefining, parallelRefineFeatureRequest, progress, refineFeatureRequest } =
    useFeatureRefinement();

  const updateState = (updates: Partial<FeaturePlannerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleRefineRequest = async () => {
    const result = await refineFeatureRequest(state.originalRequest);

    if (result.isSuccess) {
      updateState({
        refinedRequest: result.refinedRequest,
      });
    }
  };

  const handleParallelRefineRequest = async () => {
    const result = await parallelRefineFeatureRequest(state.originalRequest, state.settings);

    if (result.isSuccess && result.response) {
      updateState({
        parallelResults: result.response,
      });
    }
  };

  const handleSelectRefinement = (agentId: string) => {
    const selectedResult = state.parallelResults?.results.find((r) => r.agentId === agentId);
    if (selectedResult && selectedResult.isSuccess) {
      updateState({
        refinedRequest: selectedResult.refinedRequest,
        selectedAgentId: agentId,
      });
    }
  };

  const handleUseOriginalFromComparison = () => {
    updateState({
      refinedRequest: null,
      selectedAgentId: 'original',
    });
  };

  const handleSkipToFileDiscovery = () => {
    updateState({ currentStep: 2 });
  };

  const handleUseRefinedRequest = () => {
    updateState({ currentStep: 2 });
  };

  const handleUseOriginalRequest = () => {
    updateState({ currentStep: 2, refinedRequest: null });
  };

  const handleRefinedRequestChange = (refinedRequest: string) => {
    updateState({ refinedRequest });
  };

  const handleSettingsChange = (settings: RefinementSettingsType) => {
    updateState({ settings });
  };

  const handleToggleSettings = () => {
    updateState({ isSettingsExpanded: !state.isSettingsExpanded });
  };

  const shouldShowFullWidthParallelResults = state.currentStep === 1 && state.parallelResults;

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
      <WorkflowProgress currentStep={state.currentStep} />

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
              isRefining={isRefining}
              onChange={(value) => updateState({ originalRequest: value })}
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
            <RefinementComparison
              onSelectRefinement={handleSelectRefinement}
              onUseOriginal={handleUseOriginalFromComparison}
              originalRequest={state.originalRequest}
              results={state.parallelResults?.results || []}
              selectedAgentId={state.selectedAgentId}
            />

            {/* Streaming Panel */}
            <StreamingPanel
              currentStep={state.currentStep}
              hasError={!!error}
              isActive={isRefining}
              progress={progress}
            />
          </div>
        : <div className={'grid grid-cols-1 gap-8 lg:grid-cols-2'}>
            {/* Left Panel - Step Content */}
            <div className={'space-y-6'}>
              {state.currentStep === 1 && (
                <RequestInput
                  isRefining={isRefining}
                  onChange={(value) => updateState({ originalRequest: value })}
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
              )}

              {state.currentStep === 2 && (
                <div className={'rounded-lg border p-6'}>
                  <h2 className={'mb-4 text-xl font-semibold'}>Step 2: File Discovery</h2>
                  <p className={'text-muted-foreground'}>File discovery implementation coming in Phase 2</p>
                </div>
              )}

              {state.currentStep === 3 && (
                <div className={'rounded-lg border p-6'}>
                  <h2 className={'mb-4 text-xl font-semibold'}>Step 3: Implementation Planning</h2>
                  <p className={'text-muted-foreground'}>Implementation planning coming in Phase 2</p>
                </div>
              )}
            </div>

            {/* Right Panel - Streaming Updates */}
            <div>
              <StreamingPanel
                currentStep={state.currentStep}
                hasError={!!error}
                isActive={isRefining}
                progress={progress}
              />
            </div>
          </div>
        }
      </div>

      {/* Action Controls */}
      <ActionControls
        canProceed={state.originalRequest.length > 0}
        currentStep={state.currentStep}
        onStepChange={(step) => {
          updateState({ currentStep: step });
        }}
      />
    </PageContent>
  );
}
