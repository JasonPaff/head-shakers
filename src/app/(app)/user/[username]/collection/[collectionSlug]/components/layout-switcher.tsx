'use client';

import type { ComponentProps } from 'react';

import { Grid2x2Icon, LayoutGridIcon, ListIcon } from 'lucide-react';
import { parseAsStringEnum, useQueryState } from 'nuqs';
import { useCallback, useTransition } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

const LAYOUT_OPTIONS = ['grid', 'gallery', 'list'] as const;
type LayoutSwitcherProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    currentLayout?: LayoutType;
  };

type LayoutType = (typeof LAYOUT_OPTIONS)[number];

export const LayoutSwitcher = ({
  className,
  currentLayout = 'grid',
  testId,
  ...props
}: LayoutSwitcherProps) => {
  // useState hooks - none needed

  // Other hooks
  const [isPending, startTransition] = useTransition();
  const [layout, setLayout] = useQueryState(
    'layout',
    parseAsStringEnum([...LAYOUT_OPTIONS]).withDefault(currentLayout),
  );

  // Event handlers
  const handleLayoutChange = useCallback(
    (newLayout: LayoutType) => {
      startTransition(() => {
        void setLayout(newLayout);
      });
    },
    [setLayout],
  );

  // Derived variables for conditional rendering
  const _isGridActive = layout === 'grid';
  const _isGalleryActive = layout === 'gallery';
  const _isListActive = layout === 'list';

  const componentTestId = testId || generateTestId('feature', 'toggle-group', 'layout');

  return (
    <div
      aria-label={'Layout view options'}
      className={cn('flex items-center gap-1', className)}
      data-slot={'layout-switcher'}
      data-testid={componentTestId}
      role={'group'}
      {...props}
    >
      {/* Grid View Button */}
      <Button
        aria-label={'Grid view'}
        aria-pressed={_isGridActive}
        data-slot={'layout-switcher-button'}
        data-testid={`${componentTestId}-grid`}
        disabled={isPending}
        onClick={() => handleLayoutChange('grid')}
        size={'icon'}
        variant={_isGridActive ? 'default' : 'outline'}
      >
        <Grid2x2Icon aria-hidden className={'size-4'} />
      </Button>

      {/* Gallery View Button */}
      <Button
        aria-label={'Gallery view'}
        aria-pressed={_isGalleryActive}
        data-slot={'layout-switcher-button'}
        data-testid={`${componentTestId}-gallery`}
        disabled={isPending}
        onClick={() => handleLayoutChange('gallery')}
        size={'icon'}
        variant={_isGalleryActive ? 'default' : 'outline'}
      >
        <LayoutGridIcon aria-hidden className={'size-4'} />
      </Button>

      {/* List View Button */}
      <Button
        aria-label={'List view'}
        aria-pressed={_isListActive}
        data-slot={'layout-switcher-button'}
        data-testid={`${componentTestId}-list`}
        disabled={isPending}
        onClick={() => handleLayoutChange('list')}
        size={'icon'}
        variant={_isListActive ? 'default' : 'outline'}
      >
        <ListIcon aria-hidden className={'size-4'} />
      </Button>
    </div>
  );
};
