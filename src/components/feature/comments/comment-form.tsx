'use client';

import type { ChangeEvent, ComponentProps, FormEvent } from 'react';

import { LoaderIcon, ReplyIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { Textarea } from '@/components/ui/textarea';
import { SCHEMA_LIMITS } from '@/lib/constants';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type CommentFormProps = ComponentTestIdProps &
  Omit<ComponentProps<'form'>, 'onSubmit'> & {
    initialContent?: string;
    isAtMaxDepth?: boolean;
    isDisabled?: boolean;
    isSubmitting?: boolean;
    onCancel?: () => void;
    onCancelReply?: () => void;
    onSubmit: (content: string, parentCommentId?: string) => Promise<void> | void;
    parentCommentAuthor?: string;
    parentCommentContent?: string;
    parentCommentId?: string;
    placeholder?: string;
    submitButtonText?: string;
  };

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
  parentCommentContent,
  parentCommentId,
  placeholder = 'Write a comment...',
  submitButtonText = 'Post Comment',
  testId,
  ...props
}: CommentFormProps) => {
  // 1. useState hooks
  const [content, setContent] = useState(initialContent);

  // 2. Other hooks
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 4. useEffect hooks
  useEffect(() => {
    if (parentCommentId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [parentCommentId]);

  // 6. Event handlers
  const handleContentChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const isContentValid =
        content.trim().length >= SCHEMA_LIMITS.COMMENT.CONTENT.MIN &&
        content.length <= SCHEMA_LIMITS.COMMENT.CONTENT.MAX;

      if (isContentValid && !isSubmitting && !isAtMaxDepth) {
        await onSubmit(content.trim(), parentCommentId);
        setContent('');
      }
    },
    [content, isSubmitting, isAtMaxDepth, onSubmit, parentCommentId],
  );

  const handleCancelClick = useCallback(() => {
    if (onCancel) {
      setContent(initialContent);
      onCancel();
    }
  }, [onCancel, initialContent]);

  const handleCancelReplyClick = useCallback(() => {
    if (onCancelReply) {
      setContent('');
      onCancelReply();
    }
  }, [onCancelReply]);

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
  const _effectivePlaceholder =
    _isReplyMode ? `Reply to ${parentCommentAuthor ?? 'comment'}...` : placeholder;
  const _effectiveSubmitText = _isReplyMode ? 'Post Reply' : submitButtonText;

  const componentTestId = testId ?? generateTestId('feature', 'comment-form');

  return (
    <form
      className={cn('space-y-3', className)}
      data-slot={'comment-form'}
      data-testid={componentTestId}
      onSubmit={handleSubmit}
      {...props}
    >
      {/* Reply Context Indicator */}
      <Conditional isCondition={_shouldShowReplyContext}>
        <div className={cn('flex flex-col gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2')}>
          <div className={'flex items-center justify-between gap-2'}>
            <div className={'flex items-center gap-2 text-sm text-muted-foreground'}>
              <ReplyIcon aria-hidden className={'size-4 shrink-0'} />
              <span>
                Replying to <span className={'font-medium text-foreground'}>{parentCommentAuthor}</span>
              </span>
            </div>
            <Conditional isCondition={_shouldShowCancelReply}>
              <Button
                aria-label={'Cancel reply'}
                className={'size-6 shrink-0 p-0'}
                onClick={handleCancelReplyClick}
                type={'button'}
                variant={'ghost'}
              >
                <XIcon aria-hidden className={'size-4'} />
              </Button>
            </Conditional>
          </div>
          <Conditional isCondition={!!parentCommentContent}>
            <div className={'border-l-2 border-primary/30 pl-3 text-xs text-muted-foreground'}>
              <p className={'line-clamp-2 italic'}>&ldquo;{parentCommentContent}&rdquo;</p>
            </div>
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
          id={'comment-input'}
          maxLength={SCHEMA_LIMITS.COMMENT.CONTENT.MAX + 100}
          onChange={handleContentChange}
          placeholder={_effectivePlaceholder}
          ref={textareaRef}
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
