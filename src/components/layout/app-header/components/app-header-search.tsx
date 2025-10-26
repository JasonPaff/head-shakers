'use client';

import { SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';

export const AppHeaderSearch = () => {
  return (
    <div className={'relative w-full'}>
      <SearchIcon
        aria-hidden
        className={'absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground'}
      />
      <Input className={'w-full pr-4 pl-10'} placeholder={'Search...'} type={'search'} />
    </div>
  );
};
