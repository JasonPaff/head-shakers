'use server';

import 'server-only';

import type { UserRecord } from '@/lib/queries/users/users.query';
import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, ERROR_CODES, ERROR_MESSAGES, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { invalidateMetadataCache } from '@/lib/seo/cache.utils';
import { actionFailure, actionSuccess } from '@/lib/utils/action-response';
import { createInternalError } from '@/lib/utils/error-builders';
import { authActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import { withActionBreadcrumbs, withActionErrorHandling } from '@/lib/utils/sentry-server/breadcrumbs.server';
import { checkUsernameAvailabilitySchema, updateUsernameSchema } from '@/lib/validations/users.validation';

/**
 * Check if username is available (public action)
 */
export const checkUsernameAvailabilityAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.USERS.CHECK_USERNAME_AVAILABILITY,
    isTransactionRequired: false,
  })
  .inputSchema(checkUsernameAvailabilitySchema)
  .action(async ({ ctx }): Promise<ActionResponse<{ available: boolean }>> => {
    const { username } = checkUsernameAvailabilitySchema.parse(ctx.sanitizedInput);

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.USERS.CHECK_USERNAME_AVAILABILITY,
        contextData: { username },
        contextType: SENTRY_CONTEXTS.USER_DATA,
        operation: OPERATIONS.USERS.CHECK_USERNAME_AVAILABLE,
      },
      async () => {
        const isAvailable = await UsersFacade.isUsernameAvailableAsync(username, undefined, ctx.db);

        return actionSuccess({ available: isAvailable });
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ? { available: result.data.available, username } : {},
      },
    );
  });

/**
 * Update user's username (authenticated action)
 */
export const updateUsernameAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.USERS.UPDATE_USERNAME,
    isTransactionRequired: true,
  })
  .inputSchema(updateUsernameSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<{ user: UserRecord }>> => {
    const { username } = updateUsernameSchema.parse(ctx.sanitizedInput);

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.USERS.UPDATE_USERNAME,
        contextData: { newUsername: username, userId: ctx.userId },
        contextType: SENTRY_CONTEXTS.USER_DATA,
        input: parsedInput,
        operation: OPERATIONS.USERS.UPDATE_USERNAME,
        userId: ctx.userId,
      },
      async () => {
        // Check if user can change username (cooldown period)
        const canChange = await UsersFacade.canChangeUsernameAsync(ctx.userId, ctx.db);

        if (!canChange) {
          return actionFailure(ERROR_MESSAGES.USER.USERNAME_CHANGE_COOLDOWN);
        }

        // Check if username is available (excluding current user)
        const isAvailable = await UsersFacade.isUsernameAvailableAsync(username, ctx.userId, ctx.db);

        if (!isAvailable) {
          return actionFailure(ERROR_MESSAGES.USER.USERNAME_TAKEN);
        }

        // Update username
        const updatedUser = await UsersFacade.updateUsernameAsync(ctx.userId, username, ctx.db);

        if (!updatedUser) {
          throw createInternalError(ERROR_MESSAGES.USER.USERNAME_UPDATE_FAILED, {
            errorCode: ERROR_CODES.USERS.USERNAME_UPDATE_FAILED,
            operation: OPERATIONS.USERS.UPDATE_USERNAME,
            userId: ctx.userId,
          });
        }

        // invalidate metadata cache for the user (username affects metadata)
        invalidateMetadataCache('user', ctx.userId);

        return actionSuccess({ user: updatedUser }, 'Username updated successfully!');
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ? { newUsername: username, userId: ctx.userId } : {},
      },
    );
  });
