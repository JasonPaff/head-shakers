'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

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

  const [roleInfo, setRoleInfo] = useState<AdminRoleInfo>({
    isAdmin: false,
    isLoading: true,
    isModerator: false,
    role: null,
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setRoleInfo({
        isAdmin: false,
        isLoading: false,
        isModerator: false,
        role: null,
      });
      return;
    }

    // check user's public metadata for role information
    const role = user.publicMetadata?.role as Role;

    setRoleInfo({
      isAdmin: role === 'admin',
      isLoading: false,
      isModerator: role === 'moderator',
      role: role || 'user',
    });
  }, [user, isLoaded]);

  return roleInfo;
};
