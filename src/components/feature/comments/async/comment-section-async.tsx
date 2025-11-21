import 'server-only';

import type { ComponentProps } from 'react';

import type { CommentTargetType } from '@/lib/constants';
import type { CommentWithDepth, CommentWithUser } from '@/lib/queries/social/social.query';

import { CommentSectionClient } from '@/components/feature/comments/async/comment-section-client';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

/**
 * Normalizes a CommentWithUser to CommentWithDepth format
 * Adds depth and replies properties for nested comment support
 */
const normalizeComment = (comment: CommentWithUser, depth = 0): CommentWithDepth => {
  return {
    ...comment,
    depth,
    replies: [],
  };
};

interface CommentSectionAsyncProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * Initial number of comments to fetch
   * @default 10
   */
  initialLimit?: number;
  /**
   * ID of the target entity (bobblehead, collection, or subcollection)
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
 */
export const CommentSectionAsync = async ({
  initialLimit = 10,
  targetId,
  targetType,
  ...props
}: CommentSectionAsyncProps) => {
  // Get current user ID if authenticated
  const currentUserId = await getOptionalUserId();
  const isAuthenticated = !!currentUserId;

  // Fetch initial comments with pagination
  const { comments, hasMore, total } = await SocialFacade.getComments(
    targetId,
    targetType,
    {
      limit: initialLimit,
      offset: 0,
    },
    currentUserId || undefined,
  );

  // Normalize comments to include depth information for nested reply support
  const normalizedComments = comments.map((comment) => normalizeComment(comment, 0));

  return (
    <CommentSectionClient
      currentUserId={currentUserId || undefined}
      hasMore={hasMore}
      initialCommentCount={total}
      initialComments={normalizedComments}
      isAuthenticated={isAuthenticated}
      targetId={targetId}
      targetType={targetType}
      {...props}
    />
  );
};
