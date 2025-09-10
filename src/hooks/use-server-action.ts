'use client';

import type { StandardSchemaV1 } from '@tanstack/react-form';
import type { HookCallbacks, HookSafeActionFn } from 'next-safe-action/hooks';

import { useAction } from 'next-safe-action/hooks';
import { useCallback } from 'react';
import { toast } from 'sonner';

type ToastMessages = {
  error?: ((error: unknown) => string) | string;
  loading?: string;
  success?: ((data: unknown) => string) | string;
};

type UseServerActionOptions = {
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
  const { executeAsync: originalExecuteAsync, ...rest } = useAction(action, {
    ...options,
    onError: undefined,
    onExecute: undefined,
    onSuccess: undefined,
  });

  const executeAsync = useCallback(
    async (input: Parameters<typeof originalExecuteAsync>[0]) => {
      if (options?.isDisableToast) {
        return originalExecuteAsync(input);
      }

      return toast.promise(originalExecuteAsync(input), {
        error: (error) => {
          options?.onBeforeError?.();
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
          const message =
            typeof options?.toastMessages?.success === 'function' ?
              options?.toastMessages.success(data)
            : options?.toastMessages?.success;
          options?.onAfterSuccess?.();
          return message || 'Action completed successfully.';
        },
      });
    },
    [originalExecuteAsync, options],
  );

  return {
    ...rest,
    executeAsync,
  };
};
