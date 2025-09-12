'use client';

import { LikeButton } from '@/components/ui/like-button';

interface CollectionLikeButtonProps {
  collectionId: string;
  initialLikeCount: number;
  isInitiallyLiked: boolean;
}

export const CollectionLikeButton = ({
  collectionId,
  initialLikeCount,
  isInitiallyLiked,
}: CollectionLikeButtonProps) => {
  return (
    <LikeButton
      initialLikeCount={initialLikeCount}
      isInitiallyLiked={isInitiallyLiked}
      size={"default"}
      targetId={collectionId}
      targetType={"collection"}
      variant={"ghost"}
    />
  );
};