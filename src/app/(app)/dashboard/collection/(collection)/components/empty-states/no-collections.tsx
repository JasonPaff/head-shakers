import { LayersIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type NoCollectionsProps = {
  onCreateClick?: () => void;
};

export const NoCollections = ({ onCreateClick }: NoCollectionsProps) => {
  return (
    <div
      className={'flex flex-col items-center justify-center py-12 text-center'}
      data-slot={'no-collections'}
    >
      <LayersIcon aria-hidden className={'mb-4 size-12 text-muted-foreground/50'} />
      <h3 className={'mb-2 text-lg font-semibold'}>No collections yet</h3>
      <p className={'mb-4 max-w-50 text-sm text-muted-foreground'}>
        Create your first collection to start organizing your bobbleheads
      </p>
      <Button onClick={onCreateClick} size={'sm'}>
        <PlusIcon aria-hidden className={'size-4'} />
        Create Collection
      </Button>
    </div>
  );
};
