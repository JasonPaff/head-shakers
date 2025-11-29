'use client';

import type { StandardSchemaV1 } from '@tanstack/react-form';
import type { HookCallbacks, HookSafeActionFn } from 'next-safe-action/hooks';

import { useAction } from 'next-safe-action/hooks';
import { useCallback } from 'react';
import { toast } from 'sonner';

import type { ActionResponse } from '@/lib/utils/action-response';

import { trackServerAction } from '@/lib/utils/sentry-breadcrumbs';

type BreadcrumbContext = {
  /** Name of the action being executed (e.g., 'newsletter-subscribe', 'update-bobblehead') */
  action: string;
  /** Component initiating the action (e.g., 'footer-newsletter', 'edit-form') */
  component: string;
};

type UseServerActionOptions<T> = {
  /** When provided, automatically tracks action execution with Sentry breadcrumbs */
  breadcrumbContext?: BreadcrumbContext;
  /** Disable toast notifications entirely */
  isDisableToast?: boolean;
  /** Loading message shown during execution */
  loadingMessage?: string;
  /** Called after error handling completes */
  onAfterError?: () => void;
  /** Called after success handling is complete */
  onAfterSuccess?: (data: T) => void;
  /** Called before error toast is shown */
  onBeforeError?: () => void;
  /** Called before success toast is shown */
  onBeforeSuccess?: (data: T) => void;
  /** Custom handler for validation errors. Return string to customize message */
  onValidationError?: (errors: ValidationErrors) => string | void;
};

type ValidationErrors = Record<string, { _errors: Array<string> }> & { _errors?: Array<string> };

/**
 * Extracts the first validation error message from next-safe-action's validation errors.
 * Checks global errors first, then field-specific errors.
 */
function extractFirstValidationError(errors: ValidationErrors): string {
  const defaultMessage = 'Please check your input and try again.';

  // Check for global errors first
  if (errors._errors && errors._errors.length > 0) {
    return errors._errors[0] ?? defaultMessage;
  }

  // Find the first field with errors
  for (const key of Object.keys(errors)) {
    if (key !== '_errors') {
      const fieldErrors = errors[key] as undefined | { _errors?: Array<string> };
      if (fieldErrors?._errors && fieldErrors._errors.length > 0) {
        return fieldErrors._errors[0] ?? defaultMessage;
      }
    }
  }

  return defaultMessage;
}

/**
 * Hook for executing server actions that return ActionResponse<T>.
 *
 * Automatically handles:
 * - Loading/success/error toast notifications with smooth transitions
 * - Sentry breadcrumb tracking
 * - Validation error extraction
 * - ActionResponse unwrapping
 *
 * @example
 * const { executeAsync, isExecuting } = useServerAction(myAction, {
 *   loadingMessage: 'Saving...',
 *   onAfterSuccess: (data) => {
 *     console.log('Saved:', data);
 *   },
 * });
 *
 * const result = await executeAsync(input); // result is T | undefined
 */
export const useServerAction = <ServerError, S extends StandardSchemaV1 | undefined, CVE, T>(
  action: HookSafeActionFn<ServerError, S, CVE, ActionResponse<T>>,
  options?: HookCallbacks<ServerError, S, CVE, ActionResponse<T>> & UseServerActionOptions<T>,
) => {
  const { executeAsync: originalExecuteAsync, ...rest } = useAction(action, options);

  const executeAsync = useCallback(
    async (input: Parameters<typeof originalExecuteAsync>[0]): Promise<T | undefined> => {
      const { breadcrumbContext, isDisableToast, loadingMessage } = options ?? {};

      // Track action start
      if (breadcrumbContext) {
        trackServerAction(breadcrumbContext.action, 'started', breadcrumbContext.component);
      }

      // Create promise that throws for error cases (enables toast.promise error handling)
      const actionPromise = (async () => {
        const result = await originalExecuteAsync(input);

        // Handle validation errors - throw to trigger error toast
        if (result?.validationErrors && Object.keys(result.validationErrors).length > 0) {
          const message =
            options?.onValidationError?.(result.validationErrors) ??
            extractFirstValidationError(result.validationErrors);

          if (breadcrumbContext) {
            trackServerAction(breadcrumbContext.action, 'error', breadcrumbContext.component);
          }

          throw new Error(message);
        }

        // Handle undefined data - throw to trigger error toast
        if (!result?.data) {
          if (breadcrumbContext) {
            trackServerAction(breadcrumbContext.action, 'error', breadcrumbContext.component);
          }

          throw new Error('An unexpected error occurred. Please try again.');
        }

        // Handle business failure - throw to trigger error toast
        if (!result.data.wasSuccess) {
          if (breadcrumbContext) {
            trackServerAction(breadcrumbContext.action, 'error', breadcrumbContext.component);
          }

          throw new Error(result.data.message);
        }

        // Success - track and return
        if (breadcrumbContext) {
          trackServerAction(breadcrumbContext.action, 'success', breadcrumbContext.component);
        }

        return result.data;
      })();

      // Handle without toasts
      if (isDisableToast) {
        try {
          const actionResult = await actionPromise;
          options?.onBeforeSuccess?.(actionResult.data);
          options?.onAfterSuccess?.(actionResult.data);
          return actionResult.data;
        } catch (error) {
          options?.onBeforeError?.();
          options?.onAfterError?.();
          throw error;
        }
      }

      // Use toast.promise for smooth loading→success/error transitions
      const toastResult = toast.promise(actionPromise, {
        error: (err: unknown) => {
          options?.onBeforeError?.();
          return err instanceof Error ? err.message : 'An unexpected error occurred.';
        },
        loading: loadingMessage || 'Processing...',
        success: (actionResult) => {
          options?.onBeforeSuccess?.(actionResult.data);
          return actionResult.message || 'Action completed successfully.';
        },
      });

      // Unwrap the toast promise to get the actual result
      return toastResult
        .unwrap()
        .then((actionResult) => {
          options?.onAfterSuccess?.(actionResult.data);
          return actionResult.data;
        })
        .catch((err: unknown) => {
          options?.onAfterError?.();
          throw err;
        });
    },
    [originalExecuteAsync, options],
  );

  return {
    ...rest,
    executeAsync,
  };
};
