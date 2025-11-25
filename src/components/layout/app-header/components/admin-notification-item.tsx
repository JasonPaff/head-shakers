'use client';

import type { ComponentProps } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { BellIcon, HeartIcon, MessageCircleIcon, UserPlusIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { SelectNotification } from '@/lib/validations/admin-notifications.validation';

import { cn } from '@/utils/tailwind-utils';

type AdminNotificationItemProps = ComponentTestIdProps &
  Omit<ComponentProps<'button'>, 'onClick'> & {
    notification: SelectNotification;
    onClick?: (notification: SelectNotification) => void;
  };

export const AdminNotificationItem = ({
  className,
  notification,
  onClick,
  testId,
  ...props
}: AdminNotificationItemProps) => {
  const itemTestId = testId || 'layout-notification-item';

  // Derived variables
  const _isUnread = !notification.isRead;
  const _timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
  const _createdAtIso = new Date(notification.createdAt).toISOString();

  // Event handlers
  const handleClick = () => {
    onClick?.(notification);
  };

  // Get icon based on notification type
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'comment':
        return <MessageCircleIcon aria-hidden className={'size-4'} />;
      case 'follow':
        return <UserPlusIcon aria-hidden className={'size-4'} />;
      case 'like':
        return <HeartIcon aria-hidden className={'size-4'} />;
      case 'mention':
        return <BellIcon aria-hidden className={'size-4'} />;
      case 'system':
        return <BellIcon aria-hidden className={'size-4'} />;
      default:
        return <BellIcon aria-hidden className={'size-4'} />;
    }
  };

  return (
    <button
      className={cn(
        'flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors',
        'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        _isUnread ? 'bg-primary/5 opacity-100' : 'opacity-60',
        className,
      )}
      data-slot={'notification-item'}
      data-testid={itemTestId}
      onClick={handleClick}
      type={'button'}
      {...props}
    >
      {/* Notification Icon */}
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          _isUnread ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        {getNotificationIcon()}
      </div>

      {/* Notification Content */}
      <div className={'flex min-w-0 flex-1 flex-col gap-1'}>
        <div className={'flex items-start justify-between gap-2'}>
          <h4 className={cn('text-sm font-semibold', _isUnread && 'text-foreground')}>
            {notification.title}
          </h4>
          {_isUnread && (
            <span aria-label={'Unread'} className={'mt-0.5 size-2 shrink-0 rounded-full bg-primary'} />
          )}
        </div>

        {notification.message && (
          <p className={'line-clamp-2 text-xs text-muted-foreground'}>{notification.message}</p>
        )}

        <time className={'text-xs text-muted-foreground'} dateTime={_createdAtIso}>
          {_timeAgo}
        </time>
      </div>
    </button>
  );
};
