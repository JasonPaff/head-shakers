'use client';

import type { ComponentProps } from 'react';

import { SignUpButton, useAuth } from '@clerk/nextjs';
import NumberFlow from '@number-flow/react';
import { HeartIcon } from 'lucide-react';
import { useOptimisticAction } from 'next-safe-action/hooks';

import type { LikeTargetType } from '@/lib/constants';

import { AuthContent } from '@/components/ui/auth';
import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';
import { toggleLikeAction } from '@/lib/actions/social/social.actions';
import { cn } from '@/utils/tailwind-utils';

interface LikeButtonProps extends Omit<ComponentProps<'button'>, 'children' | 'onClick'> {
  initialLikeCount: number;
  isInitiallyLiked: boolean;
  onLikeChange?: (isLiked: boolean, likeCount: number) => void;
  shouldShowLikeCount?: boolean;
  targetId: string;
  targetType: LikeTargetType;
}

export const LikeButton = ({
  className,
  disabled,
  initialLikeCount,
  isInitiallyLiked,
  onLikeChange,
  shouldShowLikeCount = true,
  targetId,
  targetType,
  ...props
}: LikeButtonProps) => {
  const [isBursting, setIsBursting] = useToggle();

  const { isSignedIn } = useAuth();

  const {
    execute: toggleLike,
    isPending,
    optimisticState,
  } = useOptimisticAction(toggleLikeAction, {
    currentState: {
      isLiked: isInitiallyLiked,
      likeCount: initialLikeCount,
    },
    updateFn: (currentState) => {
      return {
        isLiked: !currentState.isLiked,
        likeCount: currentState.isLiked ? Math.max(0, initialLikeCount - 1) : initialLikeCount + 1,
      };
    },
  });

  const handleLikeToggle = () => {
    if (isPending) return;

    const isLiked = !optimisticState.isLiked;
    const unlikedCount = Math.max(0, optimisticState.likeCount - 1);
    const likedCount = isLiked ? optimisticState.likeCount + 1 : unlikedCount;

    // show burst animation only when liking
    if (isLiked && isSignedIn) {
      setIsBursting.on();
      setTimeout(() => setIsBursting.off(), 800);
    }

    onLikeChange?.(isLiked, likedCount);

    toggleLike({
      targetId,
      targetType,
    });
  };

  const _displayedLikeCount = shouldShowLikeCount ? optimisticState.likeCount : 0;
  const _authenticatedAriaLabel =
    props['aria-label'] ||
    `${optimisticState.isLiked ? 'Unlike' : 'Like'} this ${targetType}. ${optimisticState.likeCount} likes`;
  const _unauthenticatedAriaLabel =
    props['aria-label'] || `${optimisticState.likeCount} likes. Sign in to like this ${targetType}`;

  return (
    <div className={'relative'}>
      <AuthContent
        fallback={
          <div className={'flex items-center gap-3'}>
            {/* Sign Up Like Button */}
            <SignUpButton mode={'modal'}>
              <button
                aria-label={_unauthenticatedAriaLabel}
                aria-pressed={optimisticState.isLiked}
                className={cn(
                  'group relative rounded-full p-3 transition-all duration-300 ease-out',
                  'hover:scale-110 active:scale-95',
                  optimisticState.isLiked ?
                    'bg-red-50 text-red-500 shadow-lg shadow-red-100'
                  : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-400',
                  className,
                )}
                disabled={disabled}
                onClick={handleLikeToggle}
                {...props}
              >
                <HeartIcon
                  aria-hidden
                  className={cn(
                    'size-5 transition-all duration-300',
                    optimisticState.isLiked ? 'fill-current' : 'group-hover:scale-110',
                  )}
                />
              </button>
            </SignUpButton>
            <Conditional isCondition={shouldShowLikeCount}>
              <div className={'text-right'}>
                <NumberFlow value={_displayedLikeCount} />
                <div className={'text-xs'}>likes</div>
              </div>
            </Conditional>
          </div>
        }
      >
        <div className={'flex items-center gap-3'}>
          {/* Like Button */}
          <button
            aria-label={_authenticatedAriaLabel}
            aria-pressed={optimisticState.isLiked}
            className={cn(
              'group relative rounded-full p-3 transition-all duration-300 ease-out',
              'hover:scale-110 hover:shadow-lg active:scale-95',
              optimisticState.isLiked ?
                'bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-red-900/40'
              : [
                  'bg-gray-100 text-gray-400 hover:bg-red-200 hover:text-destructive',
                  'dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-red-950',
                ],
            )}
            disabled={disabled}
            onClick={handleLikeToggle}
            {...props}
          >
            <HeartIcon
              aria-hidden
              className={cn(
                'size-5 transition-all duration-300',
                optimisticState.isLiked ? 'fill-current' : 'group-hover:scale-110',
              )}
            />
          </button>

          {/* Like Count */}
          <Conditional isCondition={shouldShowLikeCount}>
            <div className={'text-center text-muted-foreground'}>
              <NumberFlow value={_displayedLikeCount} />
              <div className={'text-xs'}>likes</div>
            </div>
          </Conditional>
        </div>
      </AuthContent>

      {/* Bursting Animation */}
      <Conditional isCondition={isBursting}>
        {[...(Array(6) as Array<number>)].map((_, i) => (
          <div
            className={cn(
              'absolute top-1/2 left-1/2 h-2 w-2 animate-ping',
              'rounded-full bg-destructive opacity-75',
            )}
            key={i}
            style={{
              animationDelay: `${i * 100}ms`,
              animationDuration: '600ms',
              transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-20px)`,
            }}
          />
        ))}
      </Conditional>
    </div>
  );
};
