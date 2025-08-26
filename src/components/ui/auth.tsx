'use client';

import { useAuth } from '@clerk/nextjs';

import { Conditional } from '@/components/ui/conditional';

type AuthContentProps = RequiredChildren;

export const AuthContent = ({ children }: AuthContentProps) => {
  const { isSignedIn } = useAuth();

  return <Conditional isCondition={isSignedIn}>{children}</Conditional>;
};
