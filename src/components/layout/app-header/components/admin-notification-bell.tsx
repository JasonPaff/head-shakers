'use client';

import type { ComponentProps } from 'react';

import { useAuth } from '@clerk/nextjs';
import { ChannelProvider, useChannel } from 'ably/react';
import { cva } from 'class-variance-authority';
import { BellIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { AdminNotificationPayload } from '@/lib/constants/ably-channels';
import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { SelectNotification } from '@/lib/validations/admin-notifications.validation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useServerAction } from '@/hooks/use-server-action';
import {
  getUnreadNotificationCountAction,
  getUnreadNotificationsAction,
  markNotificationAsReadAction,
} from '@/lib/actions/notifications/admin-notifications.actions';
import { ABLY_CHANNELS, ABLY_MESSAGE_TYPES } from '@/lib/constants/ably-channels';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { AdminNotificationList } from './admin-notification-list';

const bellVariants = cva(
  [
    'relative inline-flex size-9 items-center justify-center rounded-md transition-all',
    'hover:bg-accent hover:text-accent-foreground',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
  ],
  {
    defaultVariants: {
      state: 'default',
    },
    variants: {
      state: {
        default: '',
        hasUnread: 'text-primary',
      },
    },
  },
);

type AdminNotificationBellProps = ComponentProps<'div'> & ComponentTestIdProps;

/**
 * Internal component that subscribes to Ably notifications channel
 * Must be rendered within a ChannelProvider
 */
type NotificationSubscriberProps = {
  onNewNotification: () => void;
  userId: string;
};

const NotificationSubscriber = ({ onNewNotification, userId }: NotificationSubscriberProps) => {
  // Subscribe to Ably channel for real-time notification updates
  // When inside ChannelProvider, useChannel subscribes to the provider's channel
  // First arg is channel name (must match ChannelProvider), second is message type filter
  useChannel(ABLY_CHANNELS.ADMIN_NOTIFICATIONS, ABLY_MESSAGE_TYPES.NOTIFICATION_CREATED, (message) => {
    try {
      const payload = message.data as AdminNotificationPayload;

      // Only process notifications for the current user
      if (payload.userId !== userId) {
        return;
      }

      // Trigger refresh
      onNewNotification();
    } catch {
      // Silently ignore malformed messages
      // Error logging happens server-side when publishing
    }
  });

  // Return null - this component only handles the subscription
  return null;
};

export const AdminNotificationBell = ({ className, testId, ...props }: AdminNotificationBellProps) => {
  // useState hooks
  const [isOpen, setIsOpen] = useState(false);
  const [countTrigger, setCountTrigger] = useState(0);
  const [notificationsTrigger, setNotificationsTrigger] = useState(0);

  // Other hooks
  const { isAdmin, isLoading: isAdminLoading } = useAdminRole();
  const { userId } = useAuth();

  // Server action hooks - using execute (not executeAsync) to avoid setState-in-effect issue
  const {
    execute: fetchCount,
    isPending: isCountLoading,
    result: countResult,
  } = useServerAction(getUnreadNotificationCountAction, {
    isDisableToast: true,
  });

  const {
    execute: fetchNotifications,
    isPending: isNotificationsLoading,
    result: notificationsResult,
  } = useServerAction(getUnreadNotificationsAction, {
    isDisableToast: true,
  });

  const { executeAsync: markAsRead } = useServerAction(markNotificationAsReadAction, {
    isDisableToast: true,
  });

  // Derive data from results
  const unreadCount = useMemo(() => {
    const data = countResult?.data;
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as { data?: unknown }).data;
      if (innerData && typeof innerData === 'object' && 'count' in innerData) {
        return (innerData as { count: number }).count;
      }
    }
    return 0;
  }, [countResult]);

  const notifications = useMemo<Array<SelectNotification>>(() => {
    const data = notificationsResult?.data;
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as { data?: unknown }).data;
      if (Array.isArray(innerData)) {
        return innerData as Array<SelectNotification>;
      }
    }
    return [];
  }, [notificationsResult]);

  // Fetch unread count when user is admin
  useEffect(() => {
    if (isAdmin && !isAdminLoading) {
      fetchCount({});
    }
  }, [isAdmin, isAdminLoading, countTrigger, fetchCount]);

  // Fetch notifications when popover opens
  useEffect(() => {
    if (isOpen && isAdmin && userId) {
      fetchNotifications({ limit: 10, offset: 0, userId });
    }
  }, [isOpen, isAdmin, userId, notificationsTrigger, fetchNotifications]);

  // Handler for new notification from Ably
  const handleNewNotification = () => {
    // Trigger a refetch of count and notifications
    setCountTrigger((prev) => prev + 1);
    if (isOpen) {
      setNotificationsTrigger((prev) => prev + 1);
    }
  };

  // Event handlers
  const handleNotificationClick = async (notification: SelectNotification) => {
    if (!notification.isRead && userId) {
      await markAsRead({ notificationId: notification.id });
      // Trigger refetch
      setCountTrigger((prev) => prev + 1);
      setNotificationsTrigger((prev) => prev + 1);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  // Derived variables
  const _shouldRender = isAdmin && !isAdminLoading;
  const _shouldSubscribe = _shouldRender && Boolean(userId);
  const _hasUnread = unreadCount > 0;
  const _isLoading = isNotificationsLoading || isCountLoading;

  const bellTestId = testId || generateTestId('layout', 'app-header', 'notification-bell');
  const triggerTestId =
    testId ? `${testId}-trigger` : generateTestId('layout', 'app-header', 'notification-bell-trigger');
  const badgeTestId =
    testId ? `${testId}-badge` : generateTestId('layout', 'app-header', 'notification-bell-badge');
  const popoverTestId =
    testId ? `${testId}-popover` : generateTestId('layout', 'app-header', 'notification-bell-popover');
  const contentTestId =
    testId ? `${testId}-content` : generateTestId('layout', 'app-header', 'notification-bell-content');

  return (
    <Conditional isCondition={_shouldRender}>
      {/* Real-time subscription wrapped in ChannelProvider */}
      <Conditional isCondition={_shouldSubscribe}>
        <ChannelProvider channelName={ABLY_CHANNELS.ADMIN_NOTIFICATIONS}>
          <NotificationSubscriber onNewNotification={handleNewNotification} userId={userId || ''} />
        </ChannelProvider>
      </Conditional>

      <div
        className={cn('relative', className)}
        data-slot={'notification-bell'}
        data-testid={bellTestId}
        {...props}
      >
        <Popover onOpenChange={handleOpenChange} open={isOpen} testId={popoverTestId}>
          {/* Bell Icon Trigger */}
          <PopoverTrigger asChild testId={triggerTestId}>
            <Button
              aria-label={'Notifications'}
              className={cn(bellVariants({ state: _hasUnread ? 'hasUnread' : 'default' }))}
              size={'icon'}
              variant={'ghost'}
            >
              <BellIcon aria-hidden className={'size-5'} />

              {/* Unread Badge */}
              <Conditional isCondition={_hasUnread}>
                <Badge
                  className={
                    'absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full p-0 text-xs'
                  }
                  testId={badgeTestId}
                  variant={'destructive'}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              </Conditional>
            </Button>
          </PopoverTrigger>

          {/* Notification Popover Content */}
          <PopoverContent align={'end'} className={'w-[400px] p-0'} sideOffset={8} testId={contentTestId}>
            {/* Popover Header */}
            <div
              className={'flex items-center justify-between border-b px-4 py-3'}
              data-slot={'notification-bell-header'}
            >
              <h3 className={'text-sm font-semibold'}>Notifications</h3>
              <Conditional isCondition={_hasUnread}>
                <span className={'text-xs text-muted-foreground'}>{unreadCount} unread</span>
              </Conditional>
            </div>

            {/* Notification List */}
            <div data-slot={'notification-bell-body'}>
              <AdminNotificationList
                isLoading={_isLoading}
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                testId={`${bellTestId}-list`}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </Conditional>
  );
};
