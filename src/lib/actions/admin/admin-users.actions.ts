'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import type { AdminUserListRecord, UserRecord, UserStats } from '@/lib/queries/users/users.query';
import type { ActionResponse } from '@/lib/utils/action-response';

import {
  ACTION_NAMES,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { actionSuccess } from '@/lib/utils/action-response';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { adminActionClient } from '@/lib/utils/next-safe-action';
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
  .action(
    async ({
      ctx,
      parsedInput,
    }): Promise<ActionResponse<{ total: number; users: Array<AdminUserListRecord> }>> => {
      const { isAdmin, isModerator, userId } = ctx;
      const input = adminUsersFilterSchema.parse(ctx.sanitizedInput);
      const dbInstance = ctx.db;

      Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, {
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
        operation: 'get_admin_users',
        userId,
      });

      try {
        const { total, users } = await UsersFacade.getUsersForAdminAsync(input, dbInstance);

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            totalUsers: total,
            usersReturned: users.length,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Admin retrieved ${users.length} users`,
        });

        return actionSuccess({
          total,
          users,
        });
      } catch (error) {
        return handleActionError(error, {
          input: parsedInput,
          metadata: {
            actionName: ACTION_NAMES.ADMIN_USERS.GET_USERS,
            userId,
          },
          operation: OPERATIONS.ADMIN_USERS.GET_USERS,
        });
      }
    },
  );

/**
 * Get detailed user information for admin view
 */
export const getUserDetailsAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN_USERS.GET_USER_DETAILS,
    isTransactionRequired: false,
  })
  .inputSchema(adminUserDetailsSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<{ stats: UserStats; user: UserRecord }>> => {
    const { isAdmin, isModerator, userId } = ctx;
    const { userId: targetUserId } = adminUserDetailsSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, {
      isAdmin,
      isModerator,
      operation: 'get_user_details',
      targetUserId,
      userId,
    });

    try {
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

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          targetUserId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Admin retrieved user details`,
      });

      return actionSuccess(userDetails);
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ADMIN_USERS.GET_USER_DETAILS,
          targetUserId,
        },
        operation: OPERATIONS.ADMIN_USERS.GET_USER_DETAILS,
      });
    }
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
    const { isAdmin, isModerator, userId } = ctx;
    const { newRole, userId: targetUserId } = adminUpdateUserRoleSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    // Only admins can change user roles
    if (!isAdmin) {
      throw new ActionError(
        ErrorType.AUTHORIZATION,
        ERROR_CODES.ADMIN.INSUFFICIENT_PRIVILEGES,
        'Admin privileges required to change user roles',
        { ctx, operation: OPERATIONS.ADMIN_USERS.UPDATE_USER_ROLE },
        false,
        403,
      );
    }

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, {
      isAdmin,
      isModerator,
      newRole,
      operation: 'update_user_role',
      targetUserId,
      userId,
    });

    try {
      const updatedUser = await UsersFacade.updateUserRoleAsync(targetUserId, newRole, userId, dbInstance);

      // Audit log breadcrumb for role changes (security-sensitive operation)
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          actingAdmin: userId,
          newRole,
          previousRole: '[REDACTED]', // Previous role not returned by facade
          targetUserId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User role updated to ${newRole}`,
      });

      return actionSuccess(updatedUser, `User role updated to ${newRole}`);
    } catch (error) {
      // Handle specific business rule errors from facade
      if (error instanceof Error) {
        if (error.message.includes('Cannot change your own role')) {
          throw new ActionError(
            ErrorType.BUSINESS_RULE,
            ERROR_CODES.USERS.INSUFFICIENT_PRIVILEGES,
            'Cannot change your own role',
            { operation: OPERATIONS.ADMIN_USERS.UPDATE_USER_ROLE, targetUserId },
            false,
            400,
          );
        }
        if (error.message.includes('User not found')) {
          throw new ActionError(
            ErrorType.NOT_FOUND,
            ERROR_CODES.USERS.NOT_FOUND,
            ERROR_MESSAGES.USER.NOT_FOUND,
            { operation: OPERATIONS.ADMIN_USERS.UPDATE_USER_ROLE, targetUserId },
            false,
            404,
          );
        }
      }

      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ADMIN_USERS.UPDATE_USER_ROLE,
          newRole,
          targetUserId,
        },
        operation: OPERATIONS.ADMIN_USERS.UPDATE_USER_ROLE,
      });
    }
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

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, {
      isAdmin,
      isModerator,
      lockDuration: lockDuration ?? 'indefinite',
      operation: 'lock_user',
      targetUserId,
      userId,
    });

    try {
      const updatedUser = await UsersFacade.lockUserAsync(targetUserId, userId, lockDuration, dbInstance);

      // Audit log breadcrumb for account locking (security-sensitive operation)
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          actingAdmin: userId,
          lockDuration: lockDuration ?? 'indefinite',
          lockedUntil: updatedUser.lockedUntil?.toISOString(),
          reason: reason ? '[REDACTED]' : undefined,
          targetUserId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User account locked`,
      });

      return actionSuccess(
        updatedUser,
        lockDuration ? `User account locked for ${lockDuration} hours` : 'User account locked indefinitely',
      );
    } catch (error) {
      // Handle specific business rule errors from facade
      if (error instanceof Error) {
        if (error.message.includes('Cannot lock your own account')) {
          throw new ActionError(
            ErrorType.BUSINESS_RULE,
            ERROR_CODES.USERS.INSUFFICIENT_PRIVILEGES,
            'Cannot lock your own account',
            { operation: OPERATIONS.ADMIN_USERS.LOCK_USER, targetUserId },
            false,
            400,
          );
        }
        if (error.message.includes('Cannot lock admin users')) {
          throw new ActionError(
            ErrorType.BUSINESS_RULE,
            ERROR_CODES.ADMIN.INSUFFICIENT_PRIVILEGES,
            'Cannot lock admin users',
            { operation: OPERATIONS.ADMIN_USERS.LOCK_USER, targetUserId },
            false,
            403,
          );
        }
        if (error.message.includes('User not found')) {
          throw new ActionError(
            ErrorType.NOT_FOUND,
            ERROR_CODES.USERS.NOT_FOUND,
            ERROR_MESSAGES.USER.NOT_FOUND,
            { operation: OPERATIONS.ADMIN_USERS.LOCK_USER, targetUserId },
            false,
            404,
          );
        }
      }

      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ADMIN_USERS.LOCK_USER,
          lockDuration,
          targetUserId,
        },
        operation: OPERATIONS.ADMIN_USERS.LOCK_USER,
      });
    }
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

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, {
      isAdmin,
      isModerator,
      operation: 'unlock_user',
      targetUserId,
      userId,
    });

    try {
      const updatedUser = await UsersFacade.unlockUserAsync(targetUserId, dbInstance);

      // Audit log breadcrumb for account unlocking
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          actingAdmin: userId,
          targetUserId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User account unlocked`,
      });

      return actionSuccess(updatedUser, 'User account unlocked');
    } catch (error) {
      // Handle specific errors from facade
      if (error instanceof Error && error.message.includes('User not found')) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.USERS.NOT_FOUND,
          ERROR_MESSAGES.USER.NOT_FOUND,
          { operation: OPERATIONS.ADMIN_USERS.UNLOCK_USER, targetUserId },
          false,
          404,
        );
      }

      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.ADMIN_USERS.UNLOCK_USER,
          targetUserId,
        },
        operation: OPERATIONS.ADMIN_USERS.UNLOCK_USER,
      });
    }
  });
