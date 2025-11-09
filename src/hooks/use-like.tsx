'use client';

import { useAuth } from '@clerk/nextjs';
import { useOptimisticAction } from 'next-safe-action/hooks';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { LikeTargetType } from '@/lib/constants';

import { toggleLikeAction } from '@/lib/actions/social/social.actions';

interface UseLikeOptions {
  initialLikeCount: number;
  isInitiallyLiked: boolean;
  onLikeChange?: (isLiked: boolean, likeCount: number) => void;
  targetId: string;
  targetType: LikeTargetType;
}

export const useLike = ({
  initialLikeCount,
  isInitiallyLiked,
  onLikeChange,
  targetId,
  targetType,
}: UseLikeOptions) => {
  const { isSignedIn } = useAuth();

  const [persistedState, setPersistedState] = useState({
    isLiked: isInitiallyLiked,
    likeCount: initialLikeCount,
    likeId: null as null | string,
  });

  const {
    execute: executeToggle,
    isPending,
    optimisticState,
  } = useOptimisticAction(toggleLikeAction, {
    currentState: persistedState,
    onError: (args: { error: { serverError?: string; validationErrors?: unknown } }) => {
      // Show error toast and rollback happens automatically
      const errorMessage = args.error.serverError || 'Failed to update like status';
      toast.error(errorMessage);

      // Restore initial state via callback for parent components
      onLikeChange?.(isInitiallyLiked, initialLikeCount);
    },
    onSuccess: (args: {
      data?: { data?: { isLiked: boolean; likeCount: number; likeId: null | string } };
    }) => {
      // On success, update persisted state so optimistic updates persist
      if (args.data?.data) {
        setPersistedState({
          isLiked: args.data.data.isLiked,
          likeCount: args.data.data.likeCount,
          likeId: args.data.data.likeId,
        });
      }
    },
    updateFn: (currentState: { isLiked: boolean; likeCount: number; likeId: null | string }) => {
      const isNewLiked = !currentState.isLiked;
      const newLikeCount = isNewLiked ? currentState.likeCount + 1 : Math.max(0, currentState.likeCount - 1);

      const newState = {
        isLiked: isNewLiked,
        likeCount: newLikeCount,
        likeId: currentState.likeId,
      };

      return newState;
    },
  });

  const toggleLike = useCallback(() => {
    if (isPending || !isSignedIn) {
      return;
    }

    // Fire callback immediately (optimistic) with new values
    const isNewLiked = !optimisticState.isLiked;
    const newLikeCount =
      isNewLiked ? optimisticState.likeCount + 1 : Math.max(0, optimisticState.likeCount - 1);

    onLikeChange?.(isNewLiked, newLikeCount);

    // Execute server action
    executeToggle({
      targetId,
      targetType,
    });
  }, [isPending, isSignedIn, optimisticState, onLikeChange, executeToggle, targetId, targetType]);

  return useMemo(
    () => ({
      isLiked: optimisticState.isLiked,
      isPending,
      isSignedIn,
      likeCount: optimisticState.likeCount,
      toggleLike,
    }),
    [optimisticState.isLiked, optimisticState.likeCount, toggleLike, isPending, isSignedIn],
  );
};
