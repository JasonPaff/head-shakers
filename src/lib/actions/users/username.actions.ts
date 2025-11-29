'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import type { UserRecord } from '@/lib/queries/users/users-query';
import type { ActionResponse } from '@/lib/utils/action-response';

import {
  ACTION_NAMES,
  ERROR_CODES,
  ERROR_MESSAGES,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { invalidateMetadataCache } from '@/lib/seo/cache.utils';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { actionSuccess } from '@/lib/utils/action-response';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import { checkUsernameAvailabilitySchema, updateUsernameSchema } from '@/lib/validations/users.validation';

/**
 * Check if username is available (public action)
 */
export const checkUsernameAvailabilityAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.USERS.CHECK_USERNAME_AVAILABILITY,
  })
  .inputSchema(checkUsernameAvailabilitySchema)
  .action(async ({ ctx }): Promise<ActionResponse<{ available: boolean }>> => {
    const { username } = checkUsernameAvailabilitySchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
      data: { username },
      level: SENTRY_LEVELS.INFO,
      message: 'Checking username availability',
    });

    try {
      const isAvailable = await UsersFacade.isUsernameAvailable(username, undefined, dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
        data: { isAvailable, username },
        level: SENTRY_LEVELS.INFO,
        message: 'Username availability check completed',
      });

      return actionSuccess({ available: isAvailable });
    } catch (error) {
      return handleActionError(error, {
        metadata: { username },
        operation: ACTION_NAMES.USERS.CHECK_USERNAME_AVAILABILITY,
      });
    }
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
  .action(async ({ ctx }): Promise<ActionResponse<{ user: UserRecord }>> => {
    const { username } = updateUsernameSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, {
      newUsername: username,
      userId: ctx.userId,
    });

    try {
      // Check if user can change username (cooldown period)
      const canChange = await UsersFacade.canChangeUsername(ctx.userId, dbInstance);

      if (!canChange) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.USERS.USERNAME_CHANGE_COOLDOWN,
          ERROR_MESSAGES.USER.USERNAME_CHANGE_COOLDOWN,
          { ctx },
          false,
          400,
        );
      }

      // Check if username is available (excluding current user)
      const isAvailable = await UsersFacade.isUsernameAvailable(username, ctx.userId, dbInstance);

      if (!isAvailable) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.USERS.USERNAME_TAKEN,
          ERROR_MESSAGES.USER.USERNAME_TAKEN,
          { ctx },
          false,
          400,
        );
      }

      // Update username
      const updatedUser = await UsersFacade.updateUsername(ctx.userId, username, dbInstance);

      if (!updatedUser) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.USERS.USERNAME_UPDATE_FAILED,
          ERROR_MESSAGES.USER.USERNAME_UPDATE_FAILED,
          { ctx },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
        data: {
          newUsername: username,
          userId: ctx.userId,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Username updated successfully',
      });

      // invalidate metadata cache for the user (username affects metadata)
      invalidateMetadataCache('user', ctx.userId);

      return actionSuccess({ user: updatedUser });
    } catch (error) {
      return handleActionError(error, {
        metadata: { newUsername: username, userId: ctx.userId },
        operation: ACTION_NAMES.USERS.UPDATE_USERNAME,
      });
    }
  });
