import type { Metadata } from 'next';

import { FeaturedContentManager } from '@/app/(app)/admin/featured-content/components/featured-content-manager';
import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';
import { requireModerator } from '@/lib/utils/admin.utils';

// force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default async function AdminFeaturedContentPage() {
  await requireModerator();
  const featuredContent = await FeaturedContentFacade.getAllFeaturedContentForAdminAsync();

  return (
    <div className={'container mx-auto py-8'}>
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold'}>Featured Content Management</h1>
        <p className={'mt-2 text-muted-foreground'}>
          Manage featured collections, bobbleheads, and user spotlights displayed across the platform.
        </p>
      </div>

      <div className={'space-y-6'}>
        <FeaturedContentManager initialData={featuredContent} />
      </div>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Featured Content Management - Admin',
  };
}
