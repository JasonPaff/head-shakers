'use client';

import { SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';

export const HeaderSearch = () => {
  return (
    <div className={'relative'}>
      <SearchIcon className={'absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform'} />
      <Input className={'pl-10'} placeholder={'Discover collections, bobbleheads, collectors...'} />
    </div>
  );
};
