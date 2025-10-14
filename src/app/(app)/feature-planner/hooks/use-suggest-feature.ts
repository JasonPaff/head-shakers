'use client';

import { useCallback, useState } from 'react';

import type {
  FeatureType,
  PriorityLevel,
  SuggestionResult,
} from '@/lib/validations/feature-planner.validation';

import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { suggestFeatureAction } from '@/lib/actions/feature-planner/feature-planner.actions';

interface UseSuggestFeatureReturn {
  clearResults: () => void;
  closeDialog: () => void;
  error: null | string;
  invokeSuggestion: (input: {
    additionalContext?: string;
    customModel?: string;
    featureType: FeatureType;
    pageOrComponent: string;
    priorityLevel: PriorityLevel;
  }) => Promise<unknown>;
  isDialogOpen: boolean;
  isLoading: boolean;
  openDialog: () => void;
  resetState: () => void;
  suggestions: Array<SuggestionResult> | null;
}

export const useSuggestFeature = (): UseSuggestFeatureReturn => {
  const [suggestions, setSuggestions] = useState<Array<SuggestionResult> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useToggle();
  const [error, setError] = useState<null | string>(null);

  const openDialog = useCallback(() => {
    setIsDialogOpen.on();
    setError(null);
    setSuggestions(null);
  }, [setIsDialogOpen]);

  const closeDialog = useCallback(() => {
    setIsDialogOpen.off();
  }, [setIsDialogOpen]);

  const clearResults = useCallback(() => {
    setSuggestions(null);
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setSuggestions(null);
    setError(null);
    setIsDialogOpen.off();
  }, [setIsDialogOpen]);

  const { executeAsync, isExecuting } = useServerAction(suggestFeatureAction, {
    onError: ({ error }) => {
      const errorMessage =
        typeof error.serverError === 'string' ?
          error.serverError
        : 'Failed to generate feature suggestions. Please try again.';
      setError(errorMessage);
      setSuggestions(null);
    },
    onSuccess: ({ data }) => {
      setSuggestions(data.data.suggestions.suggestions);
      setError(null);
    },
    toastMessages: {
      error: 'Failed to generate feature suggestions. Please try again.',
      loading: 'Generating feature suggestions...',
      success: 'Feature suggestions generated successfully!',
    },
  });

  const invokeSuggestion = useCallback(
    async (input: {
      additionalContext?: string;
      customModel?: string;
      featureType: FeatureType;
      pageOrComponent: string;
      priorityLevel: PriorityLevel;
    }) => {
      return executeAsync(input);
    },
    [executeAsync],
  );

  return {
    clearResults,
    closeDialog,
    error,
    invokeSuggestion,
    isDialogOpen,
    isLoading: isExecuting,
    openDialog,
    resetState,
    suggestions,
  };
};
