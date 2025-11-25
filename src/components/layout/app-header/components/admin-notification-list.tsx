'use client';

import type { ComponentProps } from 'react';

import { BellIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { SelectNotification } from '@/lib/validations/admin-notifications.validation';

import { Conditional } from '@/components/ui/conditional';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { AdminNotificationItem } from './admin-notification-item';

type AdminNotificationListProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    isLoading?: boolean;
    notifications: Array<SelectNotification>;
    onNotificationClick?: (notification: SelectNotification) => void;
  };

export const AdminNotificationList = ({
  className,
  isLoading = false,
  notifications,
  onNotificationClick,
  testId,
  ...props
}: AdminNotificationListProps) => {
  const listTestId = testId || generateTestId('layout', 'app-header', 'notification-list');
  const emptyStateTestId =
    testId ? `${testId}-empty` : generateTestId('layout', 'app-header', 'notification-list-empty');
  const loadingTestId =
    testId ? `${testId}-loading` : generateTestId('layout', 'app-header', 'notification-list-loading');

  // Derived variables
  const _hasNotifications = notifications.length > 0;
  const _isEmpty = !isLoading && !_hasNotifications;

  return (
    <div
      className={cn('flex min-h-[200px] w-full flex-col', className)}
      data-slot={'notification-list'}
      data-testid={listTestId}
      {...props}
    >
      {/* Loading State */}
      <Conditional isCondition={isLoading}>
        <div
          className={'flex flex-1 items-center justify-center p-8'}
          data-slot={'notification-list-loading'}
          data-testid={loadingTestId}
        >
          <Spinner className={'size-6'} />
        </div>
      </Conditional>

      {/* Empty State */}
      <Conditional isCondition={_isEmpty}>
        <EmptyState
          className={'min-h-[200px] border-none bg-transparent'}
          description={'No notifications yet. When new updates arrive, they will appear here.'}
          icon={BellIcon}
          testId={emptyStateTestId}
          title={'No Notifications'}
        />
      </Conditional>

      {/* Notification Items */}
      <Conditional isCondition={!isLoading && _hasNotifications}>
        <div
          className={'max-h-[400px] overflow-y-auto'}
          data-slot={'notification-list-items'}
          data-testid={`${listTestId}-items`}
        >
          {notifications.map((notification) => {
            const handleItemClick = () => {
              onNotificationClick?.(notification);
            };

            return (
              <AdminNotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleItemClick}
                testId={`${listTestId}-item-${notification.id}`}
              />
            );
          })}
        </div>
      </Conditional>
    </div>
  );
};
