'use client';

import type { ComponentProps } from 'react';

import { Grid3X3Icon, ListIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { ENUMS, type SearchViewMode } from '@/lib/constants/enums';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type ViewModeToggleProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    onViewModeChange: (viewMode: SearchViewMode) => void;
    viewMode: SearchViewMode;
  };

export const ViewModeToggle = ({
  className,
  onViewModeChange,
  testId,
  viewMode,
  ...props
}: ViewModeToggleProps) => {
  const toggleTestId = testId || generateTestId('ui', 'toggle-group');
  const gridButtonTestId = testId ? `${testId}-grid` : generateTestId('ui', 'toggle', 'grid');
  const listButtonTestId = testId ? `${testId}-list` : generateTestId('ui', 'toggle', 'list');

  const _isGridActive = viewMode === ENUMS.SEARCH.VIEW_MODE[0];
  const _isListActive = viewMode === ENUMS.SEARCH.VIEW_MODE[1];

  const handleGridClick = () => {
    onViewModeChange(ENUMS.SEARCH.VIEW_MODE[0]);
  };

  const handleListClick = () => {
    onViewModeChange(ENUMS.SEARCH.VIEW_MODE[1]);
  };

  return (
    <div
      aria-label={'View mode'}
      className={cn('inline-flex items-center gap-1 rounded-lg border p-1', className)}
      data-slot={'view-mode-toggle'}
      data-testid={toggleTestId}
      role={'group'}
      {...props}
    >
      {/* Grid View Button */}
      <Button
        aria-label={'Grid view'}
        aria-pressed={_isGridActive}
        className={cn(
          'h-8 w-8 p-0',
          _isGridActive ?
            'bg-accent text-accent-foreground'
          : 'bg-transparent text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
        )}
        data-slot={'view-mode-toggle-button'}
        data-testid={gridButtonTestId}
        onClick={handleGridClick}
        size={'icon'}
        variant={'ghost'}
      >
        <Grid3X3Icon aria-hidden className={'size-4'} />
      </Button>

      {/* List View Button */}
      <Button
        aria-label={'List view'}
        aria-pressed={_isListActive}
        className={cn(
          'h-8 w-8 p-0',
          _isListActive ?
            'bg-accent text-accent-foreground'
          : 'bg-transparent text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
        )}
        data-slot={'view-mode-toggle-button'}
        data-testid={listButtonTestId}
        onClick={handleListClick}
        size={'icon'}
        variant={'ghost'}
      >
        <ListIcon aria-hidden className={'size-4'} />
      </Button>
    </div>
  );
};
