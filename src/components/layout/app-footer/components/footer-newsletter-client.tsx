'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { generateTestId } from '@/lib/test-ids';

import { FooterNewsletterSubscribe } from './footer-newsletter-subscribe';
import { FooterNewsletterUnsubscribe } from './footer-newsletter-unsubscribe';

interface FooterNewsletterClientProps {
  isAuthenticated: boolean;
  isInitiallySubscribed: boolean;
  userEmail: null | string;
}

/**
 * Client component that manages newsletter subscription state and optimistic updates.
 *
 * For authenticated users:
 * - Optimistically updates UI when subscribing/unsubscribing
 * - Rolls back state on error and shows error toast
 *
 * For public users:
 * - Shows subscribe form only (never sees unsubscribe view)
 * - Success/error handled by the subscribe form with toasts
 */
export const FooterNewsletterClient = ({
  isAuthenticated,
  isInitiallySubscribed,
  userEmail,
}: FooterNewsletterClientProps) => {
  const [isSubscribed, setIsSubscribed] = useState(isInitiallySubscribed);
  const [subscribedEmail, setSubscribedEmail] = useState<null | string>(userEmail);

  const containerTestId = generateTestId('layout', 'app-footer', 'newsletter');

  /**
   * Called by the subscribe form for authenticated users only.
   * Optimistically updates the UI before the action completes.
   */
  const handleOptimisticSubscribe = (email: string) => {
    setIsSubscribed(true);
    setSubscribedEmail(email);
  };

  /**
   * Called when subscribe action fails for authenticated users.
   * Rolls back the optimistic update and shows error toast.
   */
  const handleSubscribeError = (errorMessage: string, previousEmail: null | string) => {
    setIsSubscribed(false);
    setSubscribedEmail(previousEmail);
    toast.error(errorMessage);
  };

  /**
   * Called by the unsubscribe component.
   * Optimistically updates the UI before the action completes.
   */
  const handleOptimisticUnsubscribe = () => {
    setIsSubscribed(false);
    setSubscribedEmail(null);
  };

  /**
   * Called when unsubscribe action fails.
   * Rolls back the optimistic update and shows error toast.
   */
  const handleUnsubscribeError = (errorMessage: string, previousEmail: null | string) => {
    setIsSubscribed(true);
    setSubscribedEmail(previousEmail);
    toast.error(errorMessage);
  };

  // For authenticated users who are subscribed, show the unsubscribe component
  if (isAuthenticated && isSubscribed && subscribedEmail) {
    return (
      <div data-slot={'footer-newsletter'} data-testid={containerTestId}>
        <FooterNewsletterUnsubscribe
          email={subscribedEmail}
          onError={handleUnsubscribeError}
          onOptimisticUnsubscribe={handleOptimisticUnsubscribe}
        />
      </div>
    );
  }

  // For all other cases (public users or unsubscribed authenticated users), show the subscribe form
  return (
    <div data-slot={'footer-newsletter'} data-testid={containerTestId}>
      <FooterNewsletterSubscribe
        currentEmail={subscribedEmail}
        isAuthenticated={isAuthenticated}
        onError={handleSubscribeError}
        onOptimisticSubscribe={handleOptimisticSubscribe}
      />
    </div>
  );
};
