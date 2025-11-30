'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { MailIcon } from 'lucide-react';

import { useAppForm } from '@/components/ui/form';
import { useFocusManagement } from '@/components/ui/form/focus-management/use-focus-management';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useServerAction } from '@/hooks/use-server-action';
import { subscribeToNewsletterAction } from '@/lib/actions/newsletter/newsletter.actions';
import { generateTestId } from '@/lib/test-ids';
import { insertNewsletterSignupSchema } from '@/lib/validations/newsletter.validation';
import { cn } from '@/utils/tailwind-utils';

interface FooterNewsletterSubscribeProps {
  isAuthenticated: boolean;
  onError: (errorMessage: string) => void;
  onOptimisticSubscribe: (email: string) => void;
}

/**
 * Newsletter subscribe form shown in the footer.
 *
 * For public users:
 * - Shows email input + subscribe button
 * - Displays success toast on successful subscription
 *
 * For authenticated users:
 * - Shows the same form (allows subscribing with any email)
 * - Optimistically updates UI via onOptimisticSubscribe callback
 * - No success toast (optimistic UI is the feedback)
 * - Error toast via onError callback on failure
 */
export const FooterNewsletterSubscribe = withFocusManagement(
  ({ isAuthenticated, onError, onOptimisticSubscribe }: FooterNewsletterSubscribeProps) => {
    const { focusFirstError } = useFocusManagement();
    const containerTestId = generateTestId('layout', 'app-footer', 'newsletter-subscribe');

    // For public users: show toasts
    // For authenticated users: disable toasts, use optimistic updates
    const { executeAsync, isExecuting } = useServerAction(subscribeToNewsletterAction, {
      breadcrumbContext: {
        action: 'newsletter-subscribe',
        component: 'footer-newsletter',
      },
      isDisableToast: isAuthenticated,
      loadingMessage: 'Subscribing to newsletter...',
    });

    const form = useAppForm({
      defaultValues: {
        email: '',
      },
      onSubmit: async ({ value }) => {
        const email = value.email;

        if (isAuthenticated) {
          // Optimistically update UI for authenticated users
          onOptimisticSubscribe(email);

          try {
            await executeAsync(value);
            // Success - UI already shows unsubscribe view
            form.reset();
          } catch (error) {
            // Error - roll back the optimistic update
            const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe';
            onError(errorMessage);
          }
        } else {
          // Public users - let the toast handle success/error
          try {
            await executeAsync(value);
            form.reset();
          } catch {
            // Error toast already shown by useServerAction
          }
        }
      },
      onSubmitInvalid: ({ formApi }) => {
        focusFirstError(formApi);
      },
      validationLogic: revalidateLogic(),
      validators: {
        onSubmit: insertNewsletterSignupSchema,
      },
    });

    return (
      <div className={'flex flex-col gap-3'} data-testid={containerTestId}>
        <div className={'flex flex-col gap-1'}>
          <h4 className={'text-sm font-semibold text-slate-800 dark:text-slate-200'}>Stay Updated</h4>
          <p className={'text-xs text-slate-500 dark:text-slate-400'}>
            Get the latest bobblehead news and updates.
          </p>
        </div>

        <form
          className={'flex flex-col gap-2 sm:flex-row'}
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.AppForm>
            <div className={'flex flex-1 flex-col gap-2 sm:flex-row sm:items-start'}>
              <div className={'flex-1'}>
                <form.AppField name={'email'}>
                  {(field) => (
                    <field.TextField
                      autoComplete={'email'}
                      className={cn(
                        'h-9 text-sm',
                        'bg-white/50 dark:bg-slate-800/50',
                        'border-slate-200 dark:border-slate-700',
                      )}
                      disabled={isExecuting}
                      icon={<MailIcon className={'size-4'} />}
                      label={''}
                      placeholder={'Enter your email'}
                      testId={generateTestId('layout', 'app-footer', 'newsletter-email-input')}
                      type={'email'}
                    />
                  )}
                </form.AppField>
              </div>
              <form.SubmitButton
                className={'h-9 text-sm'}
                testId={generateTestId('layout', 'app-footer', 'newsletter-subscribe-button')}
              >
                Subscribe
              </form.SubmitButton>
            </div>
          </form.AppForm>
        </form>
      </div>
    );
  },
);
