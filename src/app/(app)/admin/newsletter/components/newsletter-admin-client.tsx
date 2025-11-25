'use client';

import type { ComponentPropsWithRef } from 'react';

import { RefreshCwIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

import type {
  NewsletterSendRecord,
  NewsletterSignupRecord,
} from '@/lib/queries/newsletter/newsletter.queries';

import { NewsletterComposeForm } from '@/app/(app)/admin/newsletter/components/newsletter-compose-form';
import { NewsletterSendHistoryTable } from '@/app/(app)/admin/newsletter/components/newsletter-send-history-table';
import { NewsletterStats } from '@/app/(app)/admin/newsletter/components/newsletter-stats';
import { NewsletterSubscribersTable } from '@/app/(app)/admin/newsletter/components/newsletter-subscribers-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Spinner } from '@/components/ui/spinner';
import { useServerAction } from '@/hooks/use-server-action';
import { unsubscribeUserAction } from '@/lib/actions/newsletter/newsletter-admin.actions';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type NewsletterAdminClientProps = ComponentPropsWithRef<'div'> & {
  initialSendHistory: Array<NewsletterSendRecord>;
  initialSubscribers: Array<NewsletterSignupRecord>;
};

/**
 * Newsletter Admin Client Component
 * Client wrapper component for the newsletter admin page
 * Handles state coordination, refresh triggers, and dialog management
 */
export const NewsletterAdminClient = ({
  className,
  initialSendHistory,
  initialSubscribers,
  ...props
}: NewsletterAdminClientProps) => {
  // useState hooks
  const [subscribers] = useState<Array<NewsletterSignupRecord>>(initialSubscribers);
  const [sendHistory] = useState<Array<NewsletterSendRecord>>(initialSendHistory);
  const [isComposeFormVisible, setIsComposeFormVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Server actions
  const { executeAsync: unsubscribeAsync, isPending: isUnsubscribing } = useServerAction(
    unsubscribeUserAction,
    {
      onSuccess: () => {
        void handleRefreshSubscribers();
      },
      toastMessages: {
        error: 'Failed to unsubscribe user',
        loading: 'Unsubscribing...',
        success: 'User unsubscribed successfully',
      },
    },
  );

  // Event handlers
  const handleRefreshSubscribers = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // In a real implementation, you would fetch fresh data here
      // For now, we'll just simulate a refresh
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleRefreshSendHistory = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // In a real implementation, you would fetch fresh data here
      // For now, we'll just simulate a refresh
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleRefreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([handleRefreshSubscribers(), handleRefreshSendHistory()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [handleRefreshSubscribers, handleRefreshSendHistory]);

  const handleUnsubscribe = useCallback(
    async (subscriberId: string) => {
      await unsubscribeAsync({ id: subscriberId });
    },
    [unsubscribeAsync],
  );

  const handleBulkUnsubscribe = useCallback(
    async (subscriberIds: Array<string>) => {
      // Execute unsubscribe actions sequentially to avoid overwhelming the server
      for (const subscriberId of subscriberIds) {
        await unsubscribeAsync({ id: subscriberId });
      }
    },
    [unsubscribeAsync],
  );

  const handleViewSubscriberDetails = useCallback((subscriberId: string) => {
    // Placeholder for future implementation
    console.log('View subscriber details:', subscriberId);
  }, []);

  const handleViewSendDetails = useCallback((sendId: string) => {
    // Placeholder for future implementation
    console.log('View send details:', sendId);
  }, []);

  const handleOpenComposeForm = useCallback(() => {
    setIsComposeFormVisible(true);
  }, []);

  const handleCloseComposeForm = useCallback(() => {
    setIsComposeFormVisible(false);
  }, []);

  const handleComposeFormSuccess = useCallback(() => {
    setIsComposeFormVisible(false);
    void handleRefreshAll();
  }, [handleRefreshAll]);

  // Derived variables for conditional rendering
  const _isLoading = isRefreshing || isUnsubscribing;
  const _isComposeFormOpen = isComposeFormVisible;

  // Test IDs
  const containerTestId = generateTestId('feature', 'admin-dashboard', 'newsletter-management');

  return (
    <div
      className={cn('space-y-8', className)}
      data-slot={'newsletter-admin-client'}
      data-testid={containerTestId}
      {...props}
    >
      {/* Newsletter Statistics */}
      <NewsletterStats />

      {/* Compose Newsletter Section */}
      <Conditional isCondition={_isComposeFormOpen}>
        <NewsletterComposeForm onClose={handleCloseComposeForm} onSuccess={handleComposeFormSuccess} />
      </Conditional>

      <Conditional isCondition={!_isComposeFormOpen}>
        <Card data-slot={'compose-newsletter-trigger'}>
          <CardHeader>
            <CardTitle>Compose Newsletter</CardTitle>
            <CardDescription>Create and send newsletter to your subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleOpenComposeForm}>Compose New Newsletter</Button>
          </CardContent>
        </Card>
      </Conditional>

      {/* Subscribers Management Section */}
      <Card data-slot={'subscribers-section'}>
        <CardHeader>
          <div className={'flex items-center justify-between'}>
            <div>
              <CardTitle>Subscribers Management</CardTitle>
              <CardDescription>View and manage newsletter subscribers</CardDescription>
            </div>
            {/* Refresh Button */}
            <Button
              disabled={_isLoading}
              onClick={() => {
                void handleRefreshSubscribers();
              }}
              size={'sm'}
              variant={'outline'}
            >
              <Conditional isCondition={_isLoading}>
                <Spinner className={'mr-2 size-4'} />
              </Conditional>
              <Conditional isCondition={!_isLoading}>
                <RefreshCwIcon aria-hidden className={'mr-2 size-4'} />
              </Conditional>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <NewsletterSubscribersTable
            data={subscribers}
            onBulkUnsubscribe={(subscriberIds) => {
              void handleBulkUnsubscribe(subscriberIds);
            }}
            onUnsubscribe={(subscriberId) => {
              void handleUnsubscribe(subscriberId);
            }}
            onViewDetails={handleViewSubscriberDetails}
            totalCount={subscribers.length}
          />
        </CardContent>
      </Card>

      {/* Send History Section */}
      <Card data-slot={'send-history-section'}>
        <CardHeader>
          <div className={'flex items-center justify-between'}>
            <div>
              <CardTitle>Send History</CardTitle>
              <CardDescription>View past newsletter sends and their delivery status</CardDescription>
            </div>
            {/* Refresh Button */}
            <Button
              disabled={_isLoading}
              onClick={() => {
                void handleRefreshSendHistory();
              }}
              size={'sm'}
              variant={'outline'}
            >
              <Conditional isCondition={_isLoading}>
                <Spinner className={'mr-2 size-4'} />
              </Conditional>
              <Conditional isCondition={!_isLoading}>
                <RefreshCwIcon aria-hidden className={'mr-2 size-4'} />
              </Conditional>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <NewsletterSendHistoryTable
            data={sendHistory}
            onViewDetails={handleViewSendDetails}
            totalCount={sendHistory.length}
          />
        </CardContent>
      </Card>
    </div>
  );
};

NewsletterAdminClient.displayName = 'NewsletterAdminClient';
