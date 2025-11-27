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
    <div className={'flex flex-col items-center gap-4 md:flex-row md:justify-between'}>
      {/* Newsletter Header */}
      <div className={'text-center md:text-left'}>
        <h3 className={'text-lg font-semibold text-white'}>Stay Updated</h3>
        <p className={'text-sm text-orange-100'}>
          Get the latest bobblehead news and updates.
          <br />
          Join our community of collectors today.
        </p>
      </div>

      {/* Newsletter Form */}
      <form className={'flex w-full gap-2 md:w-auto'} onSubmit={handleSubmit}>
        {/* Email Field */}
        <form.AppField name={'email'}>
          {(field) => {
            return (
              <div className={'relative flex-1 md:w-64'}>
                <field.TextField
                  className={`border-white/20 bg-white pr-3 pl-9 text-slate-900
                    placeholder:text-slate-600 dark:placeholder:text-slate-300`}
                  disabled={isExecuting}
                  fieldErrorProps={{
                    className: 'dark:text-white text-white',
                  }}
                  icon={<MailIcon aria-hidden className={'size-4 text-slate-600 dark:text-slate-300'} />}
                  label={''}
                  placeholder={'Enter your email'}
                />
              </div>
            );
          }}
        </form.AppField>

        {/* Submit Button */}
        <Button
          className={`h-9 shrink-0 bg-slate-900 px-4 font-semibold text-white
            hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100`}
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
