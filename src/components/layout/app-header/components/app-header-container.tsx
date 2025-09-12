'use client';

import { useAuth } from '@clerk/nextjs';

import { cn } from '@/utils/tailwind-utils';

type AppHeaderContainerProps = RequiredChildren;

export const AppHeaderContainer = ({ children }: AppHeaderContainerProps) => {
  const { isSignedIn } = useAuth();

  return (
    <div
      className={cn('flex h-16 w-full items-center gap-4 px-4', !isSignedIn && 'justify-center')}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
};
