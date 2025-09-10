import type { StandardSchemaV1 } from '@tanstack/react-form';
import type { HookCallbacks, HookSafeActionFn } from 'next-safe-action/hooks';

import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

type UseServerActionOptions = {
  errorMessage?: string;
  successMessage?: string;
};

export const useServerAction = <ServerError, S extends StandardSchemaV1 | undefined, CVE, Data>(
  action: HookSafeActionFn<ServerError, S, CVE, Data>,
  options?: HookCallbacks<ServerError, S, CVE, Data> & UseServerActionOptions,
) => {
  return useAction(action, {
    onError: ({ error }) => {
      toast.error(
        options?.errorMessage || (error.serverError as string) || 'Unexpected error, please try again.',
      );
    },
    onSuccess: () => {
      toast.success(options?.successMessage || 'Action completed successfully.');
    },
    ...options,
  });
};
