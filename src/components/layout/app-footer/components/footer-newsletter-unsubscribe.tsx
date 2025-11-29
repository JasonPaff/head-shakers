'use client';

import type { ComponentProps } from 'react';

import { MailCheckIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useServerAction } from '@/hooks/use-server-action';
import { unsubscribeFromNewsletterAction } from '@/lib/actions/newsletter/newsletter.actions';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type FooterNewsletterUnsubscribeProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    userEmail: string;
  };

/**
 * Newsletter unsubscribe component for the footer
 * Displays subscription status and allows authenticated users to unsubscribe
 * Shows user email for confirmation before unsubscribing
 */
export const FooterNewsletterUnsubscribe = withFocusManagement(
  ({ className, testId, userEmail, ...props }: FooterNewsletterUnsubscribeProps) => {
    const router = useRouter();

    const { executeAsync, isExecuting } = useServerAction(unsubscribeFromNewsletterAction, {
      breadcrumbContext: {
        action: 'newsletter-unsubscribe',
        component: 'footer-newsletter-unsubscribe',
      },
      loadingMessage: 'Unsubscribing...',
      onAfterSuccess: () => {
        router.refresh();
      },
    });

    const handleUnsubscribe = useCallback(async () => {
      await executeAsync({ email: userEmail });
    }, [executeAsync, userEmail]);

    const unsubscribeTestId = testId || generateTestId('layout', 'app-footer', 'newsletter-unsubscribe');

    return (
      <div
        aria-labelledby={'footer-newsletter-heading'}
        className={cn(
          'rounded-lg border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800',
          className,
        )}
        data-slot={'footer-newsletter-unsubscribe'}
        data-testid={unsubscribeTestId}
        role={'region'}
        {...props}
      >
        {/* Newsletter Header */}
        <div className={'mb-2'}>
          <div className={'mb-1 flex items-center gap-2'}>
            <MailCheckIcon aria-hidden className={'size-4 text-green-600 dark:text-green-400'} />
            <h3
              className={'text-sm font-semibold text-slate-700 dark:text-slate-200'}
              id={'footer-newsletter-heading'}
            >
              Newsletter Subscriber
            </h3>
          </div>
          <p className={'text-xs text-slate-600 dark:text-slate-400'}>
            You&apos;re receiving bobblehead news and updates at{' '}
            <span className={'font-medium'}>{userEmail}</span>
          </p>
        </div>

        {/* Unsubscribe Link */}
        <button
          className={
            'text-xs text-slate-500 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400'
          }
          data-testid={`${unsubscribeTestId}-button`}
          disabled={isExecuting}
          onClick={handleUnsubscribe}
          type={'button'}
        >
          {isExecuting ? 'Unsubscribing...' : 'Unsubscribe'}
        </button>
      </div>
    );
  },
);
