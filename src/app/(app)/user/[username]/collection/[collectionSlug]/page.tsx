/**
 * Collection View Page Mockup
 *
 * This is a frontend-only mockup for the new public collection view page.
 * It demonstrates 3 layout variations:
 * 1. Grid - Traditional card grid with search/sort bar (default)
 * 2. Gallery - Larger images, minimal text, hover interactions
 * 3. List - Compact horizontal cards with more metadata visible
 *
 * All data is mocked - no backend connections.
 * Use the layout switcher in the top-right to preview different layouts.
 */
'use client';

import { GridIcon, ImageIcon, ListIcon } from 'lucide-react';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { useState } from 'react';

import { Route } from '@/app/(app)/user/[username]/collection/[collectionSlug]/route-type';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/tailwind-utils';

import type { LayoutVariant } from './components/bobblehead-grid';

import { BobbleheadGrid } from './components/bobblehead-grid';
import { CollectionHeader } from './components/collection-header';
import { CommentsPlaceholder } from './components/comments-placeholder';
import { mockBobbleheads, mockCollection, mockCollector } from './mock-data';

const layoutOptions: Array<{ icon: typeof GridIcon; label: string; value: LayoutVariant }> = [
  { icon: GridIcon, label: 'Grid', value: 'grid' },
  { icon: ImageIcon, label: 'Gallery', value: 'gallery' },
  { icon: ListIcon, label: 'List', value: 'list' },
];

function CollectionViewPage() {
  const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>('grid');

  return (
    <div className={'container mx-auto max-w-7xl px-4 py-8'}>
      {/* Layout Switcher - For Mockup Preview */}
      <div className={'mb-6 flex items-center justify-between rounded-md border bg-muted/50 p-3'}>
        <div className={'text-sm text-muted-foreground'}>
          <span className={'font-medium text-foreground'}>Mockup Preview:</span> Switch between layout
          variations
        </div>
        <div className={'flex items-center gap-1 rounded-md border bg-background p-1'}>
          {layoutOptions.map((option) => (
            <Button
              className={cn(
                'gap-2',
                layoutVariant === option.value && 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
              key={option.value}
              onClick={() => setLayoutVariant(option.value)}
              size={'sm'}
              variant={layoutVariant === option.value ? 'default' : 'ghost'}
            >
              <option.icon className={'size-4'} />
              <span className={'hidden sm:inline'}>{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Collection Header */}
      <CollectionHeader collection={mockCollection} collector={mockCollector} />

      {/* Bobblehead Grid with selected layout */}
      <BobbleheadGrid bobbleheads={mockBobbleheads} layoutVariant={layoutVariant} />

      {/* Comments Section */}
      <CommentsPlaceholder commentCount={12} />
    </div>
  );
}

export default withParamValidation(CollectionViewPage, Route);
