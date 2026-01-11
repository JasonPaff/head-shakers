'use client';

import type { ComponentProps } from 'react';

import { MessageCircleIcon, Share2Icon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { BobbleheadShareMenu } from '@/components/feature/bobblehead/bobblehead-share-menu';
import { ReportButton } from '@/components/feature/content-reports/report-button';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { LikeIconButtonFromContext } from '@/components/ui/like-button';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type FeatureCardSocialBarProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    bobbleheadId: string;
    bobbleheadSlug: string;
    collectionSlug: string;
    commentCount?: number;
    isOwner?: boolean;
    ownerUsername: string;
  };

export const FeatureCardSocialBar = ({
  bobbleheadId,
  bobbleheadSlug,
  className,
  collectionSlug,
  commentCount = 0,
  isOwner = false,
  ownerUsername,
  testId,
  ...props
}: FeatureCardSocialBarProps) => {
  const socialBarTestId = testId || generateTestId('feature', 'bobblehead-details', 'social-bar');
  const commentsButtonTestId =
    testId ? `${testId}-comments` : generateTestId('feature', 'bobblehead-details', 'comments-btn');
  const shareButtonTestId =
    testId ? `${testId}-share` : generateTestId('feature', 'bobblehead-details', 'share-btn');

  const handleCommentsClick = () => {
    // Scroll to comments section
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Focus the comment input after scrolling completes
      setTimeout(() => {
        const commentInput = document.getElementById('comment-input');
        if (commentInput) {
          commentInput.focus();
        }
      }, 500); // Delay to allow smooth scroll to complete
    }
  };

  const _commentLabel = commentCount === 1 ? 'comment' : 'comments';

  return (
    <div
      className={cn('flex flex-col gap-3', className)}
      data-slot={'feature-card-social-bar'}
      data-testid={socialBarTestId}
      {...props}
    >
      {/* Social Actions Row */}
      <div className={'flex items-center gap-4'}>
        {/* Like Button */}
        <LikeIconButtonFromContext shouldShowCount={true} />

        {/* Comments Button */}
        <Button
          aria-label={`${commentCount} ${_commentLabel}. View comments`}
          className={'gap-2 text-muted-foreground hover:text-foreground'}
          data-slot={'social-bar-comments-button'}
          onClick={handleCommentsClick}
          size={'sm'}
          testId={commentsButtonTestId}
          variant={'ghost'}
        >
          <MessageCircleIcon aria-hidden className={'size-4'} />
          <span className={'text-sm'}>{commentCount}</span>
        </Button>

        {/* Share Button */}
        <BobbleheadShareMenu
          bobbleheadSlug={bobbleheadSlug}
          collectionSlug={collectionSlug}
          ownerUsername={ownerUsername}
        >
          <Button
            aria-label={'Share this bobblehead'}
            className={'gap-2 text-muted-foreground hover:text-foreground'}
            data-slot={'social-bar-share-button'}
            size={'sm'}
            testId={shareButtonTestId}
            variant={'ghost'}
          >
            <Share2Icon aria-hidden className={'size-4'} />
            <span className={'text-sm'}>Share</span>
          </Button>
        </BobbleheadShareMenu>

        {/* Report Button (non-owners only) */}
        <Conditional isCondition={!isOwner}>
          <ReportButton
            className={'gap-2 text-muted-foreground hover:text-foreground'}
            targetId={bobbleheadId}
            targetType={'bobblehead'}
            variant={'ghost'}
          />
        </Conditional>
      </div>
    </div>
  );
};
