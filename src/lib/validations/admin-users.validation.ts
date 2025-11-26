import { z } from 'zod';

import { ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { zodMaxString } from '@/lib/utils/zod.utils';

/**
 * Admin user status filter options
 * - active: Users not locked and not deleted
 * - locked: Users with lockedUntil in the future
 */
const adminUserStatusValues = ['active', 'locked'] as const;

/**
 * Sortable fields for admin user list
 */
const adminUserSortByValues = [
  'createdAt',
  'updatedAt',
  'username',
  'email',
  'lastActiveAt',
  'role',
] as const;

/**
 * Assignable roles via admin UI
 * Note: 'admin' role cannot be assigned via the UI for security reasons
 */
const assignableRoleValues = ['user', 'moderator'] as const;

// ============================================================================
// Filter and Query Schemas
// ============================================================================

/**
 * Schema for filtering admin user list
 * Supports search, role, status, sorting, and pagination
 */
export const adminUsersFilterSchema = z.object({
  limit: z.number().min(1).max(100).default(25).optional(),
  offset: z.number().min(0).default(0).optional(),
  role: z.enum(ENUMS.USER.ROLE).optional(),
  search: zodMaxString({
    fieldName: 'Search',
    isRequired: false,
    maxLength: 100,
  }).optional(),
  sortBy: z.enum(adminUserSortByValues).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  status: z.enum(adminUserStatusValues).optional(),
});

// ============================================================================
// Admin Action Schemas
// ============================================================================

/**
 * Schema for updating a user's role
 * Only allows assignment of 'user' or 'moderator' roles (not 'admin')
 */
export const adminUpdateUserRoleSchema = z.object({
  newRole: z.enum(assignableRoleValues),
  userId: z.string().uuid('Invalid user ID'),
});

/**
 * Schema for locking a user account
 * lockDuration is in hours, optional (if not provided, locked indefinitely)
 */
export const adminLockUserSchema = z.object({
  lockDuration: z
    .number()
    .int('Lock duration must be a whole number')
    .min(1, 'Lock duration must be at least 1 hour')
    .max(8760, 'Lock duration cannot exceed 1 year (8760 hours)')
    .optional(),
  reason: zodMaxString({
    fieldName: 'Reason',
    isRequired: false,
    maxLength: SCHEMA_LIMITS.ADMIN_LOCK.REASON.MAX,
  }).optional(),
  userId: z.string().uuid('Invalid user ID'),
});

/**
 * Schema for unlocking a user account
 */
export const adminUnlockUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

/**
 * Schema for fetching user details in admin context
 */
export const adminUserDetailsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// ============================================================================
// Type Exports
// ============================================================================

export type AdminLockUser = z.infer<typeof adminLockUserSchema>;
export type AdminLockUserInput = z.input<typeof adminLockUserSchema>;

export type AdminUnlockUser = z.infer<typeof adminUnlockUserSchema>;
export type AdminUnlockUserInput = z.input<typeof adminUnlockUserSchema>;

export type AdminUpdateUserRole = z.infer<typeof adminUpdateUserRoleSchema>;
export type AdminUpdateUserRoleInput = z.input<typeof adminUpdateUserRoleSchema>;

export type AdminUserDetails = z.infer<typeof adminUserDetailsSchema>;
export type AdminUserDetailsInput = z.input<typeof adminUserDetailsSchema>;

export type AdminUsersFilter = z.infer<typeof adminUsersFilterSchema>;
export type AdminUsersFilterInput = z.input<typeof adminUsersFilterSchema>;

export type AdminUserSortBy = (typeof adminUserSortByValues)[number];
// Enum type exports
export type AdminUserStatus = (typeof adminUserStatusValues)[number];

export type AssignableRole = (typeof assignableRoleValues)[number];
