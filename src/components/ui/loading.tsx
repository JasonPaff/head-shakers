'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/utils/tailwind-utils';

interface LoadingProps {
  message?: string;
}

export const Loading = ({ message }: LoadingProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={'flex min-h-screen items-center justify-center bg-background'}>
      <div className={'space-y-6 text-center'}>
        {/* Clean Spinner */}
        <div className={'relative mx-auto size-12'}>
          <div className={'absolute inset-0 rounded-full border-4 border-muted'}></div>
          <div
            className={cn(
              'absolute inset-0 animate-spin rounded-full',
              'border-4 border-primary border-t-transparent',
            )}
          ></div>
        </div>

        {/* Message with Animated Dots */}
        <div className={'space-y-2'}>
          <p className={'font-medium text-foreground'}>{message}</p>
          <p className={'min-h-[20px] text-sm text-muted-foreground'}>Please wait{dots}</p>
        </div>
      </div>
    </div>
  );
};
