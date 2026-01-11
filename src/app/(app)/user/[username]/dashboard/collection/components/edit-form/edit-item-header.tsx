'use client';

import { EditIcon, SparklesIcon } from 'lucide-react';

import { cn } from '@/utils/tailwind-utils';

interface EditItemHeaderProps {
  bobbleheadName?: null | string;
}

export const EditItemHeader = ({ bobbleheadName }: EditItemHeaderProps) => {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl p-8')}>
      <div className={'relative flex items-center justify-between'}>
        <div className={'flex items-start gap-4'}>
          <div
            className={cn(
              'flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br',
              'from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25',
            )}
          >
            <EditIcon aria-hidden className={'size-8 text-white'} />
          </div>

          <div className={'space-y-2'}>
            <div className={'flex items-center gap-2'}>
              <h1 className={'text-3xl font-bold text-foreground'}>
                Edit Bobblehead{bobbleheadName ? `: ${bobbleheadName}` : ''}
              </h1>
              <SparklesIcon aria-hidden className={'size-6 animate-pulse text-yellow-500'} />
            </div>
            <p className={'max-w-2xl text-base text-muted-foreground'}>
              Update your bobblehead details, manage photos, and refine the information to keep your
              collection accurate.
            </p>
            <div className={'flex items-center gap-4 text-sm text-muted-foreground'}>
              <div className={'flex items-center gap-1'}>
                <div className={'size-2 rounded-full bg-blue-500'} />
                <span>Edit details</span>
              </div>
              <div className={'flex items-center gap-1'}>
                <div className={'size-2 rounded-full bg-green-500'} />
                <span>Manage photos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
