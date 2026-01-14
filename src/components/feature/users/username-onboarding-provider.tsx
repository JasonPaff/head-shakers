'use client';

import { useAuth } from '@clerk/nextjs';
import { Fragment, useMemo, useState } from 'react';

import { UsernameSetupDialog } from '@/components/feature/users/username-setup-dialog';

interface UsernameOnboardingProviderProps {
  currentUsername: string;
  shouldShow: boolean;
}

/**
 * Provider component that handles username onboarding for first-time users
 * Shows UsernameSetupDialog when user has never set their username
 */
export const UsernameOnboardingProvider = ({
  currentUsername,
  shouldShow,
}: UsernameOnboardingProviderProps) => {
  const { userId } = useAuth();

  // Calculate initial state based on props and localStorage
  const initialIsOpen = useMemo(() => {
    // Check if user has already dismissed the dialog
    const _isDismissed =
      typeof window !== 'undefined' &&
      localStorage.getItem(`${userId}-username-setup-dialog-dismissed`) === 'true';

    // Show dialog only if server says we should and not dismissed
    return shouldShow && !_isDismissed;
  }, [shouldShow, userId]);

  // State
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  // Event handlers
  const handleClose = () => {
    setIsOpen(false);
  };

  // Don't render anything if dialog not open
  if (!isOpen) {
    return null;
  }

  return (
    <Fragment>
      <UsernameSetupDialog currentUsername={currentUsername} isOpen={isOpen} onClose={handleClose} />
    </Fragment>
  );
};
