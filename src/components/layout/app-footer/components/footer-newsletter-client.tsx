'use client';

import { useNewsletterSubscription } from '@/hooks/use-newsletter-subscription';
import { generateTestId } from '@/lib/test-ids';

import { FooterNewsletterSubscribe } from './footer-newsletter-subscribe';
import { FooterNewsletterUnsubscribe } from './footer-newsletter-unsubscribe';

interface FooterNewsletterClientProps {
  isAuthenticated: boolean;
  isInitiallySubscribed: boolean;
  userEmail: null | string;
}

/**
 * Client component that manages newsletter subscription with optimistic updates.
 *
 * Uses useNewsletterSubscription hook for automatic optimistic state management
 * with instant UI feedback and automatic rollback on errors.
 */
export const FooterNewsletterClient = ({
  isAuthenticated,
  isInitiallySubscribed,
  userEmail,
}: FooterNewsletterClientProps) => {
  const { email, isPending, isSubscribed, subscribe, unsubscribe } = useNewsletterSubscription({
    isInitiallySubscribed,
    userEmail,
  });

  const containerTestId = generateTestId('layout', 'app-footer', 'newsletter');

  // For authenticated users who are subscribed, show the unsubscribe component
  if (isAuthenticated && isSubscribed && email) {
    return (
      <div data-slot={'footer-newsletter'} data-testid={containerTestId}>
        <FooterNewsletterUnsubscribe email={email} isPending={isPending} onUnsubscribe={unsubscribe} />
      </div>
    );
  }

  // For all other cases (public users or unsubscribed authenticated users), show the subscribe form
  return (
    <div data-slot={'footer-newsletter'} data-testid={containerTestId}>
      <FooterNewsletterSubscribe isPending={isPending} onSubscribe={subscribe} />
    </div>
  );
};
