import type { Metadata } from 'next';

import { NewsletterAdminClient } from '@/app/(app)/admin/newsletter/components/newsletter-admin-client';
import { NewsletterFacade } from '@/lib/facades/newsletter/newsletter.facade';
import { getCurrentUserWithRole, requireModerator } from '@/lib/utils/admin.utils';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

interface AdminNewsletterPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
  }>;
}

export function generateMetadata(): Metadata {
  return {
    description: 'Manage newsletter subscribers, compose and send newsletters, view send history.',
    title: 'Newsletter Management - Admin',
  };
}

export default AdminNewsletterPage;

async function AdminNewsletterPage({ searchParams }: AdminNewsletterPageProps) {
  // Verify admin/moderator access
  await requireModerator();

  // Await and parse search params
  const resolvedSearchParams = await searchParams;

  // Extract pagination parameters
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const pageSize = resolvedSearchParams.pageSize ? parseInt(resolvedSearchParams.pageSize, 10) : 25;

  // Build filter options for subscribers query
  const subscribersFilters: {
    search?: null | string;
    status?: 'all' | 'subscribed' | 'unsubscribed';
  } = {};

  // Add search filter if provided
  if (resolvedSearchParams.search) {
    subscribersFilters.search = resolvedSearchParams.search;
  }

  // Add status filter if provided and valid
  const validStatuses = ['all', 'subscribed', 'unsubscribed'] as const;
  if (
    resolvedSearchParams.status &&
    validStatuses.includes(resolvedSearchParams.status as 'all' | 'subscribed' | 'unsubscribed')
  ) {
    subscribersFilters.status = resolvedSearchParams.status as 'all' | 'subscribed' | 'unsubscribed';
  } else {
    subscribersFilters.status = 'subscribed'; // Default to active subscribers
  }

  // Get current admin/moderator user
  const currentUser = await getCurrentUserWithRole();

  if (!currentUser) {
    throw new Error('User not found');
  }

  const adminUserId = currentUser.id;

  const [initialSubscribersData, initialSendHistoryData] = await Promise.all([
    NewsletterFacade.getSubscribersForAdminAsync(
      subscribersFilters,
      {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      },
      adminUserId,
    ),
    NewsletterFacade.getSendHistoryAsync(
      {
        limit: 10,
      },
      adminUserId,
    ),
  ]);

  return (
    <div className={'container mx-auto py-8'} data-slot={'admin-newsletter-page'}>
      {/* Page Header */}
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold'}>Newsletter Management</h1>
        <p className={'mt-2 text-muted-foreground'}>
          Manage newsletter subscribers, compose and send newsletters, view send history.
        </p>
      </div>

      {/* Main Content - Client Component */}
      <NewsletterAdminClient
        initialSendHistory={initialSendHistoryData}
        initialSubscribers={initialSubscribersData}
      />
    </div>
  );
}
