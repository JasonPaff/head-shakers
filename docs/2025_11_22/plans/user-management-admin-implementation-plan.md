# User Management Admin Page Implementation Plan

**Generated**: 2025-01-22
**Original Request**: the user management admin page with clerk integration for managing users (the little bit of user management needed) in the head shakers application
**Refined Request**: Develop a comprehensive user management admin page for the Head Shakers platform that leverages Clerk's authentication API to enable administrators with moderator privileges to efficiently manage user accounts and roles within the application. The interface should provide a paginated data table displaying core user information (username, email, display name, join date, last active timestamp, and current role) with search and filtering capabilities, allowing admins to sort users by status, role (user, moderator, admin), and activity levels. The implementation should integrate with the existing Drizzle ORM database schema (users table with role-based access control via userRoleEnum) and utilize Clerk's @clerk/nextjs SDK to fetch and manage user data, while providing admin actions such as updating user roles (promoting/demoting between user and moderator status), viewing detailed user profiles with activity history, and managing account statuses (verifying email, locking/unlocking accounts). The page should enforce authorization checks using the existing requireModerator utility function, display user creation and modification timestamps from the database, and provide visual feedback through Radix UI components (dialogs for confirmations, alerts for status changes) with TanStack React Table for the data management interface. Integration with next-safe-action will ensure type-safe server actions for role updates and account status modifications, while Sentry monitoring should track administrative actions for audit purposes.

## Analysis Summary

- Feature request refined with project context
- Discovered 35+ files across 6 directories
- Generated 11-step implementation plan

## File Discovery Results

### Critical Priority Files

| File                                      | Category   | Description                                                      |
| ----------------------------------------- | ---------- | ---------------------------------------------------------------- |
| `src/app/(app)/admin/users/page.tsx`      | Page       | Existing placeholder page to implement                           |
| `src/lib/db/schema/users.schema.ts`       | Schema     | User schema with userRoleEnum, lockedUntil, isVerified           |
| `src/lib/utils/admin.utils.ts`            | Utility    | requireModerator(), checkIsModerator(), getCurrentUserWithRole() |
| `src/lib/queries/users/users-query.ts`    | Query      | UsersQuery class (needs listing/filtering methods)               |
| `src/lib/facades/users/users.facade.ts`   | Facade     | UsersFacade (needs admin operations)                             |
| `src/lib/validations/users.validation.ts` | Validation | User validation schemas                                          |

### High Priority Files (Patterns)

| File                                                     | Category   | Description                           |
| -------------------------------------------------------- | ---------- | ------------------------------------- |
| `src/lib/utils/next-safe-action.ts`                      | Utility    | adminActionClient configuration       |
| `src/lib/middleware/admin.middleware.ts`                 | Middleware | Admin middleware with role validation |
| `src/lib/actions/admin/admin-content-reports.actions.ts` | Action     | Example admin action patterns         |
| `src/lib/validations/moderation.validation.ts`           | Validation | Example admin filter schemas          |
| `src/lib/constants/enums.ts`                             | Constants  | USER.ROLE enum definitions            |
| `src/lib/constants/action-names.ts`                      | Constants  | Action name constants                 |

### Files to Create

1. `src/lib/actions/admin/admin-users.actions.ts` - Server actions
2. `src/lib/validations/admin-users.validation.ts` - Zod schemas
3. `src/app/(app)/admin/users/components/user-management-client.tsx` - Main client component
4. `src/app/(app)/admin/users/components/users-data-table.tsx` - TanStack Table
5. `src/app/(app)/admin/users/components/user-role-dialog.tsx` - Role change dialog
6. `src/app/(app)/admin/users/components/user-details-dialog.tsx` - User details dialog

### Files to Modify

1. `src/app/(app)/admin/users/page.tsx` - Replace placeholder
2. `src/lib/queries/users/users-query.ts` - Add listing/filtering methods
3. `src/lib/facades/users/users.facade.ts` - Add admin operations
4. `src/lib/validations/users.validation.ts` - Add admin schemas
5. `src/lib/constants/action-names.ts` - Add admin user action names

---

## Implementation Plan

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: Medium-High
**Risk Level**: Medium

## Quick Summary

Implement a comprehensive user management admin page that enables moderators and administrators to view, search, filter, and manage user accounts. The feature includes a paginated data table with TanStack React Table, role management dialogs, user detail views, and account status controls (lock/unlock, verify email), all integrated with proper authorization checks, Sentry audit logging, and cache invalidation patterns.

## Prerequisites

- [ ] Verify Clerk SDK is properly configured for user management operations
- [ ] Ensure existing admin middleware and authorization utilities are functioning
- [ ] Confirm TanStack React Table and related dependencies are installed
- [ ] Review existing admin page patterns (featured-content, reports) for consistency

## Implementation Steps

### Step 1: Add Admin User Management Constants

**What**: Add action names and operation constants for user management
**Why**: Centralized constants ensure type safety and maintainability across server actions and error handling
**Confidence**: High

**Files to Modify:**

- `src/lib/constants/action-names.ts` - Add admin user action names
- `src/lib/constants/operations.ts` - Add admin user operation names

**Changes:**

- Add `ADMIN_USERS` section to ACTION_NAMES with: GET_USERS, UPDATE_USER_ROLE, LOCK_USER, UNLOCK_USER, VERIFY_USER_EMAIL, GET_USER_DETAILS, GET_USER_STATS
- Add `ADMIN_USERS` section to OPERATIONS with corresponding operation names

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New constants are properly typed and follow existing naming patterns
- [ ] All validation commands pass

---

### Step 2: Create Admin Users Validation Schemas

**What**: Create Zod validation schemas for admin user management operations
**Why**: Type-safe validation ensures data integrity for all admin user operations including filtering, pagination, and role updates
**Confidence**: High

**Files to Create:**

- `src/lib/validations/admin-users.validation.ts` - Admin user validation schemas

**Changes:**

- Create `adminUsersFilterSchema` with: search, role, status (active/locked/verified), sortBy, sortOrder, limit, offset
- Create `adminUpdateUserRoleSchema` with: userId, newRole (user/moderator)
- Create `adminLockUserSchema` with: userId, lockDuration (optional), reason
- Create `adminUnlockUserSchema` with: userId
- Create `adminVerifyUserEmailSchema` with: userId
- Create `adminUserDetailsSchema` with: userId
- Export all schema types

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All schemas follow existing validation patterns from moderation.validation.ts
- [ ] Role enum properly restricts values to 'user' and 'moderator' (admin role cannot be assigned via UI)
- [ ] All validation commands pass

---

### Step 3: Add User Query Methods for Admin Listing

**What**: Extend UsersQuery class with methods for admin user listing, filtering, and searching
**Why**: Query layer provides the data access patterns needed for paginated user lists with filtering capabilities
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/users/users-query.ts` - Add admin listing methods

**Changes:**

- Add `findUsersForAdminAsync` method with pagination, sorting, and filtering (by role, status, search)
- Add `countUsersForAdminAsync` method for total count with same filters
- Add `getUserWithActivityAsync` method to get user details with recent activity
- Add `getUserStatsAsync` method to get user statistics (collections count, bobbleheads count, etc.)
- Implement search across username, email, and displayName fields
- Add proper indexes usage for performance (leverage existing users_role_idx, users_verified_created_idx)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Methods follow BaseQuery patterns with proper context handling
- [ ] Pagination and filtering work correctly
- [ ] Search functionality covers username, email, displayName
- [ ] All validation commands pass

---

### Step 4: Add Admin User Operations to UsersFacade

**What**: Extend UsersFacade with admin operations for role management and account status changes
**Why**: Facade layer orchestrates business logic, cache invalidation, and transaction handling for admin operations
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/users/users.facade.ts` - Add admin operations

**Changes:**

- Add `getUsersForAdminAsync` method that calls query layer and returns paginated results with stats
- Add `updateUserRoleAsync` method with role validation (prevent self-demotion, prevent assigning admin role)
- Add `lockUserAsync` method to set lockedUntil timestamp
- Add `unlockUserAsync` method to clear lockedUntil timestamp
- Add `verifyUserEmailAsync` method to set isVerified to true
- Add `getUserDetailsForAdminAsync` method to get comprehensive user info with activity
- Implement proper cache invalidation using CacheTagGenerators.user.update()
- Add business rule validations (cannot demote self, cannot lock admin users)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All methods follow existing facade patterns
- [ ] Cache invalidation is properly implemented
- [ ] Business rules prevent invalid operations
- [ ] All validation commands pass

---

### Step 5: Create Admin Users Server Actions

**What**: Create server actions for admin user management operations
**Why**: Server actions provide type-safe, validated endpoints for all admin user operations with proper authorization and audit logging
**Confidence**: High

**Files to Create:**

- `src/lib/actions/admin/admin-users.actions.ts` - Admin user server actions

**Changes:**

- Create `getAdminUsersAction` using adminActionClient for listing users with filters
- Create `updateUserRoleAction` for promoting/demoting users (moderator only to moderator/user)
- Create `lockUserAction` for locking user accounts
- Create `unlockUserAction` for unlocking user accounts
- Create `verifyUserEmailAction` for manually verifying email
- Create `getUserDetailsAction` for fetching detailed user info
- Create `getUserStatsAction` for dashboard statistics
- Add Sentry context and breadcrumbs for audit logging on all actions
- Parse ctx.sanitizedInput through validation schemas (per server action rules)
- Use handleActionError for consistent error handling

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All actions use adminActionClient for authorization
- [ ] Actions follow admin-content-reports.actions.ts patterns
- [ ] Sentry audit logging is implemented for all role changes and status updates
- [ ] All validation commands pass

---

### Step 6: Create Users Data Table Component

**What**: Create a TanStack React Table component for displaying and managing users
**Why**: Data table provides paginated, sortable, filterable interface for managing large user lists
**Confidence**: High

**Files to Create:**

- `src/app/(app)/admin/users/components/users-data-table.tsx` - TanStack table component

**Changes:**

- Create UsersDataTable component following reports-table.tsx patterns
- Define columns: checkbox (selection), username, email, displayName, role (badge), status (active/locked/verified badges), memberSince, lastActiveAt, actions dropdown
- Implement row selection for bulk operations
- Implement sorting on relevant columns (username, role, memberSince, lastActiveAt)
- Implement manual pagination using nuqs for URL state (page, pageSize)
- Add actions dropdown menu with: View Details, Change Role, Lock/Unlock Account
- Style role badges (user=gray, moderator=blue, admin=purple)
- Style status badges (active=green, locked=red, unverified=yellow)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Table renders user data correctly with proper column widths
- [ ] Sorting and pagination work with URL state
- [ ] Actions dropdown triggers appropriate callbacks
- [ ] All validation commands pass

---

### Step 7: Create User Role Change Dialog Component

**What**: Create a dialog for changing user roles with confirmation
**Why**: Role changes are sensitive operations requiring explicit confirmation and clear feedback
**Confidence**: High

**Files to Create:**

- `src/app/(app)/admin/users/components/user-role-dialog.tsx` - Role change dialog

**Changes:**

- Create UserRoleDialog component using AlertDialog from Radix UI
- Accept props: user (current user data), isOpen, onClose, onConfirm
- Display current role and target role selection (Select component)
- Show warning message about role change implications
- Implement confirmation flow with loading state
- Use useServerAction hook for updateUserRoleAction
- Add proper toast messages for success/error

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Dialog displays user info and role options correctly
- [ ] Role selection excludes 'admin' option (cannot promote to admin via UI)
- [ ] Confirmation prevents accidental role changes
- [ ] All validation commands pass

---

### Step 8: Create User Details Dialog Component

**What**: Create a dialog for viewing detailed user information and activity history
**Why**: Admins need comprehensive user info for moderation decisions including activity patterns
**Confidence**: High

**Files to Create:**

- `src/app/(app)/admin/users/components/user-details-dialog.tsx` - User details dialog

**Changes:**

- Create UserDetailsDialog component using Dialog from Radix UI
- Accept props: userId, isOpen, onClose
- Fetch user details using getUserDetailsAction when opened
- Display sections: Profile Info (avatar, name, email, bio, location), Account Status (role, verified, locked), Timestamps (created, updated, lastActive, memberSince), Statistics (collections count, bobbleheads count)
- Show loading skeleton while fetching
- Add action buttons: Lock/Unlock Account, Verify Email, Change Role

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Dialog loads and displays user details correctly
- [ ] Loading states are handled properly
- [ ] Action buttons trigger appropriate operations
- [ ] All validation commands pass

---

### Step 9: Create User Management Client Component

**What**: Create the main client component that orchestrates the user management interface
**Why**: Client component manages state, coordinates child components, and handles data fetching/updates
**Confidence**: High

**Files to Create:**

- `src/app/(app)/admin/users/components/user-management-client.tsx` - Main client component

**Changes:**

- Create UserManagementClient component following featured-content-manager.tsx patterns
- Accept initialData prop for server-side loaded users
- Implement filter controls: search input, role select, status select
- Display quick stats cards: Total Users, Moderators, Locked Accounts, Unverified Users
- Integrate UsersDataTable component
- Manage dialog states: roleDialogUser, detailsDialogUserId
- Implement refresh/refetch logic after successful operations using useServerAction
- Use nuqs for URL-based filter state management

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component structure follows existing admin patterns
- [ ] Filters update table data correctly
- [ ] Dialog flows work end-to-end
- [ ] All validation commands pass

---

### Step 10: Update Admin Users Page

**What**: Replace placeholder page with fully implemented user management interface
**Why**: Server component handles initial data loading, authorization, and renders client component
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/admin/users/page.tsx` - Replace placeholder implementation

**Changes:**

- Keep existing requireModerator() authorization check
- Import and use UsersFacade.getUsersForAdminAsync for initial data
- Parse URL search params for initial filter state
- Pass initialData to UserManagementClient component
- Add generateMetadata function for page title/description
- Keep dynamic = 'force-dynamic' export

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Page loads with initial user data
- [ ] Authorization is enforced for non-moderator users
- [ ] URL params properly hydrate initial filters
- [ ] All validation commands pass

---

### Step 11: Integration Testing and Edge Case Handling

**What**: Test complete user management flow and handle edge cases
**Why**: Ensures all components work together correctly and error states are handled gracefully
**Confidence**: Medium

**Files to Modify:**

- All created files may need minor adjustments based on integration testing

**Changes:**

- Test role change flow end-to-end
- Test lock/unlock flow end-to-end
- Test email verification flow
- Verify pagination works with large datasets
- Verify search filters work correctly
- Test error states (network errors, authorization failures)
- Ensure Sentry breadcrumbs are logged for audit trail
- Verify cache invalidation updates UI correctly

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run build
```

**Success Criteria:**

- [ ] All user management operations work correctly
- [ ] Error states display appropriate messages
- [ ] Audit logging captures all admin actions
- [ ] Build completes without errors
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Build succeeds with `npm run build`
- [ ] Admin authorization is properly enforced on all server actions
- [ ] Role changes cannot promote users to admin (business rule)
- [ ] Self-demotion is prevented (business rule)
- [ ] Sentry audit logs capture all admin user management actions
- [ ] Cache invalidation triggers on user updates
- [ ] UI is responsive and follows existing admin page patterns

## Notes

**Authorization Considerations:**

- Role management is restricted to moderators and admins via adminActionClient
- Admin role cannot be assigned via UI (only direct database access)
- Users cannot demote themselves to prevent accidental lockout
- Admin users cannot be locked via UI (protection for platform administrators)

**Performance Considerations:**

- Leverage existing database indexes (users_role_idx, users_verified_created_idx, users_email_lower_idx)
- Implement server-side pagination to handle large user bases
- Use URL state (nuqs) for shareable/bookmarkable filter states

**Audit Trail:**

- All role changes logged via Sentry breadcrumbs with user context
- Account lock/unlock operations logged with reason
- Email verification actions logged

**Clerk Integration:**

- Current implementation uses local database for user management
- Clerk is used for authentication only
- Consider future integration with Clerk's user management API for synced operations if needed
