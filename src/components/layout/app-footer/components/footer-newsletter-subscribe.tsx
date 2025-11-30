'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { MailIcon } from 'lucide-react';

import { useAppForm } from '@/components/ui/form';
import { useFocusManagement } from '@/components/ui/form/focus-management/use-focus-management';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { generateTestId } from '@/lib/test-ids';
import { insertNewsletterSignupSchema } from '@/lib/validations/newsletter.validation';
import { cn } from '@/utils/tailwind-utils';

interface FooterNewsletterSubscribeProps {
  isPending: boolean;
  onSubscribe: (email: string) => void;
}

/**
 * Newsletter subscribe form shown in the footer.
 *
 * For public users:
 * - Shows email input + subscribe button
 * - Success toast shown by parent hook on completion
 *
 * For authenticated users:
 * - Shows the same form
 * - Optimistic UI switch to unsubscribe view handled by parent
 */
export const FooterNewsletterSubscribe = withFocusManagement(
  ({ isPending, onSubscribe }: FooterNewsletterSubscribeProps) => {
    const { focusFirstError } = useFocusManagement();

    const form = useAppForm({
      defaultValues: {
        email: '',
      },
      onSubmit: ({ value }) => {
        onSubscribe(value.email);
        form.reset();
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
      <div
        className={'flex flex-col gap-3'}
        data-testid={generateTestId('layout', 'app-footer', 'newsletter-subscribe')}
      >
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
                        'bg-white/50 dark:bg-slate-800/50',
                        'border-slate-200 dark:border-slate-700',
                      )}
                      disabled={isPending}
                      label={''}
                      leftIcon={<MailIcon aria-hidden className={'size-4'} />}
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
