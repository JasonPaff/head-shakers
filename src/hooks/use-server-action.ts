'use client';

import type { StandardSchemaV1 } from '@tanstack/react-form';
import type { HookCallbacks, HookSafeActionFn } from 'next-safe-action/hooks';

import { useAction } from 'next-safe-action/hooks';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { trackServerAction } from '@/lib/utils/sentry-breadcrumbs';

type BreadcrumbContext = {
  /** Name of the action being executed (e.g., 'newsletter-subscribe', 'update-bobblehead') */
  action: string;
  /** Component initiating the action (e.g., 'footer-newsletter', 'edit-form') */
  component: string;
};

type ToastMessages = {
  error?: ((error: unknown) => string) | string;
  loading?: string;
  success?: ((data: unknown) => string) | string;
};

type UseServerActionOptions = {
  /** When provided, automatically tracks action execution with Sentry breadcrumbs */
  breadcrumbContext?: BreadcrumbContext;
  isDisableToast?: boolean;
  onAfterError?: () => void;
  onAfterSuccess?: () => void;
  onBeforeError?: () => void;
  onBeforeSuccess?: () => void;
  toastMessages?: ToastMessages;
};

export const useServerAction = <ServerError, S extends StandardSchemaV1 | undefined, CVE, Data>(
  action: HookSafeActionFn<ServerError, S, CVE, Data>,
  options?: HookCallbacks<ServerError, S, CVE, Data> & UseServerActionOptions,
) => {
  const { executeAsync: originalExecuteAsync, ...rest } = useAction(action, options);

  const executeAsync = useCallback(
    async (input: Parameters<typeof originalExecuteAsync>[0]) => {
      const { breadcrumbContext } = options ?? {};

      // Track action start if breadcrumb context is provided
      if (breadcrumbContext) {
        trackServerAction(breadcrumbContext.action, 'started', breadcrumbContext.component);
      }

      if (options?.isDisableToast) {
        try {
          const result = await originalExecuteAsync(input);
          if (breadcrumbContext) {
            trackServerAction(breadcrumbContext.action, 'success', breadcrumbContext.component);
          }
          return result;
        } catch (error) {
          if (breadcrumbContext) {
            trackServerAction(breadcrumbContext.action, 'error', breadcrumbContext.component);
          }
          throw error;
        }
      }

      return toast.promise(
        originalExecuteAsync(input).then((result) => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          if (result?.serverError) throw result;
          return result;
        }),
        {
          error: (error) => {
            options?.onBeforeError?.();

            // Track action error
            if (breadcrumbContext) {
              trackServerAction(breadcrumbContext.action, 'error', breadcrumbContext.component);
            }

            const message =
              typeof options?.toastMessages?.error === 'function' ?
                options.toastMessages.error(error)
              : options?.toastMessages?.error ||
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (error?.serverError as string) ||
                'Unexpected error, please try again.';

            options?.onAfterError?.();
            return message;
          },
          loading: options?.toastMessages?.loading || 'Processing...',
          success: (data) => {
            options?.onBeforeSuccess?.();
            // Track action success
            if (breadcrumbContext) {
              trackServerAction(breadcrumbContext.action, 'success', breadcrumbContext.component);
            }
            const message =
              typeof options?.toastMessages?.success === 'function' ?
                options?.toastMessages.success(data)
              : options?.toastMessages?.success;
            options?.onAfterSuccess?.();
            return message || 'Action completed successfully.';
          },
        },
      );
    },
    [originalExecuteAsync, options],
  );

  return {
    ...rest,
    executeAsync,
  };
};
