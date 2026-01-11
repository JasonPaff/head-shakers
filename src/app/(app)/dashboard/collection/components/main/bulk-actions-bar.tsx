import { StarIcon, TrashIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type BulkActionsBarProps = {
  isAllSelected: boolean;
  onBulkDelete: () => void;
  onBulkFeature: () => void;
  onSelectAll: () => void;
  selectedCount: number;
};

export const BulkActionsBar = ({
  isAllSelected,
  onBulkDelete,
  onBulkFeature,
  onSelectAll,
  selectedCount,
}: BulkActionsBarProps) => {
  return (
    <div className={'mx-4'} data-slot={'bulk-actions-bar'}>
      <Card className={'border-primary'}>
        <CardContent className={'flex items-center justify-between py-3'}>
          <div className={'flex items-center gap-4'}>
            <span className={'text-sm font-medium'}>
              {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
            </span>
            <Button onClick={onSelectAll} size={'sm'} variant={'ghost'}>
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className={'flex items-center gap-2'}>
            <Button onClick={onBulkFeature} size={'sm'} variant={'outline'}>
              <StarIcon aria-hidden className={'size-4'} />
              <span className={'hidden sm:inline'}>Feature Selected</span>
            </Button>
            <Button onClick={onBulkDelete} size={'sm'} variant={'destructive'}>
              <TrashIcon aria-hidden className={'size-4'} />
              <span className={'hidden sm:inline'}>Delete Selected</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
