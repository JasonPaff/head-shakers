# Step 2: AI-Powered File Discovery

**Step**: 2 of 3
**Started**: 2025-01-22T00:00:02Z
**Completed**: 2025-01-22T00:00:03Z
**Status**: Success

## Refined Request Input

Develop a comprehensive user management admin page for the Head Shakers platform that leverages Clerk's authentication API to enable administrators with moderator privileges to efficiently manage user accounts and roles within the application. The interface should provide a paginated data table displaying core user information (username, email, display name, join date, last active timestamp, and current role) with search and filtering capabilities, allowing admins to sort users by status, role (user, moderator, admin), and activity levels. The implementation should integrate with the existing Drizzle ORM database schema (users table with role-based access control via userRoleEnum) and utilize Clerk's @clerk/nextjs SDK to fetch and manage user data, while providing admin actions such as updating user roles (promoting/demoting between user and moderator status), viewing detailed user profiles with activity history, and managing account statuses (verifying email, locking/unlocking accounts). The page should enforce authorization checks using the existing requireModerator utility function, display user creation and modification timestamps from the database, and provide visual feedback through Radix UI components (dialogs for confirmations, alerts for status changes) with TanStack React Table for the data management interface. Integration with next-safe-action will ensure type-safe server actions for role updates and account status modifications, while Sentry monitoring should track administrative actions for audit purposes.

## Discovery Statistics

- **Directories Explored**: 15+
- **Files Examined**: 50+
- **Highly Relevant Files**: 25+
- **Supporting Files**: 15+

## Discovered Files by Priority

### Critical Priority (Core Implementation Files)

| File Path                                 | Category   | Relevance                                                                                                                                                                                                                                                    |
| ----------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/app/(app)/admin/users/page.tsx`      | Page       | **Existing placeholder page** - Currently shows "User management interface coming soon...". This is the main file to implement the user management UI.                                                                                                       |
| `src/lib/db/schema/users.schema.ts`       | Schema     | **User database schema** - Defines `users` table with `userRoleEnum` ('user', 'moderator', 'admin'), contains all user fields including role, isVerified, lockedUntil, lastActiveAt, createdAt, etc. Also defines `userActivity` table for activity history. |
| `src/lib/utils/admin.utils.ts`            | Utility    | **Authorization utilities** - Contains `requireModerator()`, `checkIsModerator()`, and `getCurrentUserWithRole()` functions for permission checks.                                                                                                           |
| `src/lib/queries/users/users-query.ts`    | Query      | **User query class** - Existing UsersQuery class with `findByIdAsync`, `findByClerkIdAsync`, `findByUsernameAsync` methods. Needs new methods for listing/filtering users.                                                                                   |
| `src/lib/facades/users/users.facade.ts`   | Facade     | **User business logic facade** - Contains `getUserById`, `getUserByClerkId`, `updateUsername` operations. Needs new admin operations for role updates and account management.                                                                                |
| `src/lib/validations/users.validation.ts` | Validation | **User validation schemas** - Contains Zod schemas for user data. Needs new admin schemas for role updates, user filtering, and account status changes.                                                                                                      |

### High Priority (Patterns & Infrastructure)

| File Path                                                | Category   | Relevance                                                                                                                                |
| -------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/utils/next-safe-action.ts`                      | Utility    | **Server action client configuration** - Defines `adminActionClient` for moderator/admin-protected actions with middleware chain.        |
| `src/lib/middleware/admin.middleware.ts`                 | Middleware | **Admin middleware** - Validates user role and adds `isAdmin`, `isModerator`, `role` to action context.                                  |
| `src/lib/actions/admin/admin-content-reports.actions.ts` | Action     | **Example admin actions** - Shows pattern for admin server actions with `adminActionClient`, filtering, pagination, and bulk operations. |
| `src/lib/validations/moderation.validation.ts`           | Validation | **Example admin validation schemas** - Contains `adminReportsFilterSchema` with pagination/filtering patterns to follow.                 |
| `src/lib/constants/enums.ts`                             | Constants  | **Role enum definitions** - Defines `USER.ROLE: ['user', 'moderator', 'admin']` and `UserRole` type.                                     |
| `src/lib/constants/action-names.ts`                      | Constants  | **Action name constants** - Centralized action names; needs new ADMIN entries for user management actions.                               |
| `src/lib/queries/base/query-context.ts`                  | Query      | **Query context utilities** - Defines `createAdminQueryContext()`, pagination options, and query context interfaces.                     |
| `src/lib/queries/base/base-query.ts`                     | Query      | **Base query class** - Abstract base with `applyPagination()`, `executeWithRetry()`, and database instance handling.                     |

### Medium Priority (UI Components)

| File Path                             | Category  | Relevance                                                                               |
| ------------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `src/components/ui/table.tsx`         | Component | **Table component** - Basic Table components for data display.                          |
| `src/components/ui/dialog.tsx`        | Component | **Dialog component** - Radix Dialog primitives for user detail/edit modals.             |
| `src/components/ui/alert-dialog.tsx`  | Component | **Alert dialog component** - Confirmation dialogs for role changes and account actions. |
| `src/components/ui/dropdown-menu.tsx` | Component | **Dropdown menu component** - Actions dropdown for per-row user operations.             |
| `src/components/ui/select.tsx`        | Component | **Select component** - For role selection dropdowns and filtering.                      |
| `src/components/ui/input.tsx`         | Component | **Input component** - With search icon support for user search functionality.           |
| `src/components/ui/badge.tsx`         | Component | **Badge component** - For displaying user roles and status indicators.                  |
| `src/components/ui/button.tsx`        | Component | **Button component** - With variants for actions.                                       |
| `src/components/ui/card.tsx`          | Component | **Card component** - For stats cards and user detail panels.                            |
| `src/components/ui/tabs.tsx`          | Component | **Tabs component** - For organizing user list, filters, and details views.              |
| `src/components/ui/avatar.tsx`        | Component | **Avatar component** - For displaying user profile images in the table.                 |

### Medium Priority (Reference Implementations)

| File Path                                                                      | Category  | Relevance                                                                                                                  |
| ------------------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/app/(app)/admin/featured-content/page.tsx`                                | Page      | **Example admin page** - Shows pattern for admin page with `requireModerator()`, data fetching, and component integration. |
| `src/app/(app)/admin/featured-content/components/featured-content-manager.tsx` | Component | **Example admin manager** - Shows pattern for admin management UI with tabs, stats cards, and CRUD operations.             |
| `src/app/(app)/admin/page.tsx`                                                 | Page      | **Admin dashboard** - Uses AdminLayout wrapper, shows how admin pages are structured.                                      |
| `src/components/layout/admin/admin-layout.tsx`                                 | Component | **Admin layout wrapper** - Layout component with AdminRouteGuard for permission-based routing.                             |
| `src/components/ui/admin/admin-route-guard.tsx`                                | Component | **Route guard component** - Server component that checks `getCurrentUserWithRole()` and redirects unauthorized users.      |

### Low Priority (Supporting Files)

| File Path                                   | Category  | Relevance                                                                                           |
| ------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------- |
| `src/hooks/use-server-action.ts`            | Hook      | **Server action hook** - Client hook for executing server actions with toast notifications.         |
| `src/hooks/use-admin-role.ts`               | Hook      | **Admin role hook** - Client-side hook using Clerk's `useUser()` to check role from publicMetadata. |
| `src/hooks/use-toggle.ts`                   | Hook      | **Toggle hook** - For managing boolean UI state (dialogs open/close).                               |
| `src/lib/services/user-sync.service.ts`     | Service   | **User sync service** - Shows how users are created/updated from Clerk data.                        |
| `src/lib/utils/action-error-handler.ts`     | Utility   | **Error handler** - Centralized error handling for server actions with Sentry integration.          |
| `src/lib/constants/defaults.ts`             | Constants | **Default values** - Contains `USER.ROLE: 'user'` default and pagination defaults.                  |
| `src/lib/test-ids/index.ts`                 | Utility   | **Test ID generator** - For creating consistent test IDs on UI components.                          |
| `src/lib/actions/users/username.actions.ts` | Action    | **User action example** - Shows pattern for authenticated user actions.                             |

## Architecture Insights

### Key Patterns Discovered

1. **Server Actions Pattern**: Uses `next-safe-action` with middleware chain:
   - `adminActionClient` = base client + adminMiddleware + sanitizationMiddleware + transactionMiddleware + databaseMiddleware
   - Actions parse `ctx.sanitizedInput` through Zod schema for type safety
   - Context includes `userId`, `isAdmin`, `isModerator`, `role`, `db`, `tx`

2. **Query/Facade Pattern**:
   - Queries extend `BaseQuery` for database operations with retry logic
   - Facades orchestrate business logic, caching, and coordinate multiple queries
   - Uses `QueryContext` for permission-based filtering

3. **Admin Authorization**:
   - Server-side: `requireModerator()` throws for non-mod/admin users
   - Actions: `adminMiddleware` validates role before action execution
   - Components: `AdminRouteGuard` server component redirects unauthorized users

4. **Role System**:
   - Roles: `'user' | 'moderator' | 'admin'`
   - Stored in database `users.role` column
   - Also synced to Clerk `publicMetadata.role` for client-side checks

5. **Existing Admin Structure**:
   - Admin pages under `src/app/(app)/admin/`
   - Pages use `force-dynamic` export
   - Fetch data server-side, pass to client components

### Integration Points Identified

1. **Clerk Integration**:
   - User data synced via `UserSyncService`
   - Role changes may need Clerk metadata updates
   - Consider using `clerkClient` for email verification status

2. **Database Schema**:
   - `users` table has all needed fields (role, isVerified, lockedUntil, lastActiveAt, failedLoginAttempts)
   - `userActivity` table available for activity history
   - Indexes exist for role and verification queries

3. **Cache Invalidation**:
   - `CacheService.users.profile()` caches user data
   - `CacheTagGenerators.user.update()` for invalidation
   - Role changes should invalidate user cache

## Files to Create

Based on discovery, these new files will be needed:

1. `src/lib/actions/admin/admin-users.actions.ts` - Server actions for user management
2. `src/lib/validations/admin-users.validation.ts` - Zod schemas for admin user operations
3. `src/app/(app)/admin/users/components/user-management-client.tsx` - Main client component
4. `src/app/(app)/admin/users/components/users-data-table.tsx` - TanStack Table component
5. `src/app/(app)/admin/users/components/user-role-dialog.tsx` - Role change confirmation dialog
6. `src/app/(app)/admin/users/components/user-details-dialog.tsx` - User details view dialog

## Files to Modify

1. `src/app/(app)/admin/users/page.tsx` - Replace placeholder with implementation
2. `src/lib/queries/users/users-query.ts` - Add methods for listing/filtering users
3. `src/lib/facades/users/users.facade.ts` - Add admin operations (role updates, account management)
4. `src/lib/validations/users.validation.ts` - Add admin-specific schemas
5. `src/lib/constants/action-names.ts` - Add ADMIN user management action names

## Summary

Step 2 completed successfully. Discovered 35+ relevant files across 6 categories:

- **Critical**: 6 files (existing placeholder page, schema, utils, query, facade, validation)
- **High**: 8 files (action client, middleware, example actions, patterns)
- **Medium**: 16 files (UI components, reference implementations)
- **Low**: 8 files (supporting hooks, services, utilities)

Key finding: An existing placeholder page exists at `src/app/(app)/admin/users/page.tsx` that uses the correct authorization pattern. The implementation can follow existing patterns from `featured-content` admin pages.
