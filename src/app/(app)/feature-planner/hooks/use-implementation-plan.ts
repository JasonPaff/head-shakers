import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { StepData } from '@/lib/validations/feature-planner.validation';

interface UseImplementationPlanOptions {
  customModel?: string;
  onStepDataUpdate: (stepData: Partial<StepData>) => void;
  planId: null | string;
  stepData: StepData;
}

interface UseImplementationPlanReturn {
  isGeneratingPlan: boolean;
  onImplementationPlanning: () => Promise<void>;
}

export const useImplementationPlan = ({
  customModel,
  onStepDataUpdate,
  planId,
  stepData,
}: UseImplementationPlanOptions): UseImplementationPlanReturn => {
  // useState hooks
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Event handlers
  const handleImplementationPlanning = useCallback(async () => {
    if (!planId) {
      toast.error('Please complete step 1 first - plan ID is missing');
      return;
    }

    if (!stepData.step2) {
      toast.error('Please complete step 2 first');
      return;
    }

    setIsGeneratingPlan(true);
    toast.loading('Generating implementation plan...', { id: 'plan-generation' });

    try {
      const response = await fetch('/api/feature-planner/plan', {
        body: JSON.stringify({
          customModel,
          planId,
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
            commands: Array<string>;
            description: string;
            title: string;
            validationCommands: Array<string>;
          }>;
          totalTokens?: number;
        };
        message: string;
        success: boolean;
      };

      console.log('[Plan Generation] Response received:', {
        dataPresent: !!data.data,
        generationId: data.data?.id,
        planId,
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

          onStepDataUpdate({
            step3: step3Data,
          });

          setIsGeneratingPlan(false);

          console.log('[Plan Generation] State update complete');
        } else {
          console.error('[Plan Generation] No data in response');
          setIsGeneratingPlan(false);
        }
      } else {
        console.error('[Plan Generation] Request failed:', data);
        toast.error(data.message || 'Failed to generate implementation plan');
        setIsGeneratingPlan(false);
      }
    } catch (error) {
      console.error('[Plan Generation] Exception caught:', error);
      toast.dismiss('plan-generation');
      toast.error('Failed to generate implementation plan');
      setIsGeneratingPlan(false);
    }
  }, [customModel, onStepDataUpdate, planId, stepData.step2]);

  return {
    isGeneratingPlan,
    onImplementationPlanning: handleImplementationPlanning,
  };
};
