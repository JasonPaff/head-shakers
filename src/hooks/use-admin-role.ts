'use client';

import { useUser } from '@clerk/nextjs';

export interface AdminRoleInfo {
  isAdmin: boolean;
  isLoading: boolean;
  isModerator: boolean;
  role: Role;
}

type Role = 'admin' | 'moderator' | 'user' | null;

/**
 * Client-side hook to check if the current user has admin or moderator privileges
 */
export const useAdminRole = (): AdminRoleInfo => {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return {
      isAdmin: false,
      isLoading: true,
      isModerator: false,
      role: null,
    };
  }

  if (!user) {
    return {
      isAdmin: false,
      isLoading: false,
      isModerator: false,
      role: null,
    };
  }

  // check user's public metadata for role information
  const role = user.publicMetadata?.role as Role;

  return {
    isAdmin: role === 'admin',
    isLoading: false,
    isModerator: role === 'moderator',
    role: role || 'user',
  };
};
