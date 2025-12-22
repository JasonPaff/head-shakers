import { SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type NoResultsProps = {
  onClearFilters: () => void;
};

export const NoResults = ({ onClearFilters }: NoResultsProps) => {
  return (
    <div
      className={`flex h-full min-h-100 w-full flex-col items-center justify-center
        rounded-lg border border-dashed bg-card p-8 text-center`}
      data-slot={'no-results'}
    >
      <SearchIcon aria-hidden className={'mb-4 size-12 text-muted-foreground/50'} />
      <h3 className={'mb-2 text-lg font-semibold'}>No Bobbleheads Found</h3>
      <p className={'mb-4 max-w-sm text-sm text-muted-foreground'}>
        Try adjusting your search or filters to find what you are looking for
      </p>
      <Button onClick={onClearFilters} variant={'outline'}>
        <XIcon aria-hidden className={'size-4'} />
        Clear Filters
      </Button>
    </div>
  );
};
