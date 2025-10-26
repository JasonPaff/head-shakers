'use client';

import type { ComponentTestIdProps } from '@/lib/test-ids';

type AppHeaderContainerProps = ComponentTestIdProps & RequiredChildren;

export const AppHeaderContainer = ({ children, testId }: AppHeaderContainerProps) => {
  return (
    <div
      className={'flex h-14 w-full items-center gap-2 sm:h-16 sm:gap-4 md:gap-6'}
      data-testid={testId}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
};
