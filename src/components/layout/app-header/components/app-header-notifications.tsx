'use client';

import { BellIcon } from 'lucide-react';

import { AuthContent } from '@/components/ui/auth';

export const AppHeaderNotifications = () => {
  return (
    <AuthContent>
      <BellIcon aria-label={'notifications'} className={'h-5 w-5'} />
    </AuthContent>
  );
};
