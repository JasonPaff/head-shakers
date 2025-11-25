'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { MailIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { Input } from '@/components/ui/input';
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
  const handleSubmit = (e: React.FormEvent) => {
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
            const _hasErrors = field.state.meta.errors.length > 0;
            // Extract error message - errors are Zod validation results with message property
            const firstError = field.state.meta.errors[0] as undefined | { message?: string };
            const errorMessage = firstError?.message ?? '';

            return (
              <div className={'relative flex-1'}>
                <Input
                  aria-invalid={_hasErrors}
                  aria-label={'Email address'}
                  className={'h-9 pr-3 pl-9 text-sm'}
                  disabled={isExecuting}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={'Enter your email'}
                  testId={'footer-newsletter-email'}
                  type={'email'}
                  value={field.state.value}
                />
                <MailIcon
                  aria-hidden
                  className={'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'}
                />
                {/* Error Message */}
                {_hasErrors && errorMessage && (
                  <p
                    className={'absolute -bottom-5 left-0 text-xs text-destructive'}
                    data-testid={'footer-newsletter-error'}
                  >
                    {errorMessage}
                  </p>
                )}
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
