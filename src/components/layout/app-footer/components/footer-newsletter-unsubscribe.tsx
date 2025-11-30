'use client';

import { CheckCircleIcon } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToggle } from '@/hooks/use-toggle';
import { generateTestId } from '@/lib/test-ids';
import { maskEmail } from '@/lib/utils/email-utils';

interface FooterNewsletterUnsubscribeProps {
  email: string;
  isPending: boolean;
  onUnsubscribe: () => void;
}

/**
 * Newsletter unsubscribe component shown for authenticated subscribed users.
 *
 * Shows subscription status with a confirmation dialog for unsubscribing.
 * Optimistic updates are handled by the parent hook - UI immediately
 * switches to subscribe form on confirm, with automatic rollback on error.
 */
export const FooterNewsletterUnsubscribe = ({
  email,
  isPending,
  onUnsubscribe,
}: FooterNewsletterUnsubscribeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useToggle();

  const handleUnsubscribe = () => {
    setIsDialogOpen.off();
    onUnsubscribe();
  };

  return (
    <div
      className={'flex flex-col gap-3'}
      data-testid={generateTestId('layout', 'app-footer', 'newsletter-unsubscribe')}
    >
      <div className={'flex items-center gap-2'}>
        <CheckCircleIcon aria-hidden className={'size-4 text-green-600 dark:text-green-500'} />
        <span className={'text-sm font-medium text-slate-700 dark:text-slate-300'}>
          Subscribed to our newsletter
        </span>
      </div>

      <p className={'text-xs text-slate-500 dark:text-slate-400'}>
        You&apos;ll receive updates on new bobbleheads, collector tips, and community news at{' '}
        <span className={'font-medium text-slate-600 dark:text-slate-300'}>{maskEmail(email)}</span>
      </p>

      <AlertDialog
        onOpenChange={setIsDialogOpen.update}
        open={isDialogOpen}
        trackingName={'newsletter-unsubscribe'}
      >
        <AlertDialogTrigger asChild>
          <Button
            className={'w-fit text-xs'}
            disabled={isPending}
            size={'sm'}
            testId={generateTestId('layout', 'app-footer', 'newsletter-unsubscribe-button')}
            variant={'ghost'}
          >
            {isPending ? 'Unsubscribing...' : 'Unsubscribe'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent testId={generateTestId('layout', 'app-footer', 'newsletter-unsubscribe-dialog')}>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsubscribe from newsletter?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unsubscribe? You will no longer receive updates about new bobbleheads,
              collector tips, and community news.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnsubscribe}>Unsubscribe</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
