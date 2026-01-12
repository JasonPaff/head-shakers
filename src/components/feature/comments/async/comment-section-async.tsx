import 'server-only';

import type { ComponentProps } from 'react';

import type { CommentTargetType } from '@/lib/constants';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { CommentSectionClient } from '@/components/feature/comments/async/comment-section-client';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

type CommentSectionAsyncProps = ComponentTestIdProps &
  Omit<ComponentProps<'div'>, 'children'> & {
    /**
     * Initial number of comments to fetch
     * @default 10
     */
    initialLimit?: number;
    /**
     * ID of the target entity (bobblehead or collection)
     */
    targetId: string;
    /**
     * Type of the target entity
     */
    targetType: CommentTargetType;
  };

/**
 * Async server component wrapper for comment section
 * Fetches initial comment data server-side and passes to client component
 * Uses getCommentsWithReplies for threaded/nested comment display
 */
export const CommentSectionAsync = async ({
  initialLimit = 10,
  targetId,
  targetType,
  testId,
  ...props
}: CommentSectionAsyncProps) => {
  // Get current user ID if authenticated
  const currentUserId = await getUserIdAsync();
  const isAuthenticated = !!currentUserId;

  // Fetch initial comments with nested replies for threaded display
  const { comments, hasMore, total } = await SocialFacade.getCommentsWithRepliesAsync(
    targetId,
    targetType,
    {
      limit: initialLimit,
      offset: 0,
    },
    currentUserId || undefined,
  );

  const componentTestId = testId ?? 'feature-comment-section-async';

  return (
    <CommentSectionClient
      currentUserId={currentUserId || undefined}
      data-slot={'comment-section-async'}
      data-testid={componentTestId}
      hasMore={hasMore}
      initialCommentCount={total}
      initialComments={comments}
      initialLimit={initialLimit}
      isAuthenticated={isAuthenticated}
      targetId={targetId}
      targetType={targetType}
      {...props}
    />
  );
};
