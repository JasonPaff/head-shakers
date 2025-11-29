import 'server-only';

import { FooterNewsletterSubscribe } from '@/components/layout/app-footer/components/footer-newsletter-subscribe';
import { FooterNewsletterUnsubscribe } from '@/components/layout/app-footer/components/footer-newsletter-unsubscribe';
import { NewsletterFacade } from '@/lib/facades/newsletter/newsletter.facade';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

/**
 * Async server component for the footer newsletter section
 * Checks the user authentication and subscription status to conditionally render
 * either the subscribed form or unsubscribe interface
 */
export const FooterNewsletter = async () => {
  // Check if the user is authenticated
  const userId = await getUserIdAsync();
  if (!userId) return <FooterNewsletterSubscribe />;

  // Get user record to check email
  const email = await UsersFacade.getEmailByUserIdAsync(userId);
  if (!email) return <FooterNewsletterSubscribe />;

  // Check if the user is actively subscribed
  const isActiveSubscriber = await NewsletterFacade.getIsActiveSubscriberAsync(email);
  if (isActiveSubscriber) return <FooterNewsletterUnsubscribe userEmail={email} />;

  return <FooterNewsletterSubscribe />;
};
