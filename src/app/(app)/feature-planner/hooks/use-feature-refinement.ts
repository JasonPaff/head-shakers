'use client';

import { useCallback, useState } from 'react';

import type { ParallelRefinementResponse, RefinementSettings } from '@/lib/validations/feature-planner.validation';

import { useToggle } from '@/hooks/use-toggle';
import { parallelRefineFeatureRequestAction, refineFeatureRequestAction } from '@/lib/actions/feature-planner/feature-planner.actions';

interface ParallelRefinementResult {
  error?: string;
  isSuccess: boolean;
  response?: ParallelRefinementResponse;
}

interface RefinementOptions {
  maxRetries?: number;
  shouldFallbackToSimplePrompt?: boolean;
  timeoutMs?: number;
}

interface RefinementResult {
  error?: string;
  isSuccess: boolean;
  refinedRequest: string;
}

interface UseFeatureRefinementReturn {
  error: null | string;
  isRefining: boolean;
  parallelRefineFeatureRequest: (originalRequest: string, settings: RefinementSettings) => Promise<ParallelRefinementResult>;
  progress: Array<string>;
  refineFeatureRequest: (originalRequest: string, options?: RefinementOptions) => Promise<RefinementResult>;
  retryCount: number;
}

export const useFeatureRefinement = (): UseFeatureRefinementReturn => {
  const [error, setError] = useState<null | string>(null);
  const [isRefining, setIsRefining] = useToggle();
  const [progress, setProgress] = useState<Array<string>>([]);
  const [retryCount, setRetryCount] = useState(0);

  const addProgress = useCallback((message: string) => {
    setProgress((prev) => [...prev, message]);
  }, []);

  const parallelRefineFeatureRequest = useCallback(
    async (originalRequest: string, settings: RefinementSettings): Promise<ParallelRefinementResult> => {
      try {
        setIsRefining.on();
        setProgress([]);
        setError(null);
        setRetryCount(0);

        addProgress('Starting parallel feature refinement...');
        addProgress(`Launching ${settings.agentCount} refinement agents...`);

        const result = await parallelRefineFeatureRequestAction({
          originalRequest,
          settings,
        });

        if (result.serverError) {
          const serverError = result.serverError;
          const errorMessage =
            typeof serverError === 'string' ? serverError
            : (
              serverError &&
              typeof serverError === 'object' &&
              'message' in serverError &&
              typeof (serverError as { message: unknown }).message === 'string'
            ) ?
              (serverError as { message: string }).message
            : 'Server error occurred';
          setError(errorMessage);
          addProgress(`Error: ${errorMessage}`);

          return {
            error: errorMessage,
            isSuccess: false,
          };
        }

        if (result.validationErrors) {
          const validationErrorsArray = Object.values(result.validationErrors)
            .flat()
            .map((error) => {
              if (typeof error === 'string') return error;
              if (error && typeof error === 'object' && 'message' in error) {
                return String(error.message);
              }
              return 'Unknown validation error';
            });
          const errorMessage = 'Validation failed: ' + validationErrorsArray.join(', ');
          setError(errorMessage);
          addProgress(`Error: ${errorMessage}`);

          return {
            error: errorMessage,
            isSuccess: false,
          };
        }

        if (result.data) {
          const response = result.data;
          addProgress(`Parallel refinement completed! ${response.successCount}/${response.totalAgents} agents succeeded.`);
          addProgress(`Total execution time: ${Math.round(response.executionTimeMs / 1000)}s`);

          return {
            isSuccess: response.isSuccess,
            response,
          };
        }

        const errorMessage = 'Unexpected response from server';
        setError(errorMessage);
        addProgress(`Error: ${errorMessage}`);

        return {
          error: errorMessage,
          isSuccess: false,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        addProgress(`Error: ${errorMessage}`);

        return {
          error: errorMessage,
          isSuccess: false,
        };
      } finally {
        setIsRefining.off();
      }
    },
    [addProgress, setIsRefining],
  );

  const refineFeatureRequest = useCallback(
    async (originalRequest: string, options: RefinementOptions = {}): Promise<RefinementResult> => {
      try {
        setIsRefining.on();
        setProgress([]);
        setError(null);
        setRetryCount(0);

        addProgress('Starting feature refinement...');
        addProgress('Sending request to server...');

        const result = await refineFeatureRequestAction({
          options,
          originalRequest,
        });

        if (result.serverError) {
          const serverError = result.serverError;
          const errorMessage =
            typeof serverError === 'string' ? serverError
            : (
              serverError &&
              typeof serverError === 'object' &&
              'message' in serverError &&
              typeof (serverError as { message: unknown }).message === 'string'
            ) ?
              (serverError as { message: string }).message
            : 'Server error occurred';
          setError(errorMessage);
          addProgress(`Error: ${errorMessage}`);

          return {
            error: errorMessage,
            isSuccess: false,
            refinedRequest: '',
          };
        }

        if (result.validationErrors) {
          const validationErrorsArray = Object.values(result.validationErrors)
            .flat()
            .map((error) => {
              if (typeof error === 'string') return error;
              if (error && typeof error === 'object' && 'message' in error) {
                return String(error.message);
              }
              return 'Unknown validation error';
            });
          const errorMessage = 'Validation failed: ' + validationErrorsArray.join(', ');
          setError(errorMessage);
          addProgress(`Error: ${errorMessage}`);

          return {
            error: errorMessage,
            isSuccess: false,
            refinedRequest: '',
          };
        }

        if (result.data) {
          addProgress('Refinement completed successfully!');
          setRetryCount(result.data.retryCount || 0);

          return {
            error: result.data.error,
            isSuccess: result.data.isSuccess,
            refinedRequest: result.data.refinedRequest,
          };
        }

        const errorMessage = 'Unexpected response from server';
        setError(errorMessage);
        addProgress(`Error: ${errorMessage}`);

        return {
          error: errorMessage,
          isSuccess: false,
          refinedRequest: '',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        addProgress(`Error: ${errorMessage}`);

        return {
          error: errorMessage,
          isSuccess: false,
          refinedRequest: '',
        };
      } finally {
        setIsRefining.off();
      }
    },
    [addProgress, setIsRefining],
  );

  return {
    error,
    isRefining,
    parallelRefineFeatureRequest,
    progress,
    refineFeatureRequest,
    retryCount,
  };
};
