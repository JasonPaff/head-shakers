import { FeaturedContentManager } from '@/components/admin/featured-content/featured-content-manager';
import { AdminLayout } from '@/components/layout/admin/admin-layout';

export default function AdminFeaturedContentPage() {
  return (
    <AdminLayout isAdminRequired={false}>
      <div className={'space-y-6'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <h2 className={'text-2xl font-bold tracking-tight'}>Featured Content Management</h2>
            <p className={'text-muted-foreground'}>
              Manage featured collections, bobbleheads, and user spotlights displayed across the platform
            </p>
          </div>
        </div>
        <FeaturedContentManager />
      </div>
    </AdminLayout>
  );
}
