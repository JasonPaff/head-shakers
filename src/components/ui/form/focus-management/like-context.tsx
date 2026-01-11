'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';

import type { LikeTargetType } from '@/lib/constants';

import { useLike } from '@/hooks/use-like';

interface LikeContextValue {
  isLiked: boolean;
  isPending: boolean;
  isSignedIn: boolean | undefined;
  likeCount: number;
  toggleLike: () => void;
}

const LikeContext = createContext<LikeContextValue | null>(null);

export const useLikeContext = () => {
  const context = useContext(LikeContext);
  if (!context) {
    throw new Error('useLikeContext must be used within a LikeProvider');
  }
  return context;
};

interface LikeProviderProps {
  children: ReactNode;
  initialLikeCount: number;
  isInitiallyLiked: boolean;
  targetId: string;
  targetType: LikeTargetType;
}

export const LikeProvider = ({
  children,
  initialLikeCount,
  isInitiallyLiked,
  targetId,
  targetType,
}: LikeProviderProps) => {
  const likeState = useLike({
    initialLikeCount,
    isInitiallyLiked,
    targetId,
    targetType,
  });

  const value = useMemo(() => likeState, [likeState]);

  return <LikeContext.Provider value={value}>{children}</LikeContext.Provider>;
};
