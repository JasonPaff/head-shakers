'use client';

import { TrendingUpIcon, UsersIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const HeaderDiscovery = () => {
  return (
    <div className={'gap-x-2'}>
      <Button size={'sm'} variant={'ghost'}>
        <TrendingUpIcon aria-hidden className={'mr-2 h-4 w-4'} />
        Trending
      </Button>
      <Button size={'sm'} variant={'ghost'}>
        <UsersIcon aria-hidden className={'mr-2 h-4 w-4'} />
        Community
      </Button>
    </div>
  );
};
