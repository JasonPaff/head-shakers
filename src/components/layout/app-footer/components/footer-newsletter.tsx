'use client';

import type { FormEvent } from 'react';

import { revalidateLogic } from '@tanstack/form-core';
import { MailIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useServerAction } from '@/hooks/use-server-action';
import { subscribeToNewsletterAction } from '@/lib/actions/newsletter/newsletter.actions';
import { newsletterSignupSchema } from '@/lib/validations/newsletter.validation';

/**
 * Newsletter signup form component for the footer
 * Compact design with inline email input and submit button
 */
export const FooterNewsletter = withFocusManagement(() => {
  const { focusFirstError } = useFocusContext();

  // Setup server action with toast messages
  const { executeAsync, isExecuting } = useServerAction(subscribeToNewsletterAction, {
    onSuccess: () => {
      // Reset form on success
      form.reset();
    },
    toastMessages: {
      error: 'Failed to subscribe. Please try again.',
      loading: 'Subscribing...',
      success: 'Thanks for subscribing!',
    },
  });

  // Setup form with useAppForm
  const form = useAppForm({
    canSubmitWhenInvalid: true,
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      await executeAsync(value);
    },
    onSubmitInvalid: ({ formApi }) => {
      focusFirstError(formApi);
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: {
      onSubmit: newsletterSignupSchema,
    },
  });

  // Form submission handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <div className={'space-y-3'}>
      {/* Newsletter Header */}
      <div className={'space-y-1'}>
        <h3 className={'text-sm font-semibold text-foreground'}>Stay Updated</h3>
        <p className={'text-xs text-muted-foreground'}>Get the latest bobblehead news and updates.</p>
      </div>

      {/* Newsletter Form */}
      <form className={'flex gap-2'} onSubmit={handleSubmit}>
        {/* Email Field */}
        <form.AppField name={'email'}>
          {(field) => {
            return (
              <div className={'relative flex-1'}>
                <field.TextField
                  className={'pr-3 pl-9'}
                  disabled={isExecuting}
                  icon={<MailIcon aria-hidden className={'size-4'} />}
                  label={''}
                  placeholder={'Enter your email'}
                />
              </div>
            );
          }}
        </form.AppField>

        {/* Submit Button */}
        <Button
          className={'h-9 shrink-0 px-4'}
          disabled={isExecuting}
          testId={'footer-newsletter-submit'}
          type={'submit'}
        >
          {isExecuting ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
    </div>
  );
});
