'use client';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { cn } from '@/utils/tailwind-utils';

type AppHeaderContainerProps = ComponentTestIdProps & RequiredChildren;

export const AppHeaderContainer = ({ children, testId }: AppHeaderContainerProps) => {

  return (
    <div
      className={cn('flex h-16 w-full items-center gap-6 px-4')}
      data-testid={testId}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
};
