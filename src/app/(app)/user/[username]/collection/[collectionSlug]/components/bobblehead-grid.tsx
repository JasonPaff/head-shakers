'use client';

import type { ComponentProps } from 'react';

import { PackageIcon } from 'lucide-react';
import { parseAsStringEnum, useQueryState } from 'nuqs';
import { useMemo } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { EmptyState } from '@/components/ui/empty-state';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import type { BobbleheadGridProps as BobbleheadGridPropsFromTypes, BobbleheadViewData } from '../types';

import { BobbleheadCard } from './bobblehead-card';
import { SearchControls } from './search-controls';

const LAYOUT_VALUES = ['grid', 'gallery', 'list'] as const;

type BobbleheadGridProps = BobbleheadGridPropsFromTypes &
  ComponentProps<'div'> &
  ComponentTestIdProps & { initialSearch?: string };

/**
 * BobbleheadGrid component with 3 layout variations:
 * 1. Grid - Traditional card grid with search/sort bar (default)
 * 2. Gallery - Larger images, masonry-like layout, minimal text
 * 3. List - Compact horizontal cards with more metadata visible
 *
 * Receives pre-filtered/sorted data from server. Uses URL state for layout preference only.
 */
export const BobbleheadGrid = ({
  bobbleheads,
  className,
  collectionSlug,
  initialSearch,
  ownerUsername,
  testId,
  ...props
}: BobbleheadGridProps) => {
  const [layout] = useQueryState('layout', parseAsStringEnum([...LAYOUT_VALUES]).withDefault('grid'));

  const gridClasses = useMemo(() => {
    switch (layout) {
      case 'gallery':
        // Masonry-like: varying sizes for visual interest
        return 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 'list':
        // Single column list
        return 'flex flex-col gap-4';
      case 'grid':
      default:
        // Standard responsive grid
        return 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';
    }
  }, [layout]);

  const _isGalleryLayout = layout === 'gallery';
  const _hasNoBobbleheads = bobbleheads.length === 0;

  const gridTestId = testId || generateTestId('feature', 'bobblehead-grid');

  return (
    <div className={cn(className)} data-slot={'bobblehead-grid'} data-testid={gridTestId} {...props}>
      {/* Search and Sort Controls */}
      <SearchControls className={'mb-6'} initialSearch={initialSearch} testId={`${gridTestId}-controls`} />

      {/* Results Count */}
      <p className={'mb-4 text-sm text-muted-foreground'} data-slot={'bobblehead-grid-count'}>
        {bobbleheads.length} bobblehead{bobbleheads.length !== 1 ? 's' : ''}
      </p>

      {/* Empty State */}
      <Conditional
        fallback={
          <div className={cn(gridClasses)} data-slot={'bobblehead-grid-items'}>
            {bobbleheads.map((bobblehead: BobbleheadViewData, index: number) => (
              <div
                className={cn(
                  // Add size variations for gallery layout
                  _isGalleryLayout && index % 5 === 0 && 'sm:col-span-2 sm:row-span-2',
                )}
                key={bobblehead.id}
              >
                <BobbleheadCard
                  bobblehead={bobblehead}
                  collectionSlug={collectionSlug}
                  ownerUsername={ownerUsername}
                  testId={`${gridTestId}-card-${bobblehead.id}`}
                  variant={layout}
                />
              </div>
            ))}
          </div>
        }
        isCondition={_hasNoBobbleheads}
      >
        <EmptyState
          description={'Try adjusting your search or filters.'}
          icon={PackageIcon}
          testId={`${gridTestId}-empty`}
          title={'No bobbleheads found'}
        />
      </Conditional>
    </div>
  );
};
