'use client';

import { BellIcon } from 'lucide-react';

import { AuthContent } from '@/components/ui/auth';
import { NotificationBellSkeleton } from '@/components/ui/skeleton';

export const AppHeaderNotifications = () => {
  return (
    <AuthContent loadingSkeleton={<NotificationBellSkeleton />}>
      <BellIcon aria-label={'notifications'} className={'h-5 w-5'} />
    </AuthContent>
  );
};
