'use client';

import { useChannel } from 'ably/react';
import { toast } from 'sonner';

import type { NewsletterSignupNotificationPayload } from '@/lib/constants/ably-channels';

import { useAdminRole } from '@/hooks/use-admin-role';
import { ABLY_CHANNELS, ABLY_MESSAGE_TYPES } from '@/lib/constants/ably-channels';

/**
 * NewsletterSignupNotifications
 * Client component that listens to Ably channel for new newsletter signups
 * and displays toast notifications to admin users
 *
 * Only renders for users with admin role - role check happens client-side
 * for immediate UI response
 *
 * Security note: Channel access relies on client-side role check.
 * For production, consider implementing Ably capability tokens for
 * true channel-level access control.
 */
export function NewsletterSignupNotifications() {
  const { isAdmin, isLoading } = useAdminRole();

  // Subscribe to newsletter signup notifications channel
  // Only subscribe if user is admin (not loading and isAdmin is true)
  useChannel(
    {
      channelName: ABLY_CHANNELS.ADMIN_NEWSLETTER_SIGNUPS,
      skip: isLoading || !isAdmin,
    },
    ABLY_MESSAGE_TYPES.NEW_SIGNUP,
    (message) => {
      try {
        const payload = message.data as NewsletterSignupNotificationPayload;

        // Format timestamp for display
        const signupTime = new Date(payload.timestamp);
        const timeString = signupTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          hour12: true,
          minute: '2-digit',
        });

        // Display toast notification
        toast.info('New Newsletter Signup', {
          description: `${payload.email} signed up at ${timeString}`,
          duration: 5000,
        });
      } catch {
        // Silently ignore malformed messages
        // Error logging happens server-side when publishing
      }
    },
  );

  // Component renders nothing - it only handles the Ably subscription
  // and displays toast notifications via sonner
  return null;
}

NewsletterSignupNotifications.displayName = 'NewsletterSignupNotifications';
