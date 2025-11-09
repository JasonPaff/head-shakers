'use client';

import type { ComponentProps } from 'react';

import { LoaderIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { Textarea } from '@/components/ui/textarea';
import { SCHEMA_LIMITS } from '@/lib/constants';
import { cn } from '@/utils/tailwind-utils';

interface CommentFormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  initialContent?: string;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (content: string) => Promise<void> | void;
  placeholder?: string;
  submitButtonText?: string;
}

/**
 * Comment submission and editing form component
 * Handles both new comment creation and comment editing with validation
 */
export const CommentForm = ({
  className,
  initialContent = '',
  isDisabled = false,
  isSubmitting = false,
  onCancel,
  onSubmit,
  placeholder = 'Write a comment...',
  submitButtonText = 'Post Comment',
  ...props
}: CommentFormProps) => {
  const [content, setContent] = useState(initialContent);

  const _isContentValid = content.trim().length >= SCHEMA_LIMITS.COMMENT.CONTENT.MIN &&
    content.length <= SCHEMA_LIMITS.COMMENT.CONTENT.MAX;
  const _isSubmitDisabled = !_isContentValid || isSubmitting || isDisabled;
  const _shouldShowCancel = !!onCancel;
  const _characterCount = content.length;
  const _isNearLimit = _characterCount > SCHEMA_LIMITS.COMMENT.CONTENT.MAX * 0.9;
  const _isOverLimit = _characterCount > SCHEMA_LIMITS.COMMENT.CONTENT.MAX;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (_isContentValid && !isSubmitting) {
      await onSubmit(content.trim());
      setContent('');
    }
  };

  const handleCancelClick = () => {
    if (onCancel) {
      setContent(initialContent);
      onCancel();
    }
  };

  return (
    <form
      className={cn('space-y-3', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      {/* Comment Input Section */}
      <div className={'relative'}>
        <Textarea
          aria-describedby={'comment-character-count'}
          aria-invalid={_isOverLimit}
          aria-label={'Comment content'}
          className={cn(
            'min-h-24 resize-none',
            _isOverLimit && 'border-destructive focus-visible:border-destructive',
          )}
          disabled={isDisabled || isSubmitting}
          maxLength={SCHEMA_LIMITS.COMMENT.CONTENT.MAX + 100}
          onChange={handleContentChange}
          placeholder={placeholder}
          value={content}
        />

        {/* Character Count */}
        <div
          className={cn(
            'absolute right-2 bottom-2 text-xs',
            _isOverLimit ? 'text-destructive' :
            _isNearLimit ? 'text-orange-600' :
            'text-muted-foreground',
          )}
          id={'comment-character-count'}
        >
          {_characterCount} / {SCHEMA_LIMITS.COMMENT.CONTENT.MAX}
        </div>
      </div>

      {/* Form Actions */}
      <div className={'flex justify-end gap-2'}>
        <Conditional isCondition={_shouldShowCancel}>
          <Button
            disabled={isSubmitting}
            onClick={handleCancelClick}
            type={'button'}
            variant={'outline'}
          >
            Cancel
          </Button>
        </Conditional>

        <Button
          aria-busy={isSubmitting}
          disabled={_isSubmitDisabled}
          type={'submit'}
          variant={'default'}
        >
          <Conditional isCondition={isSubmitting}>
            <LoaderIcon aria-hidden className={'mr-2 size-4 animate-spin'} />
          </Conditional>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};
