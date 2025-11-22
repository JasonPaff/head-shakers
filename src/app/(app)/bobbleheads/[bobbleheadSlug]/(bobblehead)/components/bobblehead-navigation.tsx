'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import { useRouter } from 'next/navigation';
import { parseAsString, useQueryStates } from 'nuqs';
import { useCallback, useEffect, useTransition } from 'react';

import type { BobbleheadNavigationData } from '@/lib/types/bobblehead-navigation.types';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type BobbleheadNavigationProps = {
  navigationData: BobbleheadNavigationData;
};

export const BobbleheadNavigation = ({ navigationData }: BobbleheadNavigationProps) => {
  // useState hooks - none needed

  // Other hooks
  const [isPending, startTransition] = useTransition();

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

  // useMemo hooks - none needed

  // Utility functions (before handlers since handlers depend on this)
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

  // Event handlers (before useEffect since useEffect depends on these)
  const handleNavigatePrevious = useCallback(() => {
    if (!navigationData.previousBobblehead) return;

    startTransition(() => {
      const url = buildNavigationUrl(navigationData.previousBobblehead!.slug);
      router.push(url);
    });
  }, [navigationData.previousBobblehead, buildNavigationUrl, router]);

  const handleNavigateNext = useCallback(() => {
    if (!navigationData.nextBobblehead) return;

    startTransition(() => {
      const url = buildNavigationUrl(navigationData.nextBobblehead!.slug);
      router.push(url);
    });
  }, [navigationData.nextBobblehead, buildNavigationUrl, router]);

  // useEffect hooks - keyboard navigation
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
  const _isPreviousDisabled = !_hasPrevious || isPending;
  const _isNextDisabled = !_hasNext || isPending;

  // Test IDs
  const navTestId = generateTestId('feature', 'bobblehead-nav');
  const prevButtonTestId = generateTestId('feature', 'bobblehead-nav', 'previous');
  const nextButtonTestId = generateTestId('feature', 'bobblehead-nav', 'next');

  return (
    <Conditional isCondition={_hasNavigation}>
      <nav
        aria-label={'Bobblehead navigation'}
        className={'flex items-center justify-between gap-4'}
        data-slot={'bobblehead-navigation'}
        data-testid={navTestId}
      >
        {/* Previous Button */}
        <Button
          aria-label={
            _hasPrevious ? `Previous: ${navigationData.previousBobblehead?.name}` : 'No previous bobblehead'
          }
          className={cn('gap-2', isPending && 'opacity-70')}
          data-slot={'bobblehead-navigation-previous'}
          data-testid={prevButtonTestId}
          disabled={_isPreviousDisabled}
          onClick={handleNavigatePrevious}
          size={'sm'}
          variant={'outline'}
        >
          <ChevronLeftIcon aria-hidden className={'size-4'} />
          <span className={'hidden sm:inline'}>Previous</span>
        </Button>

        {/* Next Button */}
        <Button
          aria-label={_hasNext ? `Next: ${navigationData.nextBobblehead?.name}` : 'No next bobblehead'}
          className={cn('gap-2', isPending && 'opacity-70')}
          data-slot={'bobblehead-navigation-next'}
          data-testid={nextButtonTestId}
          disabled={_isNextDisabled}
          onClick={handleNavigateNext}
          size={'sm'}
          variant={'outline'}
        >
          <span className={'hidden sm:inline'}>Next</span>
          <ChevronRightIcon aria-hidden className={'size-4'} />
        </Button>
      </nav>
    </Conditional>
  );
};
