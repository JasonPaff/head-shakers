import 'server-only';

import type { ComponentProps } from 'react';

import type { CommentTargetType } from '@/lib/constants';

import { CommentSectionClient } from '@/components/feature/comments/async/comment-section-client';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getOptionalUserIdAsync } from '@/utils/optional-auth-utils';

interface CommentSectionAsyncProps extends Omit<ComponentProps<'div'>, 'children'> {
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
}

/**
 * Async server component wrapper for comment section
 * Fetches initial comment data server-side and passes to client component
 * Uses getCommentsWithReplies for threaded/nested comment display
 */
export const CommentSectionAsync = async ({
  initialLimit = 10,
  targetId,
  targetType,
  ...props
}: CommentSectionAsyncProps) => {
  // Get current user ID if authenticated
  const currentUserId = await getOptionalUserIdAsync();
  const isAuthenticated = !!currentUserId;

  // Fetch initial comments with nested replies for threaded display
  const { comments, hasMore, total } = await SocialFacade.getCommentsWithReplies(
    targetId,
    targetType,
    {
      limit: initialLimit,
      offset: 0,
    },
    currentUserId || undefined,
  );

  return (
    <CommentSectionClient
      currentUserId={currentUserId || undefined}
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
