'use client';

import type { FormEvent } from 'react';

import { revalidateLogic } from '@tanstack/form-core';
import { MailCheckIcon, MailIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useOptimisticServerAction } from '@/hooks/use-optimistic-server-action';
import { subscribeToNewsletterAction } from '@/lib/actions/newsletter/newsletter.actions';
import { generateTestId } from '@/lib/test-ids';
import { insertNewsletterSignupSchema } from '@/lib/validations/newsletter.validation';

type OptimisticState = {
  email: string;
  isSubscribed: boolean;
};

/**
 * Newsletter subscription form component for the footer
 * Compact design with inline email input and submit button
 * Handles new subscriptions and resubscriptions for users not currently subscribed
 */
export const FooterNewsletterSubscribe = withFocusManagement(() => {
  const { focusFirstError } = useFocusContext();
  const router = useRouter();
  const emailRef = useRef('');

  const { execute, isPending, optimisticState } = useOptimisticServerAction(subscribeToNewsletterAction, {
    breadcrumbContext: {
      action: 'newsletter-subscribe',
      component: 'footer-newsletter-subscribe',
    },
    currentState: { email: '', isSubscribed: false } as OptimisticState,
    onAfterSuccess: () => {
      form.reset();
      router.refresh();
    },
    onUpdate: () => ({ email: emailRef.current, isSubscribed: true }),
  });

  const form = useAppForm({
    canSubmitWhenInvalid: true,
    defaultValues: {
      email: '',
    },
    onSubmit: ({ value }) => {
      emailRef.current = value.email;
      execute(value);
    },
    onSubmitInvalid: ({ formApi }) => {
      focusFirstError(formApi);
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: {
      onSubmit: insertNewsletterSignupSchema,
    },
  });

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      void form.handleSubmit();
    },
    [form],
  );

  // Show optimistic subscribed state
  if (optimisticState.isSubscribed) {
    return (
      <div
        aria-labelledby={'footer-newsletter-heading'}
        className={
          'rounded-lg border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800'
        }
        data-slot={'footer-newsletter-subscribe'}
        data-testid={generateTestId('layout', 'app-footer', 'newsletter-subscribe')}
        role={'region'}
      >
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
            <span className={'font-medium'}>{optimisticState.email}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      aria-labelledby={'footer-newsletter-heading'}
      className={
        'rounded-lg border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800'
      }
      data-slot={'footer-newsletter-subscribe'}
      data-testid={generateTestId('layout', 'app-footer', 'newsletter-subscribe')}
      role={'region'}
    >
      {/* Newsletter Header */}
      <div className={'mb-3'}>
        <h3
          className={'text-sm font-semibold text-slate-700 dark:text-slate-200'}
          id={'footer-newsletter-heading'}
        >
          Stay Updated
        </h3>
        <p className={'text-xs text-slate-600 dark:text-slate-400'}>Get the latest bobblehead news.</p>
      </div>

      {/* Newsletter Form */}
      <form className={'flex gap-2'} onSubmit={handleSubmit}>
        {/* Email Field */}
        <form.AppField name={'email'}>
          {(field) => {
            return (
              <div className={'relative flex-1'}>
                <field.TextField
                  className={`border-slate-300 bg-white pr-3 pl-9 text-slate-900 placeholder:text-slate-500
                    dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400`}
                  disabled={isPending}
                  fieldErrorProps={{
                    className: 'mt-1 text-xs text-red-600 dark:text-red-400',
                  }}
                  icon={<MailIcon aria-hidden className={'size-4 text-slate-500 dark:text-slate-400'} />}
                  isRequired
                  label={'Email Address'}
                  labelClassName={'sr-only'}
                  placeholder={'Enter your email'}
                  testId={'footer-newsletter-email'}
                />
              </div>
            );
          }}
        </form.AppField>

        {/* Submit Button */}
        <form.AppForm>
          <form.SubmitButton
            className={`bg-slate-700 font-semibold text-white hover:bg-slate-800
              dark:bg-slate-600 dark:hover:bg-slate-500`}
            isDisabled={isPending}
            testId={'footer-newsletter-submit'}
          >
            {isPending ? 'Subscribing...' : 'Subscribe'}
          </form.SubmitButton>
        </form.AppForm>
      </form>
    </div>
  );
});
