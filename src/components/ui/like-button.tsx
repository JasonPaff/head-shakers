'use client';

import type { ComponentProps } from 'react';

import { SignInButton } from '@clerk/nextjs';
import { StarIcon } from 'lucide-react';
import { useCallback, useOptimistic } from 'react';

import type { LikeTargetType } from '@/lib/constants';

import { AuthContent } from '@/components/ui/auth';
import { Conditional } from '@/components/ui/conditional';
import { useServerAction } from '@/hooks/use-server-action';
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
  const authenticatedAriaLabel =
    ariaLabel || `${isLiked ? 'Unlike' : 'Like'} this ${targetType}. ${optimisticState.likeCount} likes`;

  return (
    <AuthContent
      fallback={
        <div className={'flex items-center gap-3'}>
          <SignInButton mode={'modal'}>
            <button
              aria-label={`${optimisticState.likeCount} likes. Sign in to like this ${targetType}`}
              aria-pressed={isLiked}
              className={cn(
                'relative rounded-xl p-4 transition-all duration-500 ease-out',
                'transform hover:-translate-y-1 hover:shadow-2xl',
                isLiked ?
                  'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white'
                : 'border border-gray-200 bg-white text-gray-400 hover:border-amber-300',
                className,
              )}
              disabled={disabled || isPending}
              onClick={handleLikeToggle}
            >
              <StarIcon
                className={cn(
                  'h-6 w-6 transition-all duration-500',
                  isLiked ? 'scale-110 rotate-180 fill-current' : 'hover:rotate-12',
                )}
              />
            </button>
          </SignInButton>
          <Conditional isCondition={displayedLikeCount !== null}>
            <div className={'text-right'}>
              <div className={'text-lg font-bold text-gray-800'}>{displayedLikeCount?.toLocaleString()}</div>
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
            'relative rounded-xl p-4 transition-all duration-500 ease-out',
            'transform hover:-translate-y-1 hover:shadow-2xl',
            isLiked ?
              'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white'
            : 'border border-gray-200 bg-white text-gray-400 hover:border-amber-300',
            className,
          )}
          disabled={disabled || isPending}
          onClick={handleLikeToggle}
          {...props}
        >
          <StarIcon
            className={cn(
              'h-6 w-6 transition-all duration-500',
              isLiked ? 'scale-110 rotate-180 fill-current' : 'hover:rotate-12',
            )}
          />
        </button>
        <Conditional isCondition={displayedLikeCount !== null}>
          <div className={'text-right'}>
            <div className={'text-lg font-bold text-gray-800'}>{displayedLikeCount?.toLocaleString()}</div>
            <div className={'text-xs text-gray-500'}>likes</div>
          </div>
        </Conditional>
      </div>
    </AuthContent>
  );
};

export const LikeIconButton = (props: Omit<LikeButtonProps, 'isIconOnly' | 'shouldShowCount'>) => (
  <LikeButton {...props} isIconOnly shouldShowCount={false} />
);

export const LikeCountButton = (props: LikeButtonProps) => <LikeButton {...props} shouldShowCount />;
