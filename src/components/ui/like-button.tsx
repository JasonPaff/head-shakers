/* eslint-disable react-snob/no-inline-styles,@typescript-eslint/no-unsafe-assignment */
'use client';

import type { ComponentProps } from 'react';

import { SignInButton } from '@clerk/nextjs';
import { HeartIcon } from 'lucide-react';
import { useCallback, useOptimistic } from 'react';

import type { LikeTargetType } from '@/lib/constants';

import { AuthContent } from '@/components/ui/auth';
import { Conditional } from '@/components/ui/conditional';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { toggleLikeAction } from '@/lib/actions/social/social.actions';
import { cn } from '@/utils/tailwind-utils';

interface LikeButtonProps extends Omit<ComponentProps<'button'>, 'children' | 'onClick'> {
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
  targetId,
  targetType,
  ...props
}: LikeButtonProps) => {
  const [isBursting, setIsBursting] = useToggle();

  const [optimisticState, addOptimistic] = useOptimistic(
    {
      isLiked: isInitiallyLiked,
      likeCount: initialLikeCount,
    },
    (_currentState, optimisticUpdate: { isLiked: boolean; likeCount: number }) => optimisticUpdate,
  );

  const { executeAsync, isPending } = useServerAction(toggleLikeAction, {
    isDisableToast: true,
  });

  const handleLikeToggle = useCallback(async () => {
    if (isPending) return;

    const isLiked = !optimisticState.isLiked;
    const likeCount = isLiked ? optimisticState.likeCount + 1 : Math.max(0, optimisticState.likeCount - 1);

    setIsBursting.update(!optimisticState.isLiked);
    setTimeout(() => setIsBursting.off(), 800);

    addOptimistic({
      isLiked,
      likeCount,
    });

    onLikeChange?.(isLiked, likeCount);

    await executeAsync({
      targetId,
      targetType,
    });
  }, [
    isPending,
    optimisticState.isLiked,
    optimisticState.likeCount,
    setIsBursting,
    addOptimistic,
    onLikeChange,
    executeAsync,
    targetId,
    targetType,
  ]);

  const isLiked = optimisticState.isLiked;
  const shouldShowLikeCount = shouldShowCount && !isIconOnly;
  const displayedLikeCount = shouldShowLikeCount ? optimisticState.likeCount : null;
  const authenticatedAriaLabel =
    ariaLabel || `${isLiked ? 'Unlike' : 'Like'} this ${targetType}. ${optimisticState.likeCount} likes`;

  return (
    <div className={'relative'}>
      <AuthContent
        fallback={
          <div className={'flex items-center gap-3'}>
            <SignInButton mode={'modal'}>
              <button
                aria-label={`${optimisticState.likeCount} likes. Sign in to like this ${targetType}`}
                aria-pressed={isLiked}
                className={cn(
                  'group relative rounded-full p-3 transition-all duration-300 ease-out',
                  'hover:scale-110 active:scale-95',
                  isLiked ?
                    'bg-red-50 text-red-500 shadow-lg shadow-red-100'
                  : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-400',
                  className,
                )}
                disabled={disabled || isPending}
                onClick={handleLikeToggle}
              >
                <HeartIcon aria-hidden className={'size-5 transition-all duration-300'} />
              </button>
            </SignInButton>
            <Conditional isCondition={displayedLikeCount !== null}>
              <div className={'text-right'}>
                <div className={'text-lg font-bold text-gray-800'}>
                  {displayedLikeCount?.toLocaleString()}
                </div>
                <div className={'text-xs text-gray-500'}>likes</div>
              </div>
            </Conditional>
          </div>
        }
      >
        <div className={'flex items-center gap-3'}>
          <button
            aria-label={authenticatedAriaLabel}
            aria-pressed={isLiked}
            className={cn(
              'group relative rounded-full p-3 transition-all duration-300 ease-out',
              'hover:scale-110 hover:shadow-lg active:scale-95',
              isLiked ?
                'bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-red-900/40'
              : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-red-950/30',
            )}
            disabled={disabled || isPending}
            onClick={handleLikeToggle}
            {...props}
          >
            <HeartIcon
              aria-hidden
              className={cn(
                'size-5 transition-all duration-300',
                isLiked ? 'fill-current' : 'group-hover:scale-110',
              )}
            />
          </button>

          {/* Like Count */}
          <Conditional isCondition={displayedLikeCount !== null}>
            <div className={'text-right text-muted-foreground'}>
              <div className={'text-lg font-bold'}>{displayedLikeCount?.toLocaleString()}</div>
              <div className={'text-xs'}>likes</div>
            </div>
          </Conditional>
        </div>
      </AuthContent>

      <Conditional isCondition={isBursting}>
        {[...Array(6)].map((_, i) => (
          <div
            className={'absolute top-1/2 left-1/2 h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75'}
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
