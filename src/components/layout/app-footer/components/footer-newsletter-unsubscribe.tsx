'use client';

import { CheckCircleIcon } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { useServerAction } from '@/hooks/use-server-action';
import { unsubscribeFromNewsletterAction } from '@/lib/actions/newsletter/newsletter.actions';
import { generateTestId } from '@/lib/test-ids';
import { maskEmail } from '@/lib/utils/email-utils';

interface FooterNewsletterUnsubscribeProps {
  email: string;
  onError: (errorMessage: string, previousEmail: null | string) => void;
  onOptimisticUnsubscribe: () => void;
}

/**
 * Newsletter unsubscribe component shown for authenticated subscribed users.
 *
 * Shows subscription status with a subtle unsubscribe button.
 * Uses optimistic updates - immediately shows subscribe form on click,
 * rolls back with error toast if the action fails.
 */
export const FooterNewsletterUnsubscribe = ({
  email,
  onError,
  onOptimisticUnsubscribe,
}: FooterNewsletterUnsubscribeProps) => {
  const containerTestId = generateTestId('layout', 'app-footer', 'newsletter-unsubscribe');
  const previousEmailRef = useRef<null | string>(email);

  const { executeAsync, isExecuting } = useServerAction(unsubscribeFromNewsletterAction, {
    breadcrumbContext: {
      action: 'newsletter-unsubscribe',
      component: 'footer-newsletter',
    },
    isDisableToast: true,
  });

  const handleUnsubscribe = async () => {
    // Store email before optimistic update
    previousEmailRef.current = email;

    // Optimistically update UI
    onOptimisticUnsubscribe();

    try {
      await executeAsync({ email });
      // Success - UI already shows subscribe form
    } catch (error) {
      // Error - roll back the optimistic update
      const errorMessage = error instanceof Error ? error.message : 'Failed to unsubscribe';
      onError(errorMessage, previousEmailRef.current);
    }
  };

  return (
    <div className={'flex flex-col gap-3'} data-testid={containerTestId}>
      <div className={'flex items-center gap-2'}>
        <CheckCircleIcon aria-hidden className={'size-4 text-green-600 dark:text-green-500'} />
        <span className={'text-sm font-medium text-slate-700 dark:text-slate-300'}>
          You&apos;re subscribed
        </span>
      </div>

      <p className={'text-xs text-slate-500 dark:text-slate-400'}>
        Subscribed as{' '}
        <span className={'font-medium text-slate-600 dark:text-slate-300'}>{maskEmail(email)}</span>
      </p>

      <Button
        className={'w-fit text-xs'}
        disabled={isExecuting}
        onClick={() => void handleUnsubscribe()}
        size={'sm'}
        testId={generateTestId('layout', 'app-footer', 'newsletter-unsubscribe-button')}
        variant={'ghost'}
      >
        {isExecuting ? 'Unsubscribing...' : 'Unsubscribe'}
      </Button>
    </div>
  );
};
