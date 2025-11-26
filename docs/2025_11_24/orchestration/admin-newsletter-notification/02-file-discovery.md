# Step 2: File Discovery

**Status**: Completed
**Started**: 2025-11-24T00:01:00Z
**Completed**: 2025-11-24T00:02:30Z
**Duration**: ~90 seconds

## Input: Refined Feature Request

As an admin user with the appropriate role, I want to receive an Ably real-time notification whenever a new user successfully signs up for the newsletter, allowing me to stay informed of subscriber growth and engagement in real-time. When a newsletter subscription is created through the application (either during user registration or through a dedicated signup form), the system should broadcast a notification to all authenticated admin users via an Ably channel dedicated to newsletter events. The notification should include relevant details about the new subscriber such as their email address, subscription timestamp, and any available user metadata to help admins quickly identify who subscribed. This notification should be delivered instantly through Ably's real-time messaging infrastructure, enabling admins monitoring the admin dashboard to see new signups without needing to refresh or query the database. The implementation should leverage the existing Clerk admin role system to ensure only users with proper authorization receive these notifications, and should integrate cleanly with the current newsletter subscription server action to trigger the notification immediately after a successful subscription record is saved to the database. The solution should include proper error handling and Sentry monitoring to track any issues with the notification delivery, ensuring reliability of the real-time notification system without impacting the normal newsletter signup flow.

## Discovery Statistics

- **Directories Explored**: 8 main directories
- **Candidate Files Examined**: 35+
- **Highly Relevant Files**: 18
- **Supporting Files**: 12

## Discovered Files by Priority

### Critical Priority (Core Implementation)

| File                                               | Relevance                                                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/lib/actions/newsletter/newsletter.actions.ts` | Current newsletter subscription server action - where Ably notification trigger will be added            |
| `src/lib/facades/newsletter/newsletter.facade.ts`  | Business logic for subscriptions - perfect location for Ably notifications after successful subscription |
| `src/lib/db/schema/newsletter-signups.schema.ts`   | Database schema - defines data structure for notification payload                                        |
| `src/components/layout/ably-provider.tsx`          | Client-side Ably provider wrapper - pattern to follow                                                    |
| `src/app/examples/ably/page.tsx`                   | Example showing useChannel hook and message publishing patterns                                          |
| `src/lib/utils/admin.utils.ts`                     | Server-side admin role checking utilities                                                                |
| `src/lib/middleware/admin.middleware.ts`           | Admin middleware pattern for server actions                                                              |
| `src/hooks/use-admin-role.ts`                      | Client-side hook for checking admin/moderator role                                                       |
| `src/components/ui/admin/admin-route-guard.tsx`    | Admin route protection component pattern                                                                 |

### High Priority (Supporting Implementation)

| File                                               | Relevance                                                     |
| -------------------------------------------------- | ------------------------------------------------------------- |
| `src/lib/constants/operations.ts`                  | Operation name constants - add NEWSLETTER.NOTIFY_ADMIN_SIGNUP |
| `src/lib/constants/action-names.ts`                | Centralized action names                                      |
| `src/lib/constants/sentry.ts`                      | Sentry configuration constants                                |
| `src/lib/constants/config.ts`                      | Application config including EXTERNAL_SERVICES.ABLY           |
| `src/lib/utils/next-safe-action.ts`                | Server action client patterns                                 |
| `src/lib/utils/action-error-handler.ts`            | Error handling utilities                                      |
| `src/lib/queries/newsletter/newsletter.queries.ts` | Newsletter database queries                                   |
| `src/lib/validations/newsletter.validation.ts`     | Zod schemas for newsletter                                    |

### Medium Priority (Admin Dashboard Integration)

| File                                           | Relevance                                      |
| ---------------------------------------------- | ---------------------------------------------- |
| `src/app/(app)/admin/page.tsx`                 | Main admin dashboard - add notification widget |
| `src/components/layout/admin/admin-layout.tsx` | Admin layout wrapper                           |
| `src/lib/actions/admin/admin-users.actions.ts` | Example admin action patterns                  |

### Low Priority (Reference & Utilities)

| File                                 | Relevance                                  |
| ------------------------------------ | ------------------------------------------ |
| `src/lib/services/resend.service.ts` | Pattern for external service integration   |
| `src/lib/db/schema/system.schema.ts` | Existing notification schema for reference |
| `src/lib/db/schema/users.schema.ts`  | User role structure                        |

## Architecture Insights

### Existing Patterns Discovered

1. **Ably Integration**:
   - Client-side only implementation currently exists
   - Uses ably/react hooks (useChannel, useConnectionStateListener)
   - No server-side Ably publishing utilities - will need to create
   - Client configured with NEXT_PUBLIC_ABLY_API_KEY

2. **Newsletter Flow**:
   - Action → Facade → Query three-layer architecture
   - Transaction-based with comprehensive Sentry integration
   - Fire-and-forget pattern for welcome email
   - Same pattern can be used for Ably notifications

3. **Admin Role System**:
   - Database-driven roles (admin, moderator, user) stored in users.role
   - Server-side: getCurrentUserWithRole() and admin.middleware
   - Client-side: useAdminRole() hook using Clerk publicMetadata
   - AdminRouteGuard component for route protection

4. **Error Handling & Monitoring**:
   - Consistent Sentry context setting at action start
   - Breadcrumbs for successful and failed operations
   - Operation names centralized in constants/operations.ts
   - Error masking for sensitive data

### Integration Points Identified

1. **Primary Integration Point**: `newsletter.facade.ts` line 157 (after new signup creation)
   - Add Ably notification publishing here
   - Use try-catch to prevent notification failures from affecting subscription
   - Follow same pattern as welcome email (fire-and-forget)

2. **Admin Dashboard Integration**: `admin/page.tsx` or dedicated admin component
   - Subscribe to Ably channel using useChannel hook
   - Filter notifications client-side based on useAdminRole()
   - Display toast or live feed of new signups

3. **Channel Strategy**:
   - Suggested channel name: "admin:newsletter-signups"
   - Message type: "new-signup"
   - Payload: { email: masked, signupId, timestamp, userId? }

### Missing Infrastructure to Create

1. **Server-Side Ably Service** (`src/lib/services/ably.service.ts`):
   - Ably REST client initialization with server-side API key
   - publishNewsletterSignupNotification method
   - Error handling and Sentry integration
   - Circuit breaker pattern

2. **Ably Channel Constants** (`src/lib/constants/ably-channels.ts`):
   - Channel names: ADMIN_NEWSLETTER_SIGNUPS
   - Message types: NEWSLETTER_SIGNUP_CREATED
   - Type definitions for message payloads

3. **Admin Notification Component** (`src/components/admin/newsletter-signup-notifications.tsx`):
   - useChannel hook to subscribe
   - useAdminRole to gate access
   - Toast or notification UI for new signups

4. **Environment Variables**:
   - ABLY_API_KEY (server-side, for publishing)
   - NEXT_PUBLIC_ABLY_API_KEY (already exists for client)

## Validation Results

| Check                  | Result  | Notes                                  |
| ---------------------- | ------- | -------------------------------------- |
| Minimum Files          | ✅ Pass | 18 highly relevant files discovered    |
| AI Analysis Quality    | ✅ Pass | Detailed reasoning for each file       |
| File Validation        | ✅ Pass | All paths validated                    |
| Smart Categorization   | ✅ Pass | Files categorized by priority          |
| Comprehensive Coverage | ✅ Pass | Covers all architectural layers        |
| Pattern Recognition    | ✅ Pass | Identified existing patterns to follow |
