'use client';

import type { StandardSchemaV1 } from '@tanstack/react-form';
import type { HookSafeActionFn } from 'next-safe-action/hooks';

import { useOptimisticAction } from 'next-safe-action/hooks';
import { useCallback } from 'react';
import { toast } from 'sonner';

import type { ActionResponse } from '@/lib/utils/action-response';

import { trackServerAction } from '@/lib/utils/sentry-breadcrumbs';

type BreadcrumbContext = {
  /** Name of the action being executed (e.g., 'toggle-like', 'follow-user') */
  action: string;
  /** Component initiating the action (e.g., 'like-button', 'follow-button') */
  component: string;
};

type UseOptimisticServerActionOptions<T, State, Input> = {
  /** When provided, automatically tracks action execution with Sentry breadcrumbs */
  breadcrumbContext?: BreadcrumbContext;
  /** The current state to use for optimistic updates (typically from parent or local state) */
  currentState: State;
  /** Called after error handling completes (state has already rolled back) */
  onAfterError?: (rolledBackState: State) => void;
  /** Called after success handling is complete with unwrapped data */
  onAfterSuccess?: (data: T, newState: State) => void;
  /** Called before error toast is shown */
  onBeforeError?: () => void;
  /** Called before success handling */
  onBeforeSuccess?: (data: T) => void;
  /** Called when action starts executing */
  onExecute?: (input: Input) => void;
  /** Called when action settles (success or error) */
  onSettled?: () => void;
  /**
   * Function to compute the optimistic state from current state and input.
   * Called immediately when execute is called, before server responds.
   */
  onUpdate: (state: State, input: Input) => State;
  /** Show error toast on rollback. Defaults to true */
  shouldShowErrorToast?: boolean;
};

/**
 * Hook for executing server actions with optimistic updates.
 *
 * Automatically handles:
 * - Immediate optimistic UI updates via updateFn
 * - Automatic rollback on error
 * - Sentry breadcrumb tracking
 * - ActionResponse unwrapping
 * - Error toast notifications on rollback
 *
 * Use this for mutations where you can predict the result:
 * - Toggle operations (like/unlike, follow/unfollow)
 * - Add/remove from lists
 * - Counter increments/decrements
 * - Status toggles
 *
 * For mutations that need server-generated data or complex validation,
 * use useServerAction instead.
 *
 * @example
 * const { execute, optimisticState, isPending } = useOptimisticServerAction(
 *   toggleFollowAction,
 *   {
 *     currentState: { isFollowing, followerCount },
 *     onUpdate: (state) => ({
 *       isFollowing: !state.isFollowing,
 *       followerCount: state.isFollowing
 *         ? state.followerCount - 1
 *         : state.followerCount + 1,
 *     }),
 *     onAfterSuccess: (data, state) => {
 *       // Persist the confirmed state
 *       setPersistedState(state);
 *     },
 *   }
 * );
 *
 * // UI renders from optimisticState for instant feedback
 * <Button onClick={() => execute({ userId })}>
 *   {optimisticState.isFollowing ? 'Unfollow' : 'Follow'}
 * </Button>
 */
export const useOptimisticServerAction = <
  ServerError,
  S extends StandardSchemaV1 | undefined,
  CVE,
  T,
  State,
  Input = unknown,
>(
  action: HookSafeActionFn<ServerError, S, CVE, ActionResponse<T>>,
  options: UseOptimisticServerActionOptions<T, State, Input>,
) => {
  const {
    breadcrumbContext,
    currentState,
    onAfterError,
    onAfterSuccess,
    onBeforeError,
    onBeforeSuccess,
    onExecute,
    onSettled,
    onUpdate,
    shouldShowErrorToast = true,
  } = options;

  const {
    execute: originalExecute,
    executeAsync: originalExecuteAsync,
    optimisticState,
    ...rest
  } = useOptimisticAction(action, {
    currentState,
    onError: (args) => {
      // Track error with Sentry
      if (breadcrumbContext) {
        trackServerAction(breadcrumbContext.action, 'error', breadcrumbContext.component);
      }

      onBeforeError?.();

      // Show error toast for rollback notification
      if (shouldShowErrorToast) {
        const serverError = args.error.serverError;
        const errorMessage =
          typeof serverError === 'string' ? serverError
          : args.error.validationErrors ? 'Validation failed'
          : 'Action failed. Changes have been reverted.';
        toast.error(errorMessage);
      }

      // Call after error with the rolled-back state (which is currentState)
      onAfterError?.(currentState);
      onSettled?.();
    },
    onExecute: (args) => {
      // Track action start with Sentry
      if (breadcrumbContext) {
        trackServerAction(breadcrumbContext.action, 'started', breadcrumbContext.component);
      }

      onExecute?.(args.input as Input);
    },
    onSuccess: (args) => {
      // Track success with Sentry
      if (breadcrumbContext) {
        trackServerAction(breadcrumbContext.action, 'success', breadcrumbContext.component);
      }

      // Unwrap ActionResponse and call callbacks
      const response = args.data;
      if (response?.wasSuccess) {
        onBeforeSuccess?.(response.data);
        // Pass the optimistic state that was computed, which is now confirmed
        onAfterSuccess?.(response.data, optimisticState);
      } else if (response && !response.wasSuccess) {
        // Business logic failure - treat as error
        if (shouldShowErrorToast) {
          toast.error(response.message || 'Action failed');
        }
        onAfterError?.(currentState);
      }

      onSettled?.();
    },
    updateFn: onUpdate as (state: State, input: unknown) => State,
  });

  // Wrap execute to match expected input type
  const execute = useCallback(
    (input: Input) => {
      originalExecute(input as Parameters<typeof originalExecute>[0]);
    },
    [originalExecute],
  );

  // Wrap executeAsync to return unwrapped data
  const executeAsync = useCallback(
    async (input: Input): Promise<T | undefined> => {
      const result = await originalExecuteAsync(input as Parameters<typeof originalExecuteAsync>[0]);

      // Unwrap ActionResponse
      if (result?.data?.wasSuccess) {
        return result.data.data;
      }

      return undefined;
    },
    [originalExecuteAsync],
  );

  return {
    ...rest,
    execute,
    executeAsync,
    optimisticState,
  };
};
