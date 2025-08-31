'use client';

import type { ReactNode } from 'react';

import { useAuth } from '@clerk/nextjs';
import { Fragment } from 'react';

import { Conditional } from '@/components/ui/conditional';

type AuthContentProps = RequiredChildren<{ fallback?: ReactNode }>;

export const AuthContent = ({ children, fallback }: AuthContentProps) => {
  const { isSignedIn } = useAuth();

  return (
    <Fragment>
      <Conditional isCondition={isSignedIn}>{children}</Conditional>
      <Conditional isCondition={!isSignedIn}>{fallback}</Conditional>
    </Fragment>
  );
};
