'use client';

import type { ComponentProps } from 'react';

import { PackageIcon } from 'lucide-react';
import { useMemo } from 'react';

import type { BobbleheadListRecord } from '@/lib/queries/collections/collections.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { EmptyState } from '@/components/ui/empty-state';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { BobbleheadCard } from './bobblehead-card';

export type LayoutVariant = 'grid' | 'list';

type BobbleheadGridProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    bobbleheads: Array<
      BobbleheadListRecord & {
        featurePhoto?: null | string;
        likeData?: { isLiked: boolean; likeCount: number; likeId: null | string };
      }
    >;
    collectionSlug: string;
    isOwner?: boolean;
    layoutVariant: LayoutVariant;
  };

/**
 * BobbleheadGrid component with 2 layout variations:
 * 1. Grid - Traditional card grid (default)
 * 2. List - Compact horizontal cards with more metadata visible
 */
export const BobbleheadGrid = ({
  bobbleheads,
  className,
  collectionSlug,
  layoutVariant,
  testId,
  ...props
}: BobbleheadGridProps) => {
  // Grid layout classes based on variant
  const gridClasses = useMemo(() => {
    switch (layoutVariant) {
      case 'list':
        // Single column list
        return 'flex flex-col gap-4';
      case 'grid':
      default:
        // Standard responsive grid
        return 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';
    }
  }, [layoutVariant]);

  const _hasNoBobbleheads = bobbleheads.length === 0;

  const gridTestId = testId || generateTestId('feature', 'bobblehead-grid');

  return (
    <div
      className={cn('space-y-4', className)}
      data-slot={'bobblehead-grid'}
      data-testid={gridTestId}
      {...props}
    >
      {/* Results Count */}
      <p className={'text-sm text-muted-foreground'} data-slot={'bobblehead-count'}>
        {bobbleheads.length} bobblehead{bobbleheads.length !== 1 ? 's' : ''}
      </p>

      {/* Empty State */}
      {_hasNoBobbleheads ?
        <EmptyState
          description={'Try adjusting your search or filters.'}
          icon={PackageIcon}
          title={'No bobbleheads found'}
        />
      : <div className={cn(gridClasses)} data-slot={'bobblehead-grid-container'}>
          {bobbleheads.map((bobblehead) => (
            <BobbleheadCard
              bobblehead={bobblehead}
              collectionSlug={collectionSlug}
              key={bobblehead.id}
              variant={layoutVariant}
            />
          ))}
        </div>
      }
    </div>
  );
};
