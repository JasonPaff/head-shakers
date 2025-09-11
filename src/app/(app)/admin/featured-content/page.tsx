import type { Metadata } from 'next';

import { FeaturedContentManager } from '@/app/(app)/admin/featured-content/components/featured-content-manager';
import { AdminLayout } from '@/components/layout/admin/admin-layout';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';

// force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default async function AdminFeaturedContentPage() {
  const featuredContent = await FeaturedContentFacade.getAllFeaturedContentForAdmin();

  return (
    <AdminLayout isAdminRequired={false}>
      <div className={'space-y-6'}>
        {/* Header */}
        <div className={'flex items-center justify-between'}>
          <div>
            <h2 className={'text-2xl font-bold tracking-tight'}>Featured Content Management</h2>
            <p className={'text-muted-foreground'}>
              Manage featured collections, bobbleheads, and user spotlights displayed across the platform
            </p>
          </div>
        </div>

        {/* Featured Content */}
        <FeaturedContentManager initialData={featuredContent} />
      </div>
    </AdminLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Featured Content Management - Admin',
  };
}
