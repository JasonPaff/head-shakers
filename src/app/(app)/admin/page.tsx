import type { Metadata } from 'next';

import { AdminLayout } from '@/components/layout/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  return (
    <AdminLayout isAdminRequired={false}>
      <div className={'grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
        <Card>
          <CardHeader>
            <CardTitle>Featured Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'text-sm text-muted-foreground'}>
              Manage featured collections and bobbleheads displayed on the homepage
            </p>
            <div className={'mt-4'}>
              <p className={'text-2xl font-bold'}>12</p>
              <p className={'text-xs text-muted-foreground'}>Active Features</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'text-sm text-muted-foreground'}>
              Review and moderate reported content from the community
            </p>
            <div className={'mt-4'}>
              <p className={'text-2xl font-bold'}>3</p>
              <p className={'text-xs text-muted-foreground'}>Pending Reports</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={'text-sm text-muted-foreground'}>Manage user accounts and community moderation</p>
            <div className={'mt-4'}>
              <p className={'text-2xl font-bold'}>1,234</p>
              <p className={'text-xs text-muted-foreground'}>Total Users</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    description: 'Admin dashboard for content moderation and site management',
    robots: 'noindex, nofollow',
    title: 'Admin',
  };
}
