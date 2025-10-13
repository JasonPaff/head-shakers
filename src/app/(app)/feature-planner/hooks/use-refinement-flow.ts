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
  cancelRefinement: () => void;
  isRefining: boolean;
  isSelectingRefinement: boolean;
  onParallelRefineRequest: () => Promise<void>;
  onParallelRefineRequestWithStreaming: () => Promise<void>;
  onRefineRequest: () => Promise<void>;
  onSelectRefinement: (refinementId: string, refinedRequest: string) => Promise<void>;
  partialRefinements: Map<string, string>;
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
  const [partialRefinements, setPartialRefinements] = useState<Map<string, string>>(new Map());
  const [abortController, setAbortController] = useState<AbortController | null>(null);

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

  const handleParallelRefineRequestWithStreaming = useCallback(async () => {
    if (!originalRequest.trim()) {
      toast.error('Please enter a feature request');
      return;
    }

    // Create abort controller for cancellation
    const controller = new AbortController();
    setAbortController(controller);
    setIsRefining(true);
    setPartialRefinements(new Map());

    toast.loading(`Starting ${settings.agentCount} parallel refinements with streaming...`, {
      id: 'streaming-refine',
    });

    try {
      const response = await fetch('/api/feature-planner/refine-stream', {
        body: JSON.stringify({
          featureRequest: originalRequest,
          planId: currentPlanId,
          settings,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error: string };
        throw new Error(errorData.error || 'Failed to start streaming refinement');
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Process SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const refinements: Array<FeatureRefinement> = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete events (separated by double newlines)
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event in buffer

        for (const event of events) {
          if (!event.trim() || !event.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(event.slice(6)) as
              | { agentId: string; data: FeatureRefinement; type: 'complete' }
              | { agentId: string; data: string; type: 'partial' }
              | { agentId: string; data: { error: string }; type: 'error' }
              | {
                  data: { planId: string; refinements: Array<FeatureRefinement> };
                  type: 'done';
                };

            if (data.type === 'partial') {
              // Update partial refinement text
              setPartialRefinements((prev) => {
                const updated = new Map(prev);
                updated.set(data.agentId, data.data);
                return updated;
              });
            } else if (data.type === 'complete') {
              // Agent completed
              refinements.push(data.data);
              toast.success(`${data.agentId} completed`, { duration: 2000 });
            } else if (data.type === 'error') {
              // Agent failed
              toast.error(`${data.agentId} failed: ${data.data.error}`, { duration: 3000 });
            } else if (data.type === 'done') {
              // All agents completed
              toast.dismiss('streaming-refine');
              toast.success(`Completed ${refinements.length} refinements`);

              setAllRefinements(data.data.refinements);
              setCurrentPlanId(data.data.planId);
              setIsRefining(false);
              setAbortController(null);

              onStepDataUpdate({
                step1: {
                  originalRequest,
                  refinements: data.data.refinements.map((r) => ({
                    agentId: r.agentId,
                    id: r.id,
                    refinedRequest: r.refinedRequest || '',
                  })),
                  selectedRefinement: null,
                },
              });
            }
          } catch (parseError) {
            console.error('Error parsing SSE event:', parseError);
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        toast.dismiss('streaming-refine');
        toast.info('Refinement cancelled');
      } else {
        console.error('Error in streaming refinement:', error);
        toast.dismiss('streaming-refine');
        const errorMessage =
          error instanceof Error ?
            `Streaming refinement failed: ${error.message}`
          : 'An unexpected error occurred during streaming refinement';
        toast.error(errorMessage);
      }
      setIsRefining(false);
      setAbortController(null);
    }
  }, [currentPlanId, onStepDataUpdate, originalRequest, settings]);

  const handleCancelRefinement = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsRefining(false);
      toast.info('Refinement cancelled');
    }
  }, [abortController]);

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
    cancelRefinement: handleCancelRefinement,
    isRefining,
    isSelectingRefinement,
    onParallelRefineRequest: handleParallelRefineRequest,
    onParallelRefineRequestWithStreaming: handleParallelRefineRequestWithStreaming,
    onRefineRequest: handleRefineRequest,
    onSelectRefinement: handleSelectRefinement,
    partialRefinements,
    refinedRequest,
    selectedRefinementId,
    setAllRefinements,
    setPlanId: setCurrentPlanId,
    setRefinedRequest,
    setSelectedRefinementId,
  };
};
