'use client';

import { PlusIcon, SparklesIcon } from 'lucide-react';

import { cn } from '@/utils/tailwind-utils';

export const AddItemHeader = () => {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl p-8')}>
      <div className={'relative flex items-center justify-between'}>
        <div className={'flex items-start gap-4'}>
          <div
            className={cn(
              'flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br',
              'from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25',
            )}
          >
            <PlusIcon aria-hidden className={'size-8 text-white'} />
          </div>

          <div className={'space-y-2'}>
            <div className={'flex items-center gap-2'}>
              <h1 className={'text-3xl font-bold text-foreground'}>Add New Bobblehead</h1>
              <SparklesIcon aria-hidden className={'size-6 animate-pulse text-yellow-500'} />
            </div>
            <p className={'max-w-2xl text-base text-muted-foreground'}>
              Share your latest find with the community! Add photos, details, and stories about your
              bobblehead to inspire other collectors.
            </p>
            <div className={'flex items-center gap-4 text-sm text-muted-foreground'}>
              <div className={'flex items-center gap-1'}>
                <div className={'size-2 rounded-full bg-green-500'} />
                <span>Something interesting</span>
              </div>
              <div className={'flex items-center gap-1'}>
                <div className={'size-2 rounded-full bg-blue-500'} />
                <span>Something interesting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
