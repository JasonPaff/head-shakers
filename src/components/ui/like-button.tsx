'use client';

import type { ComponentProps } from 'react';

import { SignUpButton } from '@clerk/nextjs';
import NumberFlow from '@number-flow/react';
import { HeartIcon } from 'lucide-react';
import { Fragment } from 'react';

import type { LikeTargetType } from '@/lib/constants';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { useLike } from '@/hooks/use-like';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface LikeButtonBaseProps extends ComponentTestIdProps, Omit<ComponentProps<typeof Button>, 'onClick'> {
  initialLikeCount: number;
  isInitiallyLiked: boolean;
  onLikeChange?: (isLiked: boolean, likeCount: number) => void;
  targetId: string;
  targetType: LikeTargetType;
}

interface LikeIconButtonProps extends LikeButtonBaseProps {
  shouldShowCount?: boolean;
}

export const LikeIconButton = ({
  className,
  disabled,
  initialLikeCount,
  isInitiallyLiked,
  onLikeChange,
  shouldShowCount = true,
  targetId,
  targetType,
  testId,
  ...props
}: LikeIconButtonProps) => {
  const { isLiked, isPending, isSignedIn, likeCount, toggleLike } = useLike({
    initialLikeCount,
    isInitiallyLiked,
    onLikeChange,
    targetId,
    targetType,
  });

  const likeButtonTestId = testId || generateTestId('ui', 'like-button', 'icon');

  const handleClick = () => {
    if (!isSignedIn) return;
    toggleLike();
  };

  const authenticatedAriaLabel = `${isLiked ? 'Unlike' : 'Like'} this ${targetType}. ${likeCount} like${likeCount === 1 ? '' : 's'}`;
  const unauthenticatedAriaLabel = `${likeCount} like${likeCount === 1 ? '' : 's'}. Sign in to like this ${targetType}`;

  const buttonElement = (
    <button
      aria-label={isSignedIn ? authenticatedAriaLabel : unauthenticatedAriaLabel}
      aria-pressed={isLiked}
      className={cn(
        'group relative rounded-full p-2 transition-all duration-300 ease-out',
        'hover:scale-110 active:scale-95',
        isLiked ?
          'bg-destructive text-white shadow-lg shadow-red-200 dark:shadow-red-900/40'
        : `bg-muted text-gray-400 hover:bg-red-200 hover:text-destructive
         dark:bg-gray-800 dark:text-white dark:hover:bg-destructive/75`,
        className,
      )}
      data-testid={likeButtonTestId}
      disabled={disabled || isPending}
      onClick={handleClick}
      {...props}
    >
      <HeartIcon
        aria-hidden
        className={cn(
          'size-4 transition-all duration-300',
          isLiked ? 'fill-current' : 'group-hover:scale-110',
        )}
      />
    </button>
  );

  return (
    <div className={'flex items-center gap-3'}>
      {isSignedIn ? buttonElement : <SignUpButton mode={'modal'}>{buttonElement}</SignUpButton>}

      <Conditional isCondition={shouldShowCount}>
        <div className={'flex items-baseline gap-0.5 text-muted-foreground'}>
          <NumberFlow value={likeCount} />
          <div className={'text-xs'}>like{likeCount === 1 ? '' : 's'}</div>
        </div>
      </Conditional>
    </div>
  );
};

type LikeTextButtonProps = Children<
  LikeButtonBaseProps & {
    shouldShowIcon?: boolean;
  }
>;

export const LikeTextButton = ({
  children,
  className,
  disabled,
  initialLikeCount,
  isInitiallyLiked,
  onLikeChange,
  shouldShowIcon = true,
  targetId,
  targetType,
  testId,
  ...props
}: LikeTextButtonProps) => {
  const { isLiked, isPending, isSignedIn, likeCount, toggleLike } = useLike({
    initialLikeCount,
    isInitiallyLiked,
    onLikeChange,
    targetId,
    targetType,
  });

  const likeButtonTestId = testId || generateTestId('ui', 'like-button', 'text');

  const handleClick = () => {
    if (!isSignedIn) return;
    toggleLike();
  };

  const buttonContent = children || (
    <Fragment>
      <Conditional isCondition={shouldShowIcon}>
        <HeartIcon aria-hidden className={cn('mr-2 size-4', isLiked && 'fill-current')} />
      </Conditional>
      Like ({likeCount})
    </Fragment>
  );

  const buttonElement = (
    <Button
      className={cn('disabled:opacity-100', className)}
      disabled={disabled || isPending}
      onClick={handleClick}
      testId={likeButtonTestId}
      {...props}
    >
      {buttonContent}
    </Button>
  );

  if (!isSignedIn) {
    return <SignUpButton mode={'modal'}>{buttonElement}</SignUpButton>;
  }

  return buttonElement;
};

interface LikeCompactButtonProps extends LikeButtonBaseProps {
  shouldShowIcon?: boolean;
}

export const LikeCompactButton = ({
  className,
  disabled,
  initialLikeCount,
  isInitiallyLiked,
  onLikeChange,
  shouldShowIcon = true,
  targetId,
  targetType,
  testId,
  ...props
}: LikeCompactButtonProps) => {
  const { isLiked, isPending, isSignedIn, likeCount, toggleLike } = useLike({
    initialLikeCount,
    isInitiallyLiked,
    onLikeChange,
    targetId,
    targetType,
  });

  const likeButtonTestId = testId || generateTestId('ui', 'like-button', 'compact');

  const handleClick = () => {
    if (!isSignedIn) return;
    toggleLike();
  };

  const buttonElement = (
    <button
      aria-label={`${isLiked ? 'Unlike' : 'Like'} this ${targetType}. ${likeCount} like${likeCount === 1 ? '' : 's'}`}
      aria-pressed={isLiked}
      className={cn(
        'inline-flex items-center gap-1 text-sm transition-colors',
        isLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive',
        className,
      )}
      data-testid={likeButtonTestId}
      disabled={disabled || isPending}
      onClick={handleClick}
      {...props}
    >
      <Conditional isCondition={shouldShowIcon}>
        <HeartIcon aria-hidden className={cn('size-4', isLiked && 'fill-current')} />
      </Conditional>
      <NumberFlow value={likeCount} />
    </button>
  );

  if (!isSignedIn) {
    return <SignUpButton mode={'modal'}>{buttonElement}</SignUpButton>;
  }

  return buttonElement;
};
