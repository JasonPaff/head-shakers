# Step 2: AI-Powered File Discovery

**Started**: 2025-11-24T10:01:00Z
**Completed**: 2025-11-24T10:02:30Z
**Status**: Success

## Input

Refined feature request from Step 1 used to guide discovery.

## Agent Prompt Summary

- Search for existing newsletter notification implementation (toast, Ably)
- Find the application header where the bell should be added
- Find database schema files to understand existing patterns
- Find server actions patterns and existing notification-related actions
- Find validation schema patterns
- Find existing Ably/real-time implementation files
- Find admin-related components and pages

## Discovery Results

### Summary Statistics

| Metric                       | Count |
| ---------------------------- | ----- |
| Directories explored         | 15+   |
| Candidate files examined     | 80+   |
| Files requiring modification | 12    |
| Files needing creation       | 11    |
| Reference/pattern files      | 18    |

### Files Requiring Creation (Critical Priority)

| File                                                                      | Purpose                              |
| ------------------------------------------------------------------------- | ------------------------------------ |
| `src/lib/db/schema/notifications.schema.ts`                               | New notifications table schema       |
| `src/lib/actions/notifications/admin-notifications.actions.ts`            | Server actions for notification CRUD |
| `src/lib/facades/notifications/admin-notifications.facade.ts`             | Business logic layer                 |
| `src/lib/queries/notifications/admin-notifications.query.ts`              | Database queries                     |
| `src/lib/validations/admin-notifications.validation.ts`                   | Zod validation schemas               |
| `src/components/layout/app-header/components/admin-notification-bell.tsx` | Bell component with Radix Popover    |
| `src/components/layout/app-header/components/admin-notification-list.tsx` | Scrollable notification list         |
| `src/components/layout/app-header/components/admin-notification-item.tsx` | Individual notification items        |
| Database migration file                                                   | Create notifications table           |

### Files Requiring Modification (High Priority)

| File                                                                       | Change Needed                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------- |
| `src/components/layout/app-header/components/app-header-notifications.tsx` | Replace placeholder with full notification bell |
| `src/components/admin/newsletter-signup-notifications.tsx`                 | Add database persistence alongside toast        |
| `src/components/layout/app-header/app-header.tsx`                          | Ensure proper layout integration                |
| `src/lib/services/ably.service.ts`                                         | May need additional publish methods             |
| `src/lib/constants/ably-channels.ts`                                       | Review channel configuration                    |
| `src/lib/facades/newsletter/newsletter.facade.ts`                          | Add notification record creation                |
| `src/lib/constants/operations.ts`                                          | Add NOTIFICATIONS operations                    |
| `src/lib/constants/action-names.ts`                                        | Add NOTIFICATIONS action names                  |

### Reference Files (Patterns)

| File                                                                 | Pattern                            |
| -------------------------------------------------------------------- | ---------------------------------- |
| `src/components/ui/popover.tsx`                                      | Radix Popover component            |
| `src/components/ui/badge.tsx`                                        | Badge with CVA variants            |
| `src/lib/db/schema/launch.schema.ts`                                 | Similar notification table pattern |
| `src/lib/db/schema/newsletter-signups.schema.ts`                     | Newsletter schema conventions      |
| `src/lib/actions/launch-notifications/admin.actions.ts`              | Admin action patterns              |
| `src/lib/facades/launch-notifications/launch-notification.facade.ts` | Facade API pattern                 |
| `src/lib/validations/launch-notification.validations.ts`             | Drizzle-zod patterns               |
| `src/lib/queries/launch-notifications/launch-notification-query.ts`  | Query class pattern                |
| `src/hooks/use-admin-role.ts`                                        | Admin role checking                |
| `src/hooks/use-server-action.ts`                                     | Server action hook pattern         |

### Architecture Insights

**Current Notification Flow:**

1. Newsletter signup triggers Ably event
2. Admin page subscribes to channel
3. Toast displayed on message received

**New Flow:**

1. Newsletter signup creates notification record in DB
2. Publishes Ably event for real-time badge update
3. Bell component shows unread count
4. Popover displays persistent notification list
5. Click marks as read with visual feedback

**Integration Points:**

1. NewsletterFacade.subscribeAsync - create notification record
2. AppHeaderNotifications - replace with full bell component
3. Ably channel subscription - update badge in real-time
4. adminActionClient - protect notification actions

## Validation Results

| Check                         | Result              |
| ----------------------------- | ------------------- |
| Minimum 3 files discovered    | ✅ Pass (30+ files) |
| Files categorized by priority | ✅ Pass             |
| All critical files identified | ✅ Pass             |
| Pattern files documented      | ✅ Pass             |
| File paths validated          | ✅ Pass             |
