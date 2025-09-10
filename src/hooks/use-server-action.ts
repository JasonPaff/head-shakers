'use client';

import type { StandardSchemaV1 } from '@tanstack/react-form';
import type { HookCallbacks, HookSafeActionFn } from 'next-safe-action/hooks';

import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

type UseServerActionOptions = {
  errorMessage?: string;
  onAfterError?: () => void;
  onAfterSuccess?: () => void;
  onBeforeError?: () => void;
  onBeforeSuccess?: () => void;
  successMessage?: string;
};

export const useServerAction = <ServerError, S extends StandardSchemaV1 | undefined, CVE, Data>(
  action: HookSafeActionFn<ServerError, S, CVE, Data>,
  options?: HookCallbacks<ServerError, S, CVE, Data> & UseServerActionOptions,
) => {
  return useAction(action, {
    onError: ({ error }) => {
      options?.onBeforeError?.();
      toast.error(
        options?.errorMessage || (error.serverError as string) || 'Unexpected error, please try again.',
      );
      options?.onAfterError?.();
    },
    onSuccess: () => {
      options?.onBeforeSuccess?.();
      toast.success(options?.successMessage || 'Action completed successfully.');
      options?.onAfterSuccess?.();
    },
    ...options,
  });
};
