'use client';

import { useAuth } from '@clerk/nextjs';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { cn } from '@/utils/tailwind-utils';

type AppHeaderContainerProps = ComponentTestIdProps & RequiredChildren;

export const AppHeaderContainer = ({ children, testId }: AppHeaderContainerProps) => {
  const { isSignedIn } = useAuth();

  return (
    <div
      className={cn('flex h-16 w-full items-center gap-4 px-4', !isSignedIn && 'justify-center')}
      data-testid={testId}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
};
