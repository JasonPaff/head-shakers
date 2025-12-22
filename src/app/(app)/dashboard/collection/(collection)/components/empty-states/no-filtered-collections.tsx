import { SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type NoFilteredCollectionsProps = {
  onClearSearch?: () => void;
};

export const NoFilteredCollections = ({ onClearSearch }: NoFilteredCollectionsProps) => {
  return (
    <div
      className={'flex flex-col items-center justify-center py-12 text-center'}
      data-slot={'no-filtered-collections'}
    >
      <SearchIcon aria-hidden className={'mb-4 size-12 text-muted-foreground/50'} />
      <h3 className={'mb-2 text-lg font-semibold'}>No collections found</h3>
      <p className={'mb-4 max-w-50 text-sm text-muted-foreground'}>
        No collections match your search. Try a different term.
      </p>
      <Button onClick={onClearSearch} size={'sm'} variant={'outline'}>
        <XIcon aria-hidden className={'size-4'} />
        Clear Search
      </Button>
    </div>
  );
};
