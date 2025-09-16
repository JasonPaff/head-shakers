'use client';

import type { ReactNode } from 'react';

import { useAuth } from '@clerk/nextjs';
import { Fragment } from 'react';

import { Conditional } from '@/components/ui/conditional';

type AuthContentProps = RequiredChildren<{
  fallback?: ReactNode;
  loadingSkeleton?: ReactNode;
}>;

export const AuthContent = ({ children, fallback, loadingSkeleton }: AuthContentProps) => {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <Fragment>
      <Conditional isCondition={!isLoaded}>{loadingSkeleton}</Conditional>
      <Conditional isCondition={isLoaded && isSignedIn}>{children}</Conditional>
      <Conditional isCondition={isLoaded && !isSignedIn}>{fallback}</Conditional>
    </Fragment>
  );
};
