'use client';

import type { CommentWithDepth } from '@/lib/queries/social/social.query';

import { CommentSection } from '@/components/feature/comments/comment-section';
import { CommentSectionSkeleton } from '@/components/feature/comments/skeletons/comment-section-skeleton';
import { Conditional } from '@/components/ui/conditional';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BobbleheadCommentsDialogProps {
  /**
   * Trigger element that opens the dialog
   */
  children: React.ReactNode;
  /**
   * Comments to display in the dialog
   */
  comments?: Array<CommentWithDepth>;
  /**
   * Current user's ID for edit/delete permissions
   */
  currentUserId?: string;
  /**
   * Whether there are more comments to load
   * @default false
   */
  hasMore?: boolean;
  /**
   * Whether the user is authenticated
   * @default false
   */
  isAuthenticated?: boolean;
  /**
   * Whether comments are currently loading
   * @default false
   */
  isLoading?: boolean;
  /**
   * Controlled open state
   */
  isOpen?: boolean;
  /**
   * Callback when a new comment is created
   */
  onCommentCreate?: (content: string, parentCommentId?: string) => Promise<void> | void;
  /**
   * Callback when a comment is deleted
   */
  onCommentDelete?: (commentId: string) => Promise<void> | void;
  /**
   * Callback when a comment is updated
   */
  onCommentUpdate?: (commentId: string, content: string) => Promise<void> | void;
  /**
   * Callback to load more comments
   */
  onLoadMore?: () => void;
  /**
   * Callback when dialog open state changes
   */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Dialog component for displaying bobblehead comments with nested reply support
 * Features scrollable content area for deeply nested comment threads
 */
export const BobbleheadCommentsDialog = ({
  children,
  comments = [],
  currentUserId,
  hasMore = false,
  isAuthenticated = false,
  isLoading = false,
  isOpen,
  onCommentCreate,
  onCommentDelete,
  onCommentUpdate,
  onLoadMore,
  onOpenChange,
}: BobbleheadCommentsDialogProps) => {
  // Derived conditional rendering variables
  const _hasComments = comments.length > 0;
  const _shouldShowSkeleton = isLoading && !_hasComments;
  const _shouldShowContent = !_shouldShowSkeleton;

  // Event handlers
  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={'flex max-h-[85vh] flex-col sm:max-w-2xl'}>
        <DialogHeader className={'flex-shrink-0'}>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>View and participate in the discussion about this bobblehead.</DialogDescription>
        </DialogHeader>

        {/* Scrollable Comments Area */}
        <div className={'flex-1 overflow-y-auto pr-2'}>
          <div className={'py-4'}>
            {/* Loading State */}
            <Conditional isCondition={_shouldShowSkeleton}>
              <CommentSectionSkeleton
                commentCount={3}
                shouldShowForm={isAuthenticated}
                shouldShowNestedReplies={true}
              />
            </Conditional>

            {/* Comments Content */}
            <Conditional isCondition={_shouldShowContent}>
              <CommentSection
                comments={comments}
                currentUserId={currentUserId}
                hasMore={hasMore}
                isAuthenticated={isAuthenticated}
                isEditable={true}
                isLoading={isLoading}
                onCommentCreate={onCommentCreate}
                onCommentDelete={onCommentDelete}
                onCommentUpdate={onCommentUpdate}
                onLoadMore={onLoadMore}
              />
            </Conditional>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
