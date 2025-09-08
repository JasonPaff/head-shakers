import { requireModerator } from '@/lib/utils/admin.utils';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await requireModerator();

  return (
    <div className={'container mx-auto py-8'}>
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold'}>User Management</h1>
        <p className={'mt-2 text-muted-foreground'}>Manage user accounts, roles, and permissions.</p>
      </div>

      <div className={'space-y-6'}>
        <div className={'rounded-lg border p-6'}>
          <h2 className={'mb-4 text-xl font-semibold'}>User Administration</h2>
          <div className={'py-12 text-center text-muted-foreground'}>
            <p>User management interface coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
