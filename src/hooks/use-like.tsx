'use client';

import { useAuth } from '@clerk/nextjs';
import { useOptimisticAction } from 'next-safe-action/hooks';
import { useCallback, useMemo } from 'react';

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

  const {
    execute: executeToggle,
    isPending,
    optimisticState,
  } = useOptimisticAction(toggleLikeAction, {
    currentState: {
      isLiked: isInitiallyLiked,
      likeCount: initialLikeCount,
    },
    updateFn: (currentState) => {
      const isNewLiked = !currentState.isLiked;
      const newLikeCount = isNewLiked ? currentState.likeCount + 1 : Math.max(0, currentState.likeCount - 1);

      return {
        isLiked: isNewLiked,
        likeCount: newLikeCount,
      };
    },
  });

  const toggleLike = useCallback(() => {
    if (isPending || !isSignedIn) return;

    const isNewLiked = !optimisticState.isLiked;
    const newLikeCount =
      isNewLiked ? optimisticState.likeCount + 1 : Math.max(0, optimisticState.likeCount - 1);

    onLikeChange?.(isNewLiked, newLikeCount);

    executeToggle({
      targetId,
      targetType,
    });
  }, [
    isPending,
    isSignedIn,
    optimisticState.isLiked,
    optimisticState.likeCount,
    onLikeChange,
    executeToggle,
    targetId,
    targetType,
  ]);

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
