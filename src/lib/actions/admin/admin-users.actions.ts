'use server';

import 'server-only';

import type { AdminUserListRecord, UserRecord, UserStats } from '@/lib/queries/users/users.query';
import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, ERROR_CODES, ERROR_MESSAGES, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { actionSuccess } from '@/lib/utils/action-response';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { adminActionClient } from '@/lib/utils/next-safe-action';
import { withActionBreadcrumbs, withActionErrorHandling } from '@/lib/utils/sentry-server/breadcrumbs.server';
import {
  adminLockUserSchema,
  adminUnlockUserSchema,
  adminUpdateUserRoleSchema,
  adminUserDetailsSchema,
  adminUsersFilterSchema,
} from '@/lib/validations/admin-users.validation';

/**
 * Get users for the admin dashboard with filtering, sorting, and pagination
 */
export const getAdminUsersAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN_USERS.GET_USERS,
    isTransactionRequired: false,
  })
  .inputSchema(adminUsersFilterSchema)
  .action(async ({ ctx }): Promise<ActionResponse<{ total: number; users: Array<AdminUserListRecord> }>> => {
    const { isAdmin, isModerator, userId } = ctx;
    const input = adminUsersFilterSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.ADMIN_USERS.GET_USERS,
        contextData: {
          filters: {
            limit: input.limit,
            offset: input.offset,
            role: input.role,
            search: input.search ? '[REDACTED]' : undefined,
            sortBy: input.sortBy,
            sortOrder: input.sortOrder,
            status: input.status,
          },
          isAdmin,
          isModerator,
          userId,
        },
        contextType: SENTRY_CONTEXTS.USER_DATA,
        operation: OPERATIONS.ADMIN_USERS.GET_USERS,
        userId,
      },
      async () => {
        const { total, users } = await UsersFacade.getUsersForAdminAsync(input, dbInstance);

        return actionSuccess({
          total,
          users,
        });
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ? { totalUsers: result.data.total, usersReturned: result.data.users.length } : {},
      },
    );
  });

/**
 * Get detailed user information for admin view
 */
export const getUserDetailsAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN_USERS.GET_USER_DETAILS,
    isTransactionRequired: false,
  })
  .inputSchema(adminUserDetailsSchema)
  .action(async ({ ctx }): Promise<ActionResponse<{ stats: UserStats; user: UserRecord }>> => {
    const { isAdmin, isModerator, userId } = ctx;
    const { userId: targetUserId } = adminUserDetailsSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.ADMIN_USERS.GET_USER_DETAILS,
        contextData: {
          isAdmin,
          isModerator,
          targetUserId,
          userId,
        },
        contextType: SENTRY_CONTEXTS.USER_DATA,
        operation: OPERATIONS.ADMIN_USERS.GET_USER_DETAILS,
        userId,
      },
      async () => {
        const userDetails = await UsersFacade.getUserDetailsForAdminAsync(targetUserId, dbInstance);

        if (!userDetails) {
          throw new ActionError(
            ErrorType.NOT_FOUND,
            ERROR_CODES.USERS.NOT_FOUND,
            ERROR_MESSAGES.USER.NOT_FOUND,
            { operation: OPERATIONS.ADMIN_USERS.GET_USER_DETAILS, targetUserId },
            false,
            404,
          );
        }

        return actionSuccess(userDetails);
      },
      {
        includeResultSummary: (result) => (result.wasSuccess ? { targetUserId } : {}),
      },
    );
  });

/**
 * Update a user's role (moderator only - cannot assign admin role)
 * Includes audit logging for security compliance
 */
export const updateUserRoleAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN_USERS.UPDATE_USER_ROLE,
    isTransactionRequired: true,
  })
  .inputSchema(adminUpdateUserRoleSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<UserRecord>> => {
    const { isAdmin, userId } = ctx;
    const { newRole, userId: targetUserId } = adminUpdateUserRoleSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    // Only admins can change user roles - check before wrapper
    if (!isAdmin) {
      throw new ActionError(
        ErrorType.AUTHORIZATION,
        ERROR_CODES.ADMIN.INSUFFICIENT_PRIVILEGES,
        'Admin privileges required to change user roles',
        { operation: OPERATIONS.ADMIN_USERS.UPDATE_USER_ROLE },
        false,
        403,
      );
    }

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.ADMIN_USERS.UPDATE_USER_ROLE,
        contextData: {
          isAdmin,
          newRole,
          targetUserId,
          userId,
        },
        contextType: SENTRY_CONTEXTS.USER_DATA,
        input: parsedInput,
        operation: OPERATIONS.ADMIN_USERS.UPDATE_USER_ROLE,
        userId,
      },
      async () => {
        const updatedUser = await UsersFacade.updateUserRoleAsync(targetUserId, newRole, userId, dbInstance);

        return actionSuccess(updatedUser, `User role updated to ${newRole}`);
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ?
            {
              actingAdmin: userId,
              newRole,
              targetUserId,
            }
          : {},
      },
    );
  });

/**
 * Lock a user account
 * Prevents the user from accessing the platform until unlocked
 */
export const lockUserAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN_USERS.LOCK_USER,
    isTransactionRequired: true,
  })
  .inputSchema(adminLockUserSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<UserRecord>> => {
    const { isAdmin, isModerator, userId } = ctx;
    const { lockDuration, reason, userId: targetUserId } = adminLockUserSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.ADMIN_USERS.LOCK_USER,
        contextData: {
          isAdmin,
          isModerator,
          lockDuration: lockDuration ?? 'indefinite',
          reason: reason ? '[REDACTED]' : undefined,
          targetUserId,
          userId,
        },
        contextType: SENTRY_CONTEXTS.USER_DATA,
        input: parsedInput,
        operation: OPERATIONS.ADMIN_USERS.LOCK_USER,
        userId,
      },
      async () => {
        const updatedUser = await UsersFacade.lockUserAsync(targetUserId, userId, lockDuration, dbInstance);

        return actionSuccess(
          updatedUser,
          lockDuration ? `User account locked for ${lockDuration} hours` : 'User account locked indefinitely',
        );
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ?
            {
              actingAdmin: userId,
              lockDuration: lockDuration ?? 'indefinite',
              lockedUntil: result.data.lockedUntil?.toISOString(),
              targetUserId,
            }
          : {},
      },
    );
  });

/**
 * Unlock a user account
 * Restores user access to the platform
 */
export const unlockUserAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN_USERS.UNLOCK_USER,
    isTransactionRequired: true,
  })
  .inputSchema(adminUnlockUserSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<UserRecord>> => {
    const { isAdmin, isModerator, userId } = ctx;
    const { userId: targetUserId } = adminUnlockUserSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.ADMIN_USERS.UNLOCK_USER,
        contextData: {
          isAdmin,
          isModerator,
          targetUserId,
          userId,
        },
        contextType: SENTRY_CONTEXTS.USER_DATA,
        input: parsedInput,
        operation: OPERATIONS.ADMIN_USERS.UNLOCK_USER,
        userId,
      },
      async () => {
        const updatedUser = await UsersFacade.unlockUserAsync(targetUserId, dbInstance);

        return actionSuccess(updatedUser, 'User account unlocked');
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ?
            {
              actingAdmin: userId,
              targetUserId,
            }
          : {},
      },
    );
  });
