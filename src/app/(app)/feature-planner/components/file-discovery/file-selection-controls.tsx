'use client';

import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';

interface FileSelectionControlsProps {
  isAllSelected: boolean;
  onDeselectAll: () => void;
  onSelectAll: () => void;
  selectedCount: number;
}

export const FileSelectionControls = ({
  isAllSelected,
  onDeselectAll,
  onSelectAll,
  selectedCount,
}: FileSelectionControlsProps) => {
  return (
    <div className={'flex items-center gap-2'}>
      {/* Select/Deselect All Button */}
      <Button onClick={isAllSelected ? onDeselectAll : onSelectAll} size={'sm'} variant={'outline'}>
        {isAllSelected ? 'Deselect All' : 'Select All'}
      </Button>

      {/* Selected Count Badge */}
      <Conditional isCondition={selectedCount > 0}>
        <div className={'flex items-center gap-2 rounded-lg border bg-primary/5 px-3 py-2'}>
          <CheckCircle2 aria-hidden className={'size-4 text-primary'} />
          <span className={'text-sm font-medium'}>
            {selectedCount} file{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
      </Conditional>
    </div>
  );
};
