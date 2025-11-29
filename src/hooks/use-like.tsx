'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useMemo, useState } from 'react';

import type { LikeTargetType } from '@/lib/constants';

import { useOptimisticServerAction } from '@/hooks/use-optimistic-server-action';
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
  } = useOptimisticServerAction(toggleLikeAction, {
    currentState: persistedState,
    onAfterError: () => {
      // Restore initial state via callback for parent components
      onLikeChange?.(isInitiallyLiked, initialLikeCount);
    },
    onAfterSuccess: (data) => {
      // On success, update persisted state so optimistic updates persist
      setPersistedState({
        isLiked: data.isLiked,
        likeCount: data.likeCount,
        likeId: data.likeId,
      });
    },
    onUpdate: (currentState) => {
      const isNewLiked = !currentState.isLiked;
      const newLikeCount = isNewLiked ? currentState.likeCount + 1 : Math.max(0, currentState.likeCount - 1);

      return {
        isLiked: isNewLiked,
        likeCount: newLikeCount,
        likeId: currentState.likeId,
      };
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
