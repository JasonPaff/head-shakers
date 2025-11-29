'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { useStore } from '@tanstack/react-form';
import { Check, Loader2, X } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';

import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useServerAction } from '@/hooks/use-server-action';
import { checkUsernameAvailabilityAction, updateUsernameAction } from '@/lib/actions/users/username.actions';
import { CONFIG } from '@/lib/constants/config';
import { updateUsernameSchema } from '@/lib/validations/users.validation';
import { cn } from '@/utils/tailwind-utils';

type AvailabilityState = 'available' | 'checking' | 'idle' | 'taken';

interface UsernameEditFormProps {
  canChange: boolean;
  currentUsername: string;
  daysUntilChange?: number;
  onSuccess?: () => void;
}

export const UsernameEditForm = withFocusManagement<UsernameEditFormProps>(
  ({ canChange, currentUsername, daysUntilChange, onSuccess }) => {
    const { focusFirstError } = useFocusContext();
    const [availabilityState, setAvailabilityState] = useState<AvailabilityState>('idle');
    const [debouncedUsername, setDebouncedUsername] = useState('');

    // Server action for checking availability
    const {
      execute: checkAvailability,
      isExecuting: isCheckingAvailability,
      result: availabilityResult,
    } = useServerAction(checkUsernameAvailabilityAction, {
      isDisableToast: true, // Don't show toast for availability checks
    });

    // Server action for updating username
    const { executeAsync: updateUsername, isExecuting } = useServerAction(updateUsernameAction, {
      loadingMessage: 'Updating username...',
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        }
      },
    });

    const form = useAppForm({
      canSubmitWhenInvalid: true,
      defaultValues: {
        username: currentUsername,
      },
      onSubmit: async ({ value }) => {
        await updateUsername(value);
      },
      onSubmitInvalid: ({ formApi }) => {
        focusFirstError(formApi);
      },
      validationLogic: revalidateLogic({
        mode: 'blur',
        modeAfterSubmission: 'change',
      }),
      validators: {
        onSubmit: updateUsernameSchema,
      },
    });

    // Get current username value from form
    const currentFormUsername = useStore(form.store, (state) => state.values.username) || '';

    // Debounce username input for availability checking
    useEffect(() => {
      if (!currentFormUsername || currentFormUsername === currentUsername) {
        setAvailabilityState('idle');
        return;
      }

      setAvailabilityState('checking');

      const handler = setTimeout(() => {
        setDebouncedUsername(currentFormUsername.trim());
      }, CONFIG.SEARCH.DEBOUNCE_MS);

      return () => {
        clearTimeout(handler);
      };
    }, [currentFormUsername, currentUsername]);

    // Check availability when debounced value changes
    useEffect(() => {
      if (!debouncedUsername || debouncedUsername === currentUsername) {
        setAvailabilityState('idle');
        return;
      }

      // Trigger availability check
      checkAvailability({ username: debouncedUsername });
    }, [debouncedUsername, currentUsername, checkAvailability]);

    // Update availability state when result changes
    useEffect(() => {
      if (isCheckingAvailability) {
        setAvailabilityState('checking');
        return;
      }

      if (!availabilityResult) {
        return;
      }

      if (availabilityResult.data?.data?.available) setAvailabilityState('available');
      else setAvailabilityState('taken');
    }, [availabilityResult, isCheckingAvailability]);

    // Render availability indicator
    const renderAvailabilityIndicator = () => {
      if (availabilityState === 'idle' || !currentFormUsername || currentFormUsername === currentUsername) {
        return null;
      }

      if (availabilityState === 'checking') {
        return (
          <div className={'flex items-center gap-2 text-sm text-muted-foreground'}>
            <Loader2 className={'h-4 w-4 animate-spin'} />
            <span>Checking availability...</span>
          </div>
        );
      }

      if (availabilityState === 'available') {
        return (
          <div className={'flex items-center gap-2 text-sm text-green-600'}>
            <Check className={'h-4 w-4'} />
            <span>Username is available</span>
          </div>
        );
      }

      if (availabilityState === 'taken') {
        return (
          <div className={'flex items-center gap-2 text-sm text-destructive'}>
            <X className={'h-4 w-4'} />
            <span>Username is taken or reserved</span>
          </div>
        );
      }

      return null;
    };

    // Check if form can be submitted
    const isFormDisabled = !canChange || isExecuting || availabilityState === 'checking';
    const isUsernameUnchanged = currentFormUsername === currentUsername;
    const shouldShowCooldownWarning = !canChange && daysUntilChange !== undefined && daysUntilChange > 0;

    return (
      <div className={'space-y-4'} data-testid={'username-edit-form'}>
        {/* Cooldown warning */}
        {shouldShowCooldownWarning && (
          <div
            className={cn(
              'rounded-lg border border-amber-200 bg-amber-50 p-4',
              'text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
            )}
            data-testid={'username-cooldown-warning'}
          >
            You can change your username again in {daysUntilChange} {daysUntilChange === 1 ? 'day' : 'days'}.
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className={'space-y-4'}>
            {/* Username field */}
            <form.AppField name={'username'}>
              {(field) => (
                <div className={'space-y-2'}>
                  <field.TextField
                    description={'Choose a unique username. You can only change it once every 90 days.'}
                    disabled={!canChange || isExecuting}
                    isRequired
                    label={'Username'}
                    placeholder={'Enter your username'}
                  />
                  {/* Availability indicator */}
                  {renderAvailabilityIndicator()}
                </div>
              )}
            </form.AppField>

            {/* Submit button */}
            <div className={'flex justify-end'}>
              <button
                className={cn(
                  'inline-flex items-center justify-center rounded-md px-4 py-2',
                  'bg-primary text-sm font-medium text-primary-foreground',
                  'transition-colors hover:bg-primary/90',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  'disabled:pointer-events-none disabled:opacity-50',
                )}
                data-testid={'username-submit-button'}
                disabled={isFormDisabled || isUsernameUnchanged}
                type={'submit'}
              >
                {isExecuting ?
                  <Fragment>
                    <Loader2 className={'mr-2 h-4 w-4 animate-spin'} />
                    Updating...
                  </Fragment>
                : 'Update Username'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  },
);

UsernameEditForm.displayName = 'UsernameEditForm';
