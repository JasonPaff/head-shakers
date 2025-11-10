'use client';

import { revalidateLogic } from '@tanstack/form-core';

import { useAppForm } from '@/components/ui/form';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useServerAction } from '@/hooks/use-server-action';
import { addToLaunchWaitlistAction } from '@/lib/actions/launch-notifications/public.actions';
import { addToWaitlistSchema } from '@/lib/validations/launch-notification.validations';

export const LaunchWaitlistForm = withFocusManagement(() => {
  const { executeAsync } = useServerAction(addToLaunchWaitlistAction, {
    toastMessages: {
      error: 'Failed to add email to waitlist',
      loading: 'Adding to waitlist...',
      success: "You're on the list! Check your email for confirmation.",
    },
  });

  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      await executeAsync(value);
      form.reset();
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: addToWaitlistSchema,
    },
  });

  return (
    <form
      className={'flex w-full max-w-md flex-col gap-3 sm:flex-row'}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.AppForm>
        <div className={'flex w-full flex-col gap-3 sm:flex-row sm:items-start'}>
          <div className={'flex-1'}>
            <form.AppField name={'email'}>
              {(field) => (
                <field.TextField
                  autoComplete={'email'}
                  label={''}
                  placeholder={'Enter your email'}
                  type={'email'}
                />
              )}
            </form.AppField>
          </div>
          <form.SubmitButton>Notify Me</form.SubmitButton>
        </div>
      </form.AppForm>
    </form>
  );
});
