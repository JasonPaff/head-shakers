'use client';

import type { ComponentProps } from 'react';

import { GridIcon, ListIcon } from 'lucide-react';
import { parseAsStringEnum, useQueryState } from 'nuqs';

import type { LayoutVariant } from '@/app/(app)/user/[username]/collection/[collectionSlug]/components/bobblehead-grid';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type LayoutToggleProps = ComponentProps<'div'> & ComponentTestIdProps;

export const LayoutToggle = ({ className, testId, ...props }: LayoutToggleProps) => {
  const [layout, setLayout] = useQueryState(
    'layout',
    parseAsStringEnum(['grid', 'list'] as const)
      .withDefault('grid')
      .withOptions({
        shallow: false,
      }),
  );

  const toggleTestId = testId || generateTestId('ui', 'toggle-group', 'layout');
  const gridButtonTestId = generateTestId('ui', 'button', 'grid');
  const listButtonTestId = generateTestId('ui', 'button', 'list');

  const handleLayoutChange = (newLayout: LayoutVariant) => {
    void setLayout(newLayout);
  };

  return (
    <div
      className={cn('flex items-center justify-end gap-2', className)}
      data-slot={'layout-toggle'}
      data-testid={toggleTestId}
      {...props}
    >
      <Button
        onClick={() => handleLayoutChange('grid')}
        size={'sm'}
        testId={gridButtonTestId}
        variant={layout === 'grid' ? 'default' : 'outline'}
      >
        <GridIcon aria-hidden className={'mr-2 size-4'} />
        Grid
      </Button>
      <Button
        onClick={() => handleLayoutChange('list')}
        size={'sm'}
        testId={listButtonTestId}
        variant={layout === 'list' ? 'default' : 'outline'}
      >
        <ListIcon aria-hidden className={'mr-2 size-4'} />
        List
      </Button>
    </div>
  );
};
