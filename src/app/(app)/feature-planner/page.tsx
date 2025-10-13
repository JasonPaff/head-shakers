'use client';

import { parseAsInteger, useQueryState } from 'nuqs';
import { useCallback, useState } from 'react';

import type { WorkflowStep } from '@/app/(app)/feature-planner/components/steps/step-orchestrator';
import type {
  RefinementSettings as RefinementSettingsType,
  StepData,
} from '@/lib/validations/feature-planner.validation';

import { ActionControls } from '@/app/(app)/feature-planner/components/action-controls';
import { AgentSelection } from '@/app/(app)/feature-planner/components/agent-selection';
import { PlanViewerClient } from '@/app/(app)/feature-planner/components/plan-viewer-client';
import { RefinementResults } from '@/app/(app)/feature-planner/components/refinement-results';
import { RefinementSettings } from '@/app/(app)/feature-planner/components/refinement-settings';
import { StepOrchestrator } from '@/app/(app)/feature-planner/components/steps/step-orchestrator';
import { WorkflowProgress } from '@/app/(app)/feature-planner/components/workflow-progress';
import { useFileDiscovery } from '@/app/(app)/feature-planner/hooks/use-file-discovery';
import { useImplementationPlan } from '@/app/(app)/feature-planner/hooks/use-implementation-plan';
import { useRefinementFlow } from '@/app/(app)/feature-planner/hooks/use-refinement-flow';
import { PageContent } from '@/components/layout/page-content';
import { Conditional } from '@/components/ui/conditional';

export default function FeaturePlannerPage() {
  // useState hooks
  const [currentStep, setCurrentStep] = useQueryState(
    'step',
    parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
  );

  const [originalRequest, setOriginalRequest] = useState('');
  const [manualFiles, setManualFiles] = useState<
    Array<{
      description: string;
      filePath: string;
      priority: 'critical' | 'high' | 'low' | 'medium';
    }>
  >([]);
  const [settings, setSettings] = useState<RefinementSettingsType>({
    agentCount: 3,
    enableSynthesis: false,
    includeProjectContext: true,
    maxOutputLength: 250,
    minOutputLength: 150,
    selectedAgentIds: ['technical-architect', 'product-manager', 'ux-designer'],
  });
  const [stepData, setStepData] = useState<StepData>({});
  const [planId] = useState<null | string>(null);

  // Event handlers (defined before custom hooks that depend on them)
  const handleStepDataUpdate = useCallback((updates: Partial<StepData>) => {
    setStepData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Custom hooks
  const refinementFlow = useRefinementFlow({
    onStepDataUpdate: handleStepDataUpdate,
    originalRequest,
    planId,
    settings,
  });

  const fileDiscovery = useFileDiscovery({
    customModel: settings.customModel,
    onStepDataUpdate: handleStepDataUpdate,
    planId,
    stepData,
  });

  const implementationPlan = useImplementationPlan({
    customModel: settings.customModel,
    onStepDataUpdate: handleStepDataUpdate,
    planId,
    stepData,
  });

  // Event handlers
  const handleStepChange = useCallback(
    (step: WorkflowStep) => {
      if (step === 2 && !originalRequest) return;
      if (step === 3 && !stepData.step1) return;
      void setCurrentStep(step);
    },
    [originalRequest, stepData.step1, setCurrentStep],
  );

  const handleProceedWithRefinedRequest = useCallback(() => {
    if (!refinementFlow.refinedRequest) {
      return;
    }
    handleStepChange(2);
  }, [handleStepChange, refinementFlow.refinedRequest]);

  const handleUseOriginalRequest = useCallback(() => {
    refinementFlow.setRefinedRequest(null);
    refinementFlow.setSelectedRefinementId(null);
    handleStepDataUpdate({
      step1: {
        originalRequest,
        refinements:
          refinementFlow.allRefinements?.map((r) => ({
            agentId: r.agentId,
            id: r.id,
            refinedRequest: r.refinedRequest || '',
          })) || [],
        selectedRefinement: null,
      },
    });
    handleStepChange(2);
  }, [handleStepChange, handleStepDataUpdate, originalRequest, refinementFlow]);

  const handleSettingsChange = useCallback((newSettings: RefinementSettingsType) => {
    setSettings(newSettings);
  }, []);

  const handleFileAdded = useCallback(
    (file: { description: string; filePath: string; priority: 'critical' | 'high' | 'low' | 'medium' }) => {
      setManualFiles((prev) => [...prev, file]);
    },
    [],
  );

  const handleRemoveManualFile = useCallback((filePath: string) => {
    setManualFiles((prev) => prev.filter((f) => f.filePath !== filePath));
  }, []);

  // Derived variables
  const _isRefinementResultsVisible =
    currentStep === 1 && !!refinementFlow.allRefinements && refinementFlow.allRefinements.length > 0;
  const _isPlanViewerVisible =
    currentStep === 3 && !!stepData.step3?.generationId && !!planId && !implementationPlan.isGeneratingPlan;

  return (
    <PageContent>
      {/* Workflow Progress Section */}
      <WorkflowProgress currentStep={currentStep as WorkflowStep} />

      <div className={'mt-8 space-y-8'}>
        {/* Refinement Settings Section */}
        <div className={'flex items-center gap-4'}>
          <AgentSelection onSettingsChange={handleSettingsChange} settings={settings} />
          <RefinementSettings onSettingsChange={handleSettingsChange} settings={settings} />
        </div>

        {/* Step Orchestrator Section */}
        <StepOrchestrator
          currentStep={currentStep as WorkflowStep}
          discoverySession={fileDiscovery.discoverySession}
          isDiscoveringFiles={fileDiscovery.isDiscoveringFiles}
          isGeneratingPlan={implementationPlan.isGeneratingPlan}
          isRefining={refinementFlow.isRefining}
          manualFiles={manualFiles}
          onChange={setOriginalRequest}
          onFileAdded={handleFileAdded}
          onFileDiscovery={fileDiscovery.onFileDiscovery}
          onFileSelection={fileDiscovery.onFileSelection}
          onImplementationPlanning={implementationPlan.onImplementationPlanning}
          onParallelRefineRequest={refinementFlow.onParallelRefineRequestWithStreaming}
          onRefineRequest={refinementFlow.onRefineRequest}
          onRemoveManualFile={handleRemoveManualFile}
          planId={planId}
          settings={settings}
          stepData={stepData}
          value={originalRequest}
        />

        {/* Refinement Results Section */}
        <Conditional isCondition={_isRefinementResultsVisible}>
          <RefinementResults
            isRefining={refinementFlow.isRefining}
            isSelectingRefinement={refinementFlow.isSelectingRefinement}
            onCancelRefinement={refinementFlow.cancelRefinement}
            onProceedToNextStep={handleProceedWithRefinedRequest}
            onSelectRefinement={refinementFlow.onSelectRefinement}
            onUseOriginal={handleUseOriginalRequest}
            originalRequest={originalRequest}
            partialRefinements={refinementFlow.partialRefinements}
            refinements={refinementFlow.allRefinements || []}
            selectedRefinementId={refinementFlow.selectedRefinementId || undefined}
          />
        </Conditional>

        {/* Plan Viewer Section */}
        <Conditional isCondition={_isPlanViewerVisible}>
          <PlanViewerClient planId={planId!} />
        </Conditional>
      </div>

      {/* Action Controls Section */}
      <ActionControls
        currentStep={currentStep as WorkflowStep}
        isProceedable={originalRequest.length > 0}
        onStepChange={handleStepChange}
      />
    </PageContent>
  );
}
