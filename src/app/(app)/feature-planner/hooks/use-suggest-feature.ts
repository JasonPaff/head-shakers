'use client';

import { useCallback, useState } from 'react';

import type { SuggestionResult } from '@/lib/validations/feature-planner.validation';

import { useServerAction } from '@/hooks/use-server-action';
import { suggestFeatureAction } from '@/lib/actions/feature-planner/feature-planner.actions';

interface UseSuggestFeatureReturn {
  closeDialog: () => void;
  invokeSuggestion: ReturnType<typeof useServerAction>['executeAsync'];
  isDialogOpen: boolean;
  isLoading: boolean;
  openDialog: () => void;
  resetState: () => void;
  suggestions: Array<SuggestionResult> | null;
}

export const useSuggestFeature = (): UseSuggestFeatureReturn => {
  // State
  const [suggestions, setSuggestions] = useState<Array<SuggestionResult> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dialog control functions
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

  return {
    closeDialog,
    invokeSuggestion: executeAsync,
    isDialogOpen,
    isLoading: isExecuting,
    openDialog,
    resetState,
    suggestions,
  };
};
