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
 * - Loading/success/error toast notifications
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

      // Show loading toast unless disabled
      const toastId = isDisableToast ? undefined : toast.loading(loadingMessage || 'Processing...');

      // Track action start
      if (breadcrumbContext) {
        trackServerAction(breadcrumbContext.action, 'started', breadcrumbContext.component);
      }

      try {
        const result = await originalExecuteAsync(input);

        // Handle validation errors (schema validation failed before action ran)
        if (result?.validationErrors && Object.keys(result.validationErrors).length > 0) {
          const validationMessage =
            options?.onValidationError?.(result.validationErrors as ValidationErrors) ??
            extractFirstValidationError(result.validationErrors as ValidationErrors);

          if (breadcrumbContext) {
            trackServerAction(breadcrumbContext.action, 'error', breadcrumbContext.component);
          }

          if (toastId) {
            toast.error(validationMessage, { id: toastId });
          }

          throw new Error(validationMessage);
        }

        // Handle undefined result.data (unexpected error - action threw)
        if (!result?.data) {
          const errorMessage = 'An unexpected error occurred. Please try again.';

          if (breadcrumbContext) {
            trackServerAction(breadcrumbContext.action, 'error', breadcrumbContext.component);
          }

          if (toastId) {
            toast.error(errorMessage, { id: toastId });
          }

          throw new Error(errorMessage);
        }

        // Handle ActionResponse with wasSuccess: false
        if (!result.data.wasSuccess) {
          options?.onBeforeError?.();

          if (breadcrumbContext) {
            trackServerAction(breadcrumbContext.action, 'error', breadcrumbContext.component);
          }

          if (toastId) {
            toast.error(result.data.message, { id: toastId });
          }

          options?.onAfterError?.();

          throw new Error(result.data.message);
        }

        // Handle ActionResponse with wasSuccess: true
        options?.onBeforeSuccess?.(result.data.data);

        if (breadcrumbContext) {
          trackServerAction(breadcrumbContext.action, 'success', breadcrumbContext.component);
        }

        if (toastId) {
          const successMessage = result.data.message || 'Action completed successfully.';
          toast.success(successMessage, { id: toastId });
        }

        options?.onAfterSuccess?.(result.data.data);

        return result.data.data;
      } catch (error) {
        // Re-throw errors we created above
        if (error instanceof Error) {
          throw error;
        }

        // Handle unexpected errors during execution
        const errorMessage = 'An unexpected error occurred. Please try again.';

        if (breadcrumbContext) {
          trackServerAction(breadcrumbContext.action, 'error', breadcrumbContext.component);
        }

        if (toastId) {
          toast.error(errorMessage, { id: toastId });
        }

        throw new Error(errorMessage);
      }
    },
    [originalExecuteAsync, options],
  );

  return {
    ...rest,
    executeAsync,
  };
};
