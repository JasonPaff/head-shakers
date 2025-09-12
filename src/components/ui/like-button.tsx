'use client';

import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { SignInButton } from '@clerk/nextjs';
import { cva } from 'class-variance-authority';
import { HeartIcon, Loader2Icon } from 'lucide-react';
import { Fragment } from 'react';
import { useCallback, useOptimistic, useState } from 'react';

import type { LikeTargetType } from '@/lib/constants';

import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { useServerAction } from '@/hooks/use-server-action';
import { toggleLikeAction } from '@/lib/actions/social/social.actions';
import { cn } from '@/utils/tailwind-utils';

const likeButtonVariants = cva('transition-colors', {
  defaultVariants: {
    size: 'default',
    variant: 'ghost',
  },
  variants: {
    size: {
      default: 'h-9 gap-2',
      icon: 'size-9',
      lg: 'h-10 gap-2',
      sm: 'h-8 gap-1.5 text-sm',
    },
    variant: {
      default: 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      subtle: 'text-muted-foreground hover:text-foreground',
    },
  },
});

interface LikeButtonProps
  extends Omit<ComponentProps<'button'>, 'children' | 'onClick'>,
    VariantProps<typeof likeButtonVariants> {
  ariaLabel?: string;
  initialLikeCount: number;
  isIconOnly?: boolean;
  isInitiallyLiked: boolean;
  onLikeChange?: (isLiked: boolean, likeCount: number) => void;
  shouldShowCount?: boolean;
  targetId: string;
  targetType: LikeTargetType;
}

export const LikeButton = ({
  ariaLabel,
  className,
  disabled,
  initialLikeCount,
  isIconOnly = false,
  isInitiallyLiked,
  onLikeChange,
  shouldShowCount = true,
  size = 'default',
  targetId,
  targetType,
  variant = 'default',
  ...props
}: LikeButtonProps) => {
  const [baseState, setBaseState] = useState({
    isLiked: isInitiallyLiked,
    likeCount: initialLikeCount,
  });

  const [optimisticState, addOptimistic] = useOptimistic(
    baseState,
    (_currentState, optimisticUpdate: { isLiked: boolean; likeCount: number }) => optimisticUpdate,
  );

  const { executeAsync, isPending } = useServerAction(toggleLikeAction, {
    onError: () => {
      onLikeChange?.(baseState.isLiked, baseState.likeCount);
    },
    onSuccess: (result) => {
      if (
        result?.data &&
        typeof result.data === 'object' &&
        'isLiked' in result.data &&
        'likeCount' in result.data
      ) {
        const serverState = {
          isLiked: Boolean(result.data.isLiked),
          likeCount: Number(result.data.likeCount) || 0,
        };
        setBaseState(serverState);
        onLikeChange?.(serverState.isLiked, serverState.likeCount);
      }
    },
    toastMessages: {
      error: 'Failed to update like status. Please try again.',
      loading: 'Updating...',
      success: (data: unknown) => {
        if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
          return data.message;
        }
        return 'Like updated!';
      },
    },
  });

  const handleLikeToggle = useCallback(async () => {
    if (isPending) return;

    const isLiked = !optimisticState.isLiked;
    const likeCount = isLiked ? optimisticState.likeCount + 1 : Math.max(0, optimisticState.likeCount - 1);

    addOptimistic({
      isLiked,
      likeCount,
    });

    onLikeChange?.(isLiked, likeCount);

    await executeAsync({
      targetId,
      targetType,
    });
  }, [executeAsync, isPending, optimisticState, targetId, targetType, onLikeChange, addOptimistic]);

  const isLiked = optimisticState.isLiked;
  const shouldShowLikeCount = shouldShowCount && !isIconOnly;
  const displayedLikeCount = shouldShowLikeCount ? optimisticState.likeCount : null;
  const fallbackAriaLabel = `${optimisticState.likeCount} likes. Sign in to like this ${targetType}`;
  const authenticatedAriaLabel = `${isLiked ? 'Unlike' : 'Like'} this ${targetType}. ${optimisticState.likeCount} likes`;

  return (
    <AuthContent
      fallback={
        <SignInButton mode={'modal'}>
          <Button
            aria-label={ariaLabel || fallbackAriaLabel}
            className={cn(likeButtonVariants({ size, variant }), className)}
            disabled={true}
            {...props}
          >
            <Fragment>
              {/* Like Loading */}
              <Conditional isCondition={isPending}>
                <Loader2Icon aria-hidden className={'animate-spin'} />
              </Conditional>
              {/* Like Icon */}
              <Conditional isCondition={!isPending}>
                <HeartIcon
                  aria-hidden
                  className={cn(
                    'transition-all duration-200',
                    isLiked && 'fill-destructive text-destructive',
                    !isLiked && 'text-current',
                    isPending && 'scale-110',
                  )}
                />
              </Conditional>

              {/* Like Count */}
              <Conditional isCondition={displayedLikeCount !== null}>
                <span className={'tabular-nums'}>{displayedLikeCount?.toLocaleString()}</span>
              </Conditional>
            </Fragment>
          </Button>
        </SignInButton>
      }
    >
      <Button
        aria-label={ariaLabel || authenticatedAriaLabel}
        aria-pressed={isLiked}
        className={cn(likeButtonVariants({ size, variant }), className)}
        disabled={disabled || isPending}
        onClick={handleLikeToggle}
        {...props}
      >
        <Fragment>
          <Conditional isCondition={isPending}>
            <Loader2Icon aria-hidden className={'animate-spin'} />
          </Conditional>
          <Conditional isCondition={!isPending}>
            <HeartIcon
              aria-hidden
              className={cn(
                'transition-all duration-200',
                isLiked && 'fill-destructive text-destructive',
                !isLiked && 'text-current',
                isPending && 'scale-110',
              )}
            />
          </Conditional>
          <Conditional isCondition={displayedLikeCount !== null}>
            <span className={'tabular-nums'}>{displayedLikeCount?.toLocaleString()}</span>
          </Conditional>
        </Fragment>
      </Button>
    </AuthContent>
  );
};

export const LikeIconButton = (props: Omit<LikeButtonProps, 'isIconOnly' | 'shouldShowCount'>) => (
  <LikeButton {...props} isIconOnly shouldShowCount={false} size={'icon'} />
);

export const LikeCountButton = (props: LikeButtonProps) => <LikeButton {...props} shouldShowCount />;
