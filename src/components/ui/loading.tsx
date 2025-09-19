'use client';

import { useEffect, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface LoadingProps extends ComponentTestIdProps {
  message?: string;
}

export const Loading = ({ message, testId }: LoadingProps) => {
  const [dots, setDots] = useState('');
  const loadingTestId = testId || generateTestId('ui', 'loading');
  const spinnerTestId = generateTestId('ui', 'loading', 'spinner');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={'flex min-h-screen items-center justify-center bg-background'} data-testid={loadingTestId}>
      <div className={'space-y-6 text-center'}>
        {/* Clean Spinner */}
        <div className={'relative mx-auto size-12'} data-testid={spinnerTestId}>
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
