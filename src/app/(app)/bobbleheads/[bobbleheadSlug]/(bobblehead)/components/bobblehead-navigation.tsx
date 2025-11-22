'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseAsString, useQueryStates } from 'nuqs';
import { useCallback, useEffect, useMemo } from 'react';

import type { BobbleheadNavigationData } from '@/lib/types/bobblehead-navigation.types';

import { buttonVariants } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { BobbleheadNavigationPreview } from './bobblehead-navigation-preview';

type BobbleheadNavigationProps = {
  navigationData: BobbleheadNavigationData;
};

export const BobbleheadNavigation = ({ navigationData }: BobbleheadNavigationProps) => {
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
  const _canNavigatePrevious = _hasPrevious && !!previousUrl;
  const _canNavigateNext = _hasNext && !!nextUrl;

  // Test IDs
  const navTestId = generateTestId('feature', 'bobblehead-nav');
  const prevLinkTestId = generateTestId('feature', 'bobblehead-nav', 'previous');
  const nextLinkTestId = generateTestId('feature', 'bobblehead-nav', 'next');
  const positionTestId = generateTestId('feature', 'bobblehead-nav', 'position');
  const prevHoverCardTestId = generateTestId('feature', 'bobblehead-nav', 'previous-hover');
  const nextHoverCardTestId = generateTestId('feature', 'bobblehead-nav', 'next-hover');

  // Shared button styling
  const linkClassName = cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'gap-2');
  const disabledClassName = cn(linkClassName, 'pointer-events-none opacity-50');

  return (
    <Conditional isCondition={_hasNavigation}>
      <nav
        aria-label={'Bobblehead navigation'}
        className={'flex items-center justify-between gap-4'}
        data-slot={'bobblehead-navigation'}
        data-testid={navTestId}
      >
        {/* Previous Link */}
        {_canNavigatePrevious ?
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link
                aria-label={`Previous: ${navigationData.previousBobblehead?.name}`}
                className={linkClassName}
                data-slot={'bobblehead-navigation-previous'}
                data-testid={prevLinkTestId}
                href={previousUrl}
              >
                <ChevronLeftIcon aria-hidden className={'size-4'} />
                <span className={'hidden sm:inline'}>Previous</span>
              </Link>
            </HoverCardTrigger>
            <HoverCardContent data-testid={prevHoverCardTestId} side={'bottom'}>
              <BobbleheadNavigationPreview bobblehead={navigationData.previousBobblehead!} />
            </HoverCardContent>
          </HoverCard>
        : <span
            aria-disabled={'true'}
            aria-label={'No previous bobblehead'}
            className={disabledClassName}
            data-slot={'bobblehead-navigation-previous'}
            data-testid={prevLinkTestId}
          >
            <ChevronLeftIcon aria-hidden className={'size-4'} />
            <span className={'hidden sm:inline'}>Previous</span>
          </span>
        }

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

        {/* Next Link */}
        {_canNavigateNext ?
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link
                aria-label={`Next: ${navigationData.nextBobblehead?.name}`}
                className={linkClassName}
                data-slot={'bobblehead-navigation-next'}
                data-testid={nextLinkTestId}
                href={nextUrl}
              >
                <span className={'hidden sm:inline'}>Next</span>
                <ChevronRightIcon aria-hidden className={'size-4'} />
              </Link>
            </HoverCardTrigger>
            <HoverCardContent data-testid={nextHoverCardTestId} side={'bottom'}>
              <BobbleheadNavigationPreview bobblehead={navigationData.nextBobblehead!} />
            </HoverCardContent>
          </HoverCard>
        : <span
            aria-disabled={'true'}
            aria-label={'No next bobblehead'}
            className={disabledClassName}
            data-slot={'bobblehead-navigation-next'}
            data-testid={nextLinkTestId}
          >
            <span className={'hidden sm:inline'}>Next</span>
            <ChevronRightIcon aria-hidden className={'size-4'} />
          </span>
        }
      </nav>
    </Conditional>
  );
};
