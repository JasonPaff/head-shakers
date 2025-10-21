import { $path } from 'next-typesafe-url';
import { redirect } from 'next/navigation';
import { Fragment } from 'react';

import { getCurrentUserWithRole } from '@/lib/utils/admin.utils';

type AdminRouteGuardProps = Children<{
  fallbackPath?: string;
  isAdminRequired?: boolean; // if false, moderator access is allowed
}>;

/**
 * Component that protects admin routes by checking user role
 * Redirects to the fallback path if the user lacks required permissions
 */
export const AdminRouteGuard = async ({
  children,
  fallbackPath = '/dashboard',
  isAdminRequired = false,
}: AdminRouteGuardProps) => {
  const user = await getCurrentUserWithRole();

  // redirect if not authenticated
  if (!user) {
    redirect($path({ route: '/' }));
  }

  // check role permissions
  const hasPermission = isAdminRequired ? user.isAdmin : user.isModerator;

  if (!hasPermission) {
    redirect(fallbackPath);
  }

  return <Fragment>{children}</Fragment>;
};
