'use client';

import type { ComponentProps } from 'react';

import { MessageCircleIcon, Share2Icon } from 'lucide-react';

import type { ContentLikeData } from '@/lib/facades/social/social.facade';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { LikeIconButton } from '@/components/ui/like-button';
import { Separator } from '@/components/ui/separator';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type FeatureCardSocialBarProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    bobbleheadId: string;
    commentCount?: number;
    likeData: ContentLikeData;
  };

export const FeatureCardSocialBar = ({
  bobbleheadId,
  className,
  commentCount = 0,
  likeData,
  testId,
  ...props
}: FeatureCardSocialBarProps) => {
  const socialBarTestId = testId || generateTestId('feature', 'bobblehead-details', 'social-bar');
  const commentsButtonTestId = testId
    ? `${testId}-comments`
    : generateTestId('feature', 'bobblehead-details', 'comments-btn');
  const shareButtonTestId = testId
    ? `${testId}-share`
    : generateTestId('feature', 'bobblehead-details', 'share-btn');

  const handleShareClick = () => {
    // Share functionality placeholder
    console.log('Share clicked for bobblehead:', bobbleheadId);
  };

  const _commentLabel = commentCount === 1 ? 'comment' : 'comments';

  return (
    <div
      className={cn('flex flex-col gap-3', className)}
      data-slot={'feature-card-social-bar'}
      data-testid={socialBarTestId}
      {...props}
    >
      {/* Visual Separator */}
      <Separator />

      {/* Social Actions Row */}
      <div className={'flex items-center gap-4'}>
        {/* Like Button */}
        <LikeIconButton
          initialLikeCount={likeData.likeCount}
          isInitiallyLiked={likeData.isLiked}
          shouldShowCount={true}
          targetId={bobbleheadId}
          targetType={'bobblehead'}
        />

        {/* Comments Button */}
        <Button
          aria-label={`${commentCount} ${_commentLabel}. View comments`}
          className={'gap-2 text-muted-foreground hover:text-foreground'}
          data-slot={'social-bar-comments-button'}
          size={'sm'}
          testId={commentsButtonTestId}
          variant={'ghost'}
        >
          <MessageCircleIcon aria-hidden className={'size-4'} />
          <span className={'text-sm'}>{commentCount}</span>
        </Button>

        {/* Share Button */}
        <Button
          aria-label={'Share this bobblehead'}
          className={'gap-2 text-muted-foreground hover:text-foreground'}
          data-slot={'social-bar-share-button'}
          onClick={handleShareClick}
          size={'sm'}
          testId={shareButtonTestId}
          variant={'ghost'}
        >
          <Share2Icon aria-hidden className={'size-4'} />
          <span className={'text-sm'}>Share</span>
        </Button>
      </div>
    </div>
  );
};
