'use client';

import { CameraIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseAsString, useQueryStates } from 'nuqs';
import { useCallback, useEffect, useMemo } from 'react';

import type { BobbleheadNavigationData } from '@/lib/types/bobblehead-navigation.types';

import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { BobbleheadNavigationPreview } from './bobblehead-navigation-preview';
import { CollectionContextIndicator } from './collection-context-indicator';

type BobbleheadNavigationProps = {
  isKeyboardNavigationEnabled?: boolean;
  navigationData: BobbleheadNavigationData;
};

export const BobbleheadNavigation = ({
  isKeyboardNavigationEnabled = true,
  navigationData,
}: BobbleheadNavigationProps) => {
  // Other hooks
  const [{ collectionId, subcollectionId }] = useQueryStates(
    {
      collectionId: parseAsString,
      subcollectionId: parseAsString,
    },
    {
      shallow: false,
    },
  );

  const router = useRouter();

  // Build navigation URLs
  const buildNavigationUrl = useCallback(
    (bobbleheadSlug: string) => {
      const searchParams: Record<string, string> = {};

      if (collectionId) {
        searchParams.collectionId = collectionId;
      }
      if (subcollectionId) {
        searchParams.subcollectionId = subcollectionId;
      }

      return $path({
        route: '/bobbleheads/[bobbleheadSlug]',
        routeParams: { bobbleheadSlug },
        searchParams: Object.keys(searchParams).length > 0 ? searchParams : undefined,
      });
    },
    [collectionId, subcollectionId],
  );

  // Memoize URLs for links
  const previousUrl = useMemo(
    () =>
      navigationData.previousBobblehead ? buildNavigationUrl(navigationData.previousBobblehead.slug) : null,
    [navigationData.previousBobblehead, buildNavigationUrl],
  );

  const nextUrl = useMemo(
    () => (navigationData.nextBobblehead ? buildNavigationUrl(navigationData.nextBobblehead.slug) : null),
    [navigationData.nextBobblehead, buildNavigationUrl],
  );

  // Keyboard navigation handlers for arrow keys
  const handleNavigatePrevious = useCallback(() => {
    if (previousUrl) {
      router.push(previousUrl);
    }
  }, [previousUrl, router]);

  const handleNavigateNext = useCallback(() => {
    if (nextUrl) {
      router.push(nextUrl);
    }
  }, [nextUrl, router]);

  // Keyboard navigation (arrow keys)
  useEffect(() => {
    if (!isKeyboardNavigationEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          if (navigationData.previousBobblehead) {
            event.preventDefault();
            handleNavigatePrevious();
          }
          break;
        case 'ArrowRight':
          if (navigationData.nextBobblehead) {
            event.preventDefault();
            handleNavigateNext();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isKeyboardNavigationEnabled,
    navigationData.previousBobblehead,
    navigationData.nextBobblehead,
    handleNavigatePrevious,
    handleNavigateNext,
  ]);

  // Derived variables
  const _hasPrevious = !!navigationData.previousBobblehead;
  const _hasNext = !!navigationData.nextBobblehead;
  const _hasNavigation = _hasPrevious || _hasNext;
  const _hasPositionInfo = navigationData.currentPosition > 0 && navigationData.totalCount > 0;
  const _hasContext = !!navigationData.context;
  const _canNavigatePrevious = _hasPrevious && !!previousUrl;
  const _canNavigateNext = _hasNext && !!nextUrl;

  // Test IDs
  const navTestId = generateTestId('feature', 'bobblehead-nav');
  const prevLinkTestId = generateTestId('feature', 'bobblehead-nav', 'previous');
  const nextLinkTestId = generateTestId('feature', 'bobblehead-nav', 'next');
  const positionTestId = generateTestId('feature', 'bobblehead-nav', 'position');

  // Shared card base styling
  const cardBaseClassName = cn(
    'flex flex-1 rounded-lg border bg-card transition-colors',
    'hover:border-accent-foreground/20 hover:bg-accent',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
  );
  // Previous card - content aligned left
  const prevCardClassName = cn(cardBaseClassName, 'justify-start');
  const disabledPrevCardClassName = cn(prevCardClassName, 'pointer-events-none opacity-50');
  // Next card - content aligned right
  const nextCardClassName = cn(cardBaseClassName, 'justify-end');
  const disabledNextCardClassName = cn(nextCardClassName, 'pointer-events-none opacity-50');

  // Compact button styling for mobile
  const compactClassName = cn(
    'flex flex-1 items-center rounded-md border bg-card transition-colors',
    'hover:border-accent-foreground/20 hover:bg-accent',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
  );
  const disabledCompactClassName = cn(compactClassName, 'pointer-events-none opacity-50');

  return (
    <Conditional isCondition={_hasNavigation}>
      <nav
        aria-label={'Bobblehead navigation'}
        className={'flex flex-col gap-4'}
        data-slot={'bobblehead-navigation'}
        data-testid={navTestId}
      >
        {/* Desktop Layout - Card Style */}
        <div className={'hidden items-stretch justify-between gap-4 sm:flex'}>
          {/* Previous Card */}
          {_canNavigatePrevious ?
            <Link
              aria-label={`Previous: ${navigationData.previousBobblehead?.name}`}
              className={prevCardClassName}
              data-slot={'bobblehead-navigation-previous'}
              data-testid={prevLinkTestId}
              href={previousUrl}
            >
              <BobbleheadNavigationPreview
                bobblehead={navigationData.previousBobblehead!}
                direction={'previous'}
                variant={'card'}
              />
            </Link>
          : <div
              aria-disabled={'true'}
              aria-label={'No previous bobblehead'}
              className={disabledPrevCardClassName}
              data-slot={'bobblehead-navigation-previous'}
              data-testid={prevLinkTestId}
            >
              <DisabledCardPlaceholder direction={'previous'} />
            </div>
          }

          {/* Center Content - Context and Position */}
          <div className={'flex flex-col items-center justify-center gap-1'}>
            {/* Collection Context Indicator */}
            <Conditional isCondition={_hasContext}>
              <CollectionContextIndicator context={navigationData.context!} />
            </Conditional>

            {/* Position Indicator */}
            <Conditional isCondition={_hasPositionInfo}>
              <span
                aria-label={`Bobblehead ${navigationData.currentPosition} of ${navigationData.totalCount} in collection`}
                className={'text-sm text-muted-foreground'}
                data-slot={'bobblehead-navigation-position'}
                data-testid={positionTestId}
              >
                {navigationData.currentPosition} of {navigationData.totalCount}
              </span>
            </Conditional>
          </div>

          {/* Next Card */}
          {_canNavigateNext ?
            <Link
              aria-label={`Next: ${navigationData.nextBobblehead?.name}`}
              className={nextCardClassName}
              data-slot={'bobblehead-navigation-next'}
              data-testid={nextLinkTestId}
              href={nextUrl}
            >
              <BobbleheadNavigationPreview
                bobblehead={navigationData.nextBobblehead!}
                direction={'next'}
                variant={'card'}
              />
            </Link>
          : <div
              aria-disabled={'true'}
              aria-label={'No next bobblehead'}
              className={disabledNextCardClassName}
              data-slot={'bobblehead-navigation-next'}
              data-testid={nextLinkTestId}
            >
              <DisabledCardPlaceholder direction={'next'} />
            </div>
          }
        </div>

        {/* Mobile Layout - Compact Horizontal */}
        <div className={'flex items-center gap-2 sm:hidden'}>
          {/* Previous Compact */}
          {_canNavigatePrevious ?
            <Link
              aria-label={`Previous: ${navigationData.previousBobblehead?.name}`}
              className={compactClassName}
              data-slot={'bobblehead-navigation-previous'}
              href={previousUrl}
            >
              <BobbleheadNavigationPreview
                bobblehead={navigationData.previousBobblehead!}
                direction={'previous'}
                variant={'compact'}
              />
            </Link>
          : <div
              aria-disabled={'true'}
              aria-label={'No previous bobblehead'}
              className={disabledCompactClassName}
              data-slot={'bobblehead-navigation-previous'}
            >
              <DisabledCompactPlaceholder direction={'previous'} />
            </div>
          }

          {/* Position Indicator - Mobile */}
          <Conditional isCondition={_hasPositionInfo}>
            <span
              aria-label={`Bobblehead ${navigationData.currentPosition} of ${navigationData.totalCount} in collection`}
              className={'shrink-0 text-xs text-muted-foreground'}
              data-slot={'bobblehead-navigation-position'}
            >
              {navigationData.currentPosition}/{navigationData.totalCount}
            </span>
          </Conditional>

          {/* Next Compact */}
          {_canNavigateNext ?
            <Link
              aria-label={`Next: ${navigationData.nextBobblehead?.name}`}
              className={compactClassName}
              data-slot={'bobblehead-navigation-next'}
              href={nextUrl}
            >
              <BobbleheadNavigationPreview
                bobblehead={navigationData.nextBobblehead!}
                direction={'next'}
                variant={'compact'}
              />
            </Link>
          : <div
              aria-disabled={'true'}
              aria-label={'No next bobblehead'}
              className={disabledCompactClassName}
              data-slot={'bobblehead-navigation-next'}
            >
              <DisabledCompactPlaceholder direction={'next'} />
            </div>
          }
        </div>
      </nav>
    </Conditional>
  );
};

// Disabled state placeholder for card variant
const DisabledCardPlaceholder = ({ direction }: { direction: 'next' | 'previous' }) => {
  const _isPrevious = direction === 'previous';

  return (
    <div className={cn('flex items-center gap-3 p-3', _isPrevious ? 'flex-row' : 'flex-row-reverse')}>
      {/* Chevron Icon */}
      {_isPrevious ?
        <ChevronLeftIcon aria-hidden className={'size-5 shrink-0 text-muted-foreground'} />
      : <ChevronRightIcon aria-hidden className={'size-5 shrink-0 text-muted-foreground'} />}

      {/* Placeholder Image */}
      <div className={'flex size-14 shrink-0 items-center justify-center rounded-md bg-muted'}>
        <CameraIcon aria-hidden className={'size-6 text-muted-foreground'} />
      </div>

      {/* Text Content */}
      <div className={cn('flex min-w-0 flex-col gap-0.5', _isPrevious ? 'items-start' : 'items-end')}>
        {/* Direction Label */}
        <span className={'text-xs font-medium text-muted-foreground'}>
          {_isPrevious ? 'Previous' : 'Next'}
        </span>
        {/* Placeholder Text */}
        <p className={cn('text-sm text-muted-foreground', _isPrevious ? 'text-left' : 'text-right')}>None</p>
      </div>
    </div>
  );
};

// Disabled state placeholder for compact variant
const DisabledCompactPlaceholder = ({ direction }: { direction: 'next' | 'previous' }) => {
  const _isPrevious = direction === 'previous';

  return (
    <div className={cn('flex items-center gap-2 px-2 py-1.5', _isPrevious ? 'flex-row' : 'flex-row-reverse')}>
      {/* Chevron Icon */}
      {_isPrevious ?
        <ChevronLeftIcon aria-hidden className={'size-4 shrink-0 text-muted-foreground'} />
      : <ChevronRightIcon aria-hidden className={'size-4 shrink-0 text-muted-foreground'} />}

      {/* Placeholder Image */}
      <div className={'flex size-8 shrink-0 items-center justify-center rounded bg-muted'}>
        <CameraIcon aria-hidden className={'size-4 text-muted-foreground'} />
      </div>

      {/* Placeholder Text */}
      <p className={cn('text-xs text-muted-foreground', _isPrevious ? 'text-left' : 'text-right')}>None</p>
    </div>
  );
};
