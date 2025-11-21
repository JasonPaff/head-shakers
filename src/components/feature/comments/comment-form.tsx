'use client';

import type { ComponentProps } from 'react';

import { LoaderIcon, ReplyIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { Textarea } from '@/components/ui/textarea';
import { SCHEMA_LIMITS } from '@/lib/constants';
import { cn } from '@/utils/tailwind-utils';

interface CommentFormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  initialContent?: string;
  isAtMaxDepth?: boolean;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onCancelReply?: () => void;
  onSubmit: (content: string, parentCommentId?: string) => Promise<void> | void;
  parentCommentAuthor?: string;
  parentCommentId?: string;
  placeholder?: string;
  submitButtonText?: string;
}

/**
 * Comment submission and editing form component
 * Handles both new comment creation, comment editing, and reply mode with validation
 * Supports nested replies with depth limit awareness
 */
export const CommentForm = ({
  className,
  initialContent = '',
  isAtMaxDepth = false,
  isDisabled = false,
  isSubmitting = false,
  onCancel,
  onCancelReply,
  onSubmit,
  parentCommentAuthor,
  parentCommentId,
  placeholder = 'Write a comment...',
  submitButtonText = 'Post Comment',
  ...props
}: CommentFormProps) => {
  const [content, setContent] = useState(initialContent);

  // 7. Derived values for conditional rendering
  const _isReplyMode = !!parentCommentId;
  const _isContentValid =
    content.trim().length >= SCHEMA_LIMITS.COMMENT.CONTENT.MIN &&
    content.length <= SCHEMA_LIMITS.COMMENT.CONTENT.MAX;
  const _isSubmitDisabled = !_isContentValid || isSubmitting || isDisabled || isAtMaxDepth;
  const _shouldShowCancel = !!onCancel;
  const _shouldShowReplyContext = _isReplyMode && !!parentCommentAuthor;
  const _shouldShowCancelReply = _isReplyMode && !!onCancelReply;
  const _characterCount = content.length;
  const _isNearLimit = _characterCount > SCHEMA_LIMITS.COMMENT.CONTENT.MAX * 0.9;
  const _isOverLimit = _characterCount > SCHEMA_LIMITS.COMMENT.CONTENT.MAX;
  const _effectivePlaceholder = _isReplyMode ? `Reply to ${parentCommentAuthor ?? 'comment'}...` : placeholder;
  const _effectiveSubmitText = _isReplyMode ? 'Post Reply' : submitButtonText;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (_isContentValid && !isSubmitting && !isAtMaxDepth) {
      await onSubmit(content.trim(), parentCommentId);
      setContent('');
    }
  };

  const handleCancelClick = () => {
    if (onCancel) {
      setContent(initialContent);
      onCancel();
    }
  };

  const handleCancelReplyClick = () => {
    if (onCancelReply) {
      setContent('');
      onCancelReply();
    }
  };

  return (
    <form className={cn('space-y-3', className)} onSubmit={handleSubmit} {...props}>
      {/* Reply Context Indicator */}
      <Conditional isCondition={_shouldShowReplyContext}>
        <div
          className={cn(
            'flex items-center justify-between gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2',
          )}
        >
          <div className={'flex items-center gap-2 text-sm text-muted-foreground'}>
            <ReplyIcon aria-hidden className={'size-4'} />
            <span>
              Replying to <span className={'font-medium text-foreground'}>{parentCommentAuthor}</span>
            </span>
          </div>
          <Conditional isCondition={_shouldShowCancelReply}>
            <Button
              aria-label={'Cancel reply'}
              className={'size-6 p-0'}
              onClick={handleCancelReplyClick}
              type={'button'}
              variant={'ghost'}
            >
              <XIcon aria-hidden className={'size-4'} />
            </Button>
          </Conditional>
        </div>
      </Conditional>

      {/* Max Depth Warning */}
      <Conditional isCondition={isAtMaxDepth}>
        <div
          className={cn(
            'rounded-md border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-sm text-orange-600',
          )}
          role={'alert'}
        >
          Maximum reply depth reached. You cannot reply to this comment.
        </div>
      </Conditional>

      {/* Comment Input Section */}
      <div className={'relative'}>
        <Textarea
          aria-describedby={'comment-character-count'}
          aria-invalid={_isOverLimit}
          aria-label={_isReplyMode ? 'Reply content' : 'Comment content'}
          className={cn(
            'min-h-24 resize-none',
            _isOverLimit && 'border-destructive focus-visible:border-destructive',
            isAtMaxDepth && 'cursor-not-allowed opacity-50',
          )}
          disabled={isDisabled || isSubmitting || isAtMaxDepth}
          maxLength={SCHEMA_LIMITS.COMMENT.CONTENT.MAX + 100}
          onChange={handleContentChange}
          placeholder={_effectivePlaceholder}
          value={content}
        />

        {/* Character Count */}
        <div
          className={cn(
            'absolute right-2 bottom-2 text-xs',
            _isOverLimit ? 'text-destructive'
            : _isNearLimit ? 'text-orange-600'
            : 'text-muted-foreground',
          )}
          id={'comment-character-count'}
        >
          {_characterCount} / {SCHEMA_LIMITS.COMMENT.CONTENT.MAX}
        </div>
      </div>

      {/* Form Actions */}
      <div className={'flex justify-end gap-2'}>
        <Conditional isCondition={_shouldShowCancel}>
          <Button disabled={isSubmitting} onClick={handleCancelClick} type={'button'} variant={'outline'}>
            Cancel
          </Button>
        </Conditional>

        <Button aria-busy={isSubmitting} disabled={_isSubmitDisabled} type={'submit'} variant={'default'}>
          <Conditional isCondition={isSubmitting}>
            <LoaderIcon aria-hidden className={'mr-2 size-4 animate-spin'} />
          </Conditional>
          {_effectiveSubmitText}
        </Button>
      </div>
    </form>
  );
};
