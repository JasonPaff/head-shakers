'use client';

import type { StandardSchemaV1 } from '@tanstack/react-form';
import type { HookSafeActionFn } from 'next-safe-action/hooks';

import { useOptimisticAction } from 'next-safe-action/hooks';
import { useCallback } from 'react';
import { toast } from 'sonner';

import type { ActionResponse } from '@/lib/utils/action-response';

import { trackServerAction } from '@/lib/utils/sentry-breadcrumbs';

type BreadcrumbContext = {
  /** Name of the action being executed (e.g., 'newsletter-subscribe', 'toggle-like') */
  action: string;
  /** Component initiating the action (e.g., 'footer-newsletter', 'like-button') */
  component: string;
};

type UseOptimisticServerActionOptions<State, T> = {
  /** When provided, automatically tracks action execution with Sentry breadcrumbs */
  breadcrumbContext?: BreadcrumbContext;
  /** The current state used for optimistic updates */
  currentState: State;
  /** Called after error handling completes */
  onAfterError?: () => void;
  /** Called after success handling is complete */
  onAfterSuccess?: (data: T) => void;
  /** Called before error toast is shown */
  onBeforeError?: () => void;
  /** Called before success handling */
  onBeforeSuccess?: (data: T) => void;
  /** Function to calculate the optimistic state before server response */
  onUpdate: (currentState: State) => State;
};

/**
 * Hook for executing server actions with optimistic updates.
 *
 * Unlike `useServerAction`, this hook relies on the visual UI state change
 * as user feedback rather than loading/success toasts. Error toasts are still
 * shown when rollback occurs so users know something went wrong.
 *
 * Features:
 * - Optimistic state updates (instant UI feedback)
 * - Automatic rollback on error
 * - Sentry breadcrumb tracking
 * - Error toast only (no loading/success toasts)
 * - ActionResponse unwrapping
 *
 * @example
 * const { execute, isPending, optimisticState } = useOptimisticServerAction(myAction, {
 *   breadcrumbContext: { action: 'toggle-subscription', component: 'newsletter' },
 *   currentState: { isSubscribed: false },
 *   onUpdate: (state) => ({ isSubscribed: !state.isSubscribed }),
 *   onAfterSuccess: (data) => {
 *     router.refresh();
 *   },
 * });
 */
export const useOptimisticServerAction = <S extends StandardSchemaV1 | undefined, CVE, T, State>(
  action: HookSafeActionFn<string, S, CVE, ActionResponse<T>>,
  options: UseOptimisticServerActionOptions<State, T>,
) => {
  const {
    breadcrumbContext,
    currentState,
    onAfterError,
    onAfterSuccess,
    onBeforeError,
    onBeforeSuccess,
    onUpdate,
  } = options;

  const {
    execute: originalExecute,
    isPending,
    optimisticState,
  } = useOptimisticAction(action, {
    currentState,
    onError: (args: { error: { serverError?: string; validationErrors?: unknown } }) => {
      // Track error with Sentry
      if (breadcrumbContext) {
        trackServerAction(breadcrumbContext.action, 'error', breadcrumbContext.component);
      }

      // Show error toast (rollback happens automatically via useOptimisticAction)
      onBeforeError?.();
      const errorMessage = args.error.serverError || 'Something went wrong. Please try again.';
      toast.error(errorMessage);
      onAfterError?.();
    },
    onExecute: () => {
      // Track action start with Sentry
      if (breadcrumbContext) {
        trackServerAction(breadcrumbContext.action, 'started', breadcrumbContext.component);
      }
    },
    onSuccess: (args: { data?: ActionResponse<T> }) => {
      // Handle ActionResponse failures (wasSuccess: false)
      if (args.data && !args.data.wasSuccess) {
        if (breadcrumbContext) {
          trackServerAction(breadcrumbContext.action, 'error', breadcrumbContext.component);
        }
        onBeforeError?.();
        toast.error(args.data.message || 'Something went wrong. Please try again.');
        onAfterError?.();
        return;
      }

      // Track success with Sentry (no toast - UI change is feedback)
      if (breadcrumbContext) {
        trackServerAction(breadcrumbContext.action, 'success', breadcrumbContext.component);
      }

      // Call success callbacks with unwrapped data
      if (args.data?.wasSuccess) {
        onBeforeSuccess?.(args.data.data);
        onAfterSuccess?.(args.data.data);
      }
    },
    updateFn: onUpdate,
  });

  const execute = useCallback(
    (input: Parameters<typeof originalExecute>[0]) => {
      originalExecute(input);
    },
    [originalExecute],
  );

  return {
    execute,
    isPending,
    optimisticState,
  };
};
