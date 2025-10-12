import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { FeatureRefinement } from '@/lib/db/schema/feature-planner.schema';
import type { RefineResponse, StepData } from '@/lib/validations/feature-planner.validation';

interface UseRefinementFlowOptions {
  onStepDataUpdate: (stepData: Partial<StepData>) => void;
  originalRequest: string;
  planId: null | string;
  settings: {
    agentCount: number;
    customModel?: string;
    // eslint-disable-next-line react-snob/require-boolean-prefix-is
    includeProjectContext: boolean;
    maxOutputLength: number;
    minOutputLength: number;
  };
}

interface UseRefinementFlowReturn {
  allRefinements: Array<FeatureRefinement> | null;
  isRefining: boolean;
  isSelectingRefinement: boolean;
  onParallelRefineRequest: () => Promise<void>;
  onRefineRequest: () => Promise<void>;
  onSelectRefinement: (refinementId: string, refinedRequest: string) => Promise<void>;
  refinedRequest: null | string;
  selectedRefinementId: null | string;
  setAllRefinements: (refinements: Array<FeatureRefinement> | null) => void;
  setPlanId: (id: string) => void;
  setRefinedRequest: (request: null | string) => void;
  setSelectedRefinementId: (id: null | string) => void;
}

export const useRefinementFlow = ({
  onStepDataUpdate,
  originalRequest,
  planId,
  settings,
}: UseRefinementFlowOptions): UseRefinementFlowReturn => {
  // useState hooks
  const [isRefining, setIsRefining] = useState(false);
  const [isSelectingRefinement, setIsSelectingRefinement] = useState(false);
  const [allRefinements, setAllRefinements] = useState<Array<FeatureRefinement> | null>(null);
  const [selectedRefinementId, setSelectedRefinementId] = useState<null | string>(null);
  const [refinedRequest, setRefinedRequest] = useState<null | string>(null);
  const [currentPlanId, setCurrentPlanId] = useState<null | string>(planId);

  // Event handlers
  const handleRefineRequest = useCallback(async () => {
    if (!originalRequest.trim()) {
      toast.error('Please enter a feature request');
      return;
    }

    setIsRefining(true);
    toast.loading('Refining feature request...', { id: 'single-refine' });

    try {
      const response = await fetch('/api/feature-planner/refine', {
        body: JSON.stringify({
          featureRequest: originalRequest,
          planId: currentPlanId,
          settings: {
            ...settings,
            agentCount: 1,
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

        if (data.data) {
          const responseData = data.data as {
            planId: string;
            refinements: Array<FeatureRefinement>;
          };

          const refinement = responseData.refinements[0];
          if (refinement?.refinedRequest) {
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
                setAllRefinements(responseData.refinements);
                setCurrentPlanId(responseData.planId);
                setRefinedRequest(refinement.refinedRequest);
                setSelectedRefinementId(refinement.id);
                setIsRefining(false);

                onStepDataUpdate({
                  step1: {
                    originalRequest,
                    refinements: [
                      {
                        agentId: refinement.agentId,
                        id: refinement.id,
                        refinedRequest: refinement.refinedRequest,
                      },
                    ],
                    selectedRefinement: refinement.refinedRequest,
                  },
                });
              } else {
                toast.error(selectData.message || 'Failed to save refinement');
                setIsRefining(false);
              }
            } catch (selectError) {
              console.error('Error saving refinement:', selectError);
              toast.dismiss('save-refinement');
              toast.error('Failed to save refinement selection');
              setIsRefining(false);
            }
          } else {
            toast.error('Refinement completed but no result received');
            setIsRefining(false);
          }
        }
      } else {
        toast.error(data.message || 'Failed to refine feature request');
        setIsRefining(false);
      }
    } catch (error) {
      console.error('Error in single refinement:', error);
      toast.dismiss('single-refine');
      const errorMessage =
        error instanceof Error ?
          `Refinement failed: ${error.message}`
        : 'An unexpected error occurred during refinement';
      toast.error(errorMessage);
      setIsRefining(false);
    }
  }, [currentPlanId, onStepDataUpdate, originalRequest, settings]);

  const handleParallelRefineRequest = useCallback(async () => {
    if (!originalRequest.trim()) {
      toast.error('Please enter a feature request');
      return;
    }

    setIsRefining(true);
    toast.loading(`Starting ${settings.agentCount} parallel refinements...`, { id: 'parallel-refine' });

    try {
      const response = await fetch('/api/feature-planner/refine', {
        body: JSON.stringify({
          featureRequest: originalRequest,
          planId: currentPlanId,
          settings,
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

        if (data.data) {
          const responseData = data.data as {
            planId: string;
            refinements: Array<FeatureRefinement>;
          };

          const completedCount = responseData.refinements.filter((r) => r.status === 'completed').length;
          const failedCount = responseData.refinements.filter((r) => r.status === 'failed').length;

          if (failedCount > 0) {
            toast.warning(`${completedCount} refinements succeeded, ${failedCount} failed`);
          }

          setAllRefinements(responseData.refinements);
          setCurrentPlanId(responseData.planId);
          setIsRefining(false);

          onStepDataUpdate({
            step1: {
              originalRequest,
              refinements: responseData.refinements.map((r) => ({
                agentId: r.agentId,
                id: r.id,
                refinedRequest: r.refinedRequest || '',
              })),
              selectedRefinement: null,
            },
          });
        }
      } else {
        const errorMsg = data.message || 'Failed to refine feature request';
        toast.error(errorMsg);
        setIsRefining(false);
      }
    } catch (error) {
      console.error('Error in parallel refinement:', error);
      toast.dismiss('parallel-refine');
      const errorMessage =
        error instanceof Error ?
          `Parallel refinement failed: ${error.message}`
        : 'An unexpected error occurred during parallel refinement';
      toast.error(errorMessage);
      setIsRefining(false);
    }
  }, [currentPlanId, onStepDataUpdate, originalRequest, settings]);

  const handleSelectRefinement = useCallback(
    async (refinementId: string, refinedRequest: string) => {
      if (!currentPlanId) {
        toast.error('Cannot select refinement: Plan ID is missing');
        return;
      }

      setIsSelectingRefinement(true);

      try {
        toast.loading('Selecting refinement...', { id: 'select-refinement' });

        const response = await fetch(`/api/feature-planner/${currentPlanId}/select-refinement`, {
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
          setRefinedRequest(refinedRequest);
          setSelectedRefinementId(refinementId);
          setIsSelectingRefinement(false);
        } else {
          const errorMsg = data.message || 'Failed to select refinement';
          toast.error(errorMsg);
          setIsSelectingRefinement(false);
        }
      } catch (error) {
        console.error('Error selecting refinement:', error);
        toast.dismiss('select-refinement');
        const errorMessage =
          error instanceof Error ?
            `Failed to select refinement: ${error.message}`
          : 'An unexpected error occurred while selecting refinement';
        toast.error(errorMessage);
        setIsSelectingRefinement(false);
      }
    },
    [currentPlanId],
  );

  return {
    allRefinements,
    isRefining,
    isSelectingRefinement,
    onParallelRefineRequest: handleParallelRefineRequest,
    onRefineRequest: handleRefineRequest,
    onSelectRefinement: handleSelectRefinement,
    refinedRequest,
    selectedRefinementId,
    setAllRefinements,
    setPlanId: setCurrentPlanId,
    setRefinedRequest,
    setSelectedRefinementId,
  };
};
