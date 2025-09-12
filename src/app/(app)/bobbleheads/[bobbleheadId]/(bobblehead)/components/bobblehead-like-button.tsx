'use client';

import { LikeButton } from '@/components/ui/like-button';

interface BobbleheadLikeButtonProps {
  bobbleheadId: string;
  initialLikeCount: number;
  isInitiallyLiked: boolean;
}

export const BobbleheadLikeButton = ({
  bobbleheadId,
  initialLikeCount,
  isInitiallyLiked,
}: BobbleheadLikeButtonProps) => {
  return (
    <LikeButton
      initialLikeCount={initialLikeCount}
      isInitiallyLiked={isInitiallyLiked}
      size={"sm"}
      targetId={bobbleheadId}
      targetType={"bobblehead"}
      variant={"ghost"}
    />
  );
};