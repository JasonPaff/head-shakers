'use client';

import { useCallback, useState } from 'react';

import type {
  FeatureType,
  PriorityLevel,
  SuggestionResult,
} from '@/lib/validations/feature-planner.validation';

import { useServerAction } from '@/hooks/use-server-action';
import { suggestFeatureAction } from '@/lib/actions/feature-planner/feature-planner.actions';

interface UseSuggestFeatureReturn {
  closeDialog: () => void;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const resetState = useCallback(() => {
    setSuggestions(null);
    setIsDialogOpen(false);
  }, []);

  const { executeAsync, isExecuting } = useServerAction(suggestFeatureAction, {
    onSuccess: ({ data }) => {
      setSuggestions(data.data.suggestions.suggestions);
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
    closeDialog,
    invokeSuggestion,
    isDialogOpen,
    isLoading: isExecuting,
    openDialog,
    resetState,
    suggestions,
  };
};
