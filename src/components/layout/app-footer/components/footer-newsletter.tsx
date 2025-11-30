import 'server-only';

import { NewsletterFacade } from '@/lib/facades/newsletter/newsletter.facade';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

import { FooterNewsletterClient } from './footer-newsletter-client';

/**
 * Server component that fetches newsletter subscription state for authenticated users.
 * Renders the appropriate client component based on auth and subscription status.
 */
export const FooterNewsletter = async () => {
  const userId = await getUserIdAsync();

  let isSubscribed = false;
  let userEmail: null | string = null;

  if (userId) {
    userEmail = await UsersFacade.getEmailByUserIdAsync(userId);
    if (userEmail) {
      isSubscribed = await NewsletterFacade.getIsActiveSubscriberAsync(userEmail);
    }
  }

  return (
    <FooterNewsletterClient
      isAuthenticated={!!userId}
      isInitiallySubscribed={isSubscribed}
      userEmail={userEmail}
    />
  );
};
