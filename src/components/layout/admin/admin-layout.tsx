import type { ReactNode } from 'react';

import { AdminRouteGuard } from '@/components/ui/admin/admin-route-guard';

interface AdminLayoutProps {
  children: ReactNode;
  isAdminRequired?: boolean;
}

/**
 * Layout component for admin pages that includes route protection
 */
export const AdminLayout = ({ children, isAdminRequired = false }: AdminLayoutProps) => {
  return (
    <AdminRouteGuard isAdminRequired={isAdminRequired}>
      <div className={'min-h-screen bg-background'}>
        <div className={'container mx-auto max-w-7xl py-6'}>
          <div className={'mb-6'}>
            <h1 className={'text-3xl font-bold text-foreground'}>
              {isAdminRequired ? 'Admin Dashboard' : 'Moderation Dashboard'}
            </h1>
            <p className={'text-muted-foreground'}>
              {isAdminRequired ?
                'Manage featured content, users, and platform settings'
              : 'Moderate content and manage community features'}
            </p>
          </div>
          {children}
        </div>
      </div>
    </AdminRouteGuard>
  );
};
