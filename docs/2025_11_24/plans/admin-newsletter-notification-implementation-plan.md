# Admin Real-Time Newsletter Signup Notifications - Implementation Plan

**Generated**: 2025-11-24
**Original Request**: As an admin I want to receive an Ably realtime notification whenever someone signs up for the newsletter
**Status**: Ready for Implementation

---

## Overview

**Estimated Duration**: 4-6 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

Implement real-time notifications to admin users when new newsletter signups occur. The system will use Ably's server-side REST API to publish notifications from the newsletter facade after successful subscriptions, and a client-side component will listen for these events and display toast notifications. The implementation follows the existing fire-and-forget pattern used for welcome emails, ensuring notification failures don't impact the subscription flow.

## Prerequisites

- [ ] Ably account with valid API keys (NEXT_PUBLIC_ABLY_API_KEY already exists for client, ABLY_API_KEY needed for server)
- [ ] Admin users have role set to 'admin' in users table
- [ ] Existing newsletter subscription flow is functional

## Implementation Steps

### Step 1: Create Ably Channel Constants

**What**: Define centralized constants for Ably channel names, message types, and TypeScript payload types
**Why**: Ensures type safety and consistency between server-side publishers and client-side subscribers
**Confidence**: High

**Documentation Lookup (Required):**
Before implementing, use the Ref tool to look up the latest Ably documentation:
```
1. Use mcp__Ref__ref_search_documentation with query: "Ably channels Next.js TypeScript"
2. Use mcp__Ref__ref_read_url to read the relevant documentation URLs returned
3. Focus on: channel naming conventions, message structure, and TypeScript types
```

**Files to Create:**
- `src/lib/constants/ably-channels.ts` - Channel name constants, message type definitions, and TypeScript interfaces for notification payloads

**Changes:**
- Define ABLY_CHANNELS constant with ADMIN_NEWSLETTER_SIGNUPS channel name
- Define ABLY_MESSAGE_TYPES constant with NEW_SIGNUP message type
- Export NewsletterSignupNotificationPayload TypeScript interface with email (masked), signupId, timestamp, and optional userId fields
- Add JSDoc comments explaining channel security model and payload structure

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Constants file exports ABLY_CHANNELS and ABLY_MESSAGE_TYPES objects
- [ ] NewsletterSignupNotificationPayload interface matches newsletter schema fields
- [ ] All validation commands pass

---

### Step 2: Add Newsletter Notification Operation Constant

**What**: Add NOTIFY_ADMIN_SIGNUP operation constant to OPERATIONS.NEWSLETTER object
**Why**: Maintains consistency with existing operation tracking pattern for Sentry logging
**Confidence**: High

**Files to Modify:**
- `src/lib/constants/operations.ts` - Add new operation constant

**Changes:**
- Add NOTIFY_ADMIN_SIGNUP: 'notify_admin_newsletter_signup' to OPERATIONS.NEWSLETTER object (after SEND_WELCOME_EMAIL)
- Maintain alphabetical ordering within the NEWSLETTER section

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] NOTIFY_ADMIN_SIGNUP constant is exported and accessible
- [ ] TypeScript Operation type includes the new constant
- [ ] All validation commands pass

---

### Step 3: Create Server-Side Ably Service

**What**: Implement AblyService class for server-side REST API communication with circuit breaker and retry logic
**Why**: Provides reliable, monitored notification delivery following project patterns for external services
**Confidence**: High

**Documentation Lookup (Required):**
Before implementing, use the Ref tool to look up the latest Ably REST API documentation:
```
1. Use mcp__Ref__ref_search_documentation with query: "Ably REST API publish message Node.js server-side"
2. Use mcp__Ref__ref_search_documentation with query: "Ably Next.js server components App Router"
3. Use mcp__Ref__ref_read_url to read the relevant documentation URLs returned
4. Focus on:
   - REST client initialization and authentication
   - Publishing messages to channels from server-side code
   - Error handling and best practices for serverless environments
   - TypeScript types for Ably REST client
```

**Files to Create:**
- `src/lib/services/ably.service.ts` - Server-side Ably REST client with publishNewsletterSignupNotification method

**Changes:**
- Import Ably REST client from ably package
- Create AblyService class following ResendService pattern structure
- Implement publishNewsletterSignupNotificationAsync static method accepting NewsletterSignupNotificationPayload
- Use circuitBreakers.externalService for resilience with CONFIG.EXTERNAL_SERVICES.ABLY settings
- Implement withDatabaseRetry wrapper for retry logic (max 2 retries per CONFIG)
- Add comprehensive Sentry breadcrumbs for operation tracking (category: EXTERNAL_SERVICE)
- Add try-catch wrapper to prevent exceptions from bubbling up (fire-and-forget pattern)
- Return boolean success indicator
- Mask email in all Sentry logs (first 3 characters only)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] AblyService class exports static publishNewsletterSignupNotificationAsync method
- [ ] Method uses circuit breaker pattern matching ResendService
- [ ] Sentry integration includes breadcrumbs and error capture
- [ ] All validation commands pass

---

### Step 4: Integrate Ably Notification in Newsletter Facade

**What**: Add fire-and-forget Ably notification call after successful new newsletter subscriptions
**Why**: Enables real-time admin notifications without impacting subscription reliability
**Confidence**: High

**Files to Modify:**
- `src/lib/facades/newsletter/newsletter.facade.ts` - Add notification trigger after line 157

**Changes:**
- Import AblyService and OPERATIONS.NEWSLETTER.NOTIFY_ADMIN_SIGNUP
- After new subscription creation (line 157), add try-catch block for notification
- Add Sentry breadcrumb before notification attempt
- Call void AblyService.publishNewsletterSignupNotificationAsync with payload (email masked, signupId, timestamp, userId)
- Use fire-and-forget pattern with .catch() handler identical to welcome email pattern (lines 173-184)
- Ensure notification is only sent for new signups, NOT resubscriptions or existing subscribers
- Place notification code between welcome email logic and return statement

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Notification fires only for new subscriptions (not resubscribes or duplicates)
- [ ] Fire-and-forget pattern prevents notification failures from affecting subscription
- [ ] Sentry tracking matches existing welcome email pattern
- [ ] All validation commands pass

---

### Step 5: Create Admin Newsletter Signup Notification Component

**What**: Build React component that listens to Ably channel and displays toast notifications for admin users
**Why**: Provides real-time UI feedback to admins monitoring dashboard
**Confidence**: High

**Documentation Lookup (Required):**
Before implementing, use the Ref tool to look up the latest Ably React documentation:
```
1. Use mcp__Ref__ref_search_documentation with query: "Ably React hooks useChannel Next.js"
2. Use mcp__Ref__ref_search_documentation with query: "Ably ably/react subscribe messages TypeScript"
3. Use mcp__Ref__ref_read_url to read the relevant documentation URLs returned
4. Focus on:
   - useChannel hook API and usage patterns
   - Message callback signature and types
   - Connection state handling
   - Best practices for React 19 and Next.js App Router
   - Proper cleanup and unsubscription
```

**Files to Create:**
- `src/components/admin/newsletter-signup-notifications.tsx` - Client component with Ably subscription and toast UI

**Changes:**
- Mark file as 'use client' directive
- Import useChannel from ably/react, useAdminRole hook, and toast from sonner
- Import channel constants from ably-channels
- Create NewsletterSignupNotifications component
- Use useAdminRole hook to get isAdmin status
- Early return null if not admin (role-based access control)
- Use useChannel hook to subscribe to ADMIN_NEWSLETTER_SIGNUPS channel
- Filter messages by NEW_SIGNUP message type
- Parse message data as NewsletterSignupNotificationPayload
- Display toast notification with signup details (masked email, timestamp)
- Add error boundary for channel subscription failures
- Include component display name for debugging

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component only renders content for admin users
- [ ] useChannel hook properly subscribes to correct channel and message type
- [ ] Toast notifications display with appropriate formatting
- [ ] All validation commands pass

---

### Step 6: Integrate Notification Component into Admin Dashboard

**What**: Add NewsletterSignupNotifications component to admin dashboard page
**Why**: Enables admins to receive notifications while viewing the admin area
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/admin/page.tsx` - Add notification component

**Changes:**
- Import NewsletterSignupNotifications component
- Add component inside AdminLayout wrapper (before or after existing Cards grid)
- Ensure component is within AblyProvider context (inherited from root layout)
- Position component to not interfere with existing dashboard UI

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component renders on admin dashboard
- [ ] Component is within AblyProvider context tree
- [ ] UI layout is not disrupted by component addition
- [ ] All validation commands pass

---

### Step 7: Add Server-Side Environment Variable

**What**: Document ABLY_API_KEY environment variable requirement for server-side publishing
**Why**: Server-side Ably REST client requires API key for authentication
**Confidence**: High

**Files to Modify:**
- `.env` - Add ABLY_API_KEY variable

**Changes:**
- Add ABLY_API_KEY environment variable with appropriate API key value
- Add comment explaining this is for server-side REST API publishing (distinct from NEXT_PUBLIC_ABLY_API_KEY)
- Verify existing NEXT_PUBLIC_ABLY_API_KEY is present for client-side subscriptions

**Validation Commands:**
```bash
npm run typecheck
```

**Success Criteria:**
- [ ] ABLY_API_KEY environment variable is set
- [ ] Both server and client Ably keys are configured
- [ ] Type checking passes (no missing env var TypeScript errors)

---

### Step 8: Verify Ably Package Installation

**What**: Verify ably package is installed with REST client support
**Why**: Server-side AblyService requires Ably REST client from ably package
**Confidence**: High

**Documentation Lookup (Required):**
Before implementing, use the Ref tool to check the latest Ably package version:
```
1. Use mcp__Ref__ref_search_documentation with query: "Ably npm package installation Next.js 2024"
2. Use mcp__Ref__ref_read_url to read the relevant documentation URLs returned
3. Focus on:
   - Current recommended package version
   - Any breaking changes in recent versions
   - Peer dependencies for Next.js/React
```

**Files to Modify:**
- None (verification step)

**Changes:**
- Check package.json for ably package dependency
- Verify version supports both Realtime and REST clients
- Run npm install if package is missing or outdated

**Validation Commands:**
```bash
npm run typecheck
```

**Success Criteria:**
- [ ] ably package is present in package.json dependencies
- [ ] Package version is compatible with REST API (v2.x recommended)
- [ ] Type checking passes without import errors

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Fire-and-forget pattern ensures subscription succeeds even if notification fails
- [ ] Only admin users receive notifications (role-based access control verified)
- [ ] Email addresses are properly masked in all Sentry logs (privacy protection)
- [ ] Channel naming follows security best practice (admin: prefix for privileged channels)
- [ ] Circuit breaker protects against Ably service failures
- [ ] No notification sent for resubscriptions or existing subscribers (only new signups)

## Notes

**Architecture Decisions:**
- Using REST API for server-side publishing (not Realtime) to avoid persistent connections in serverless environment
- Fire-and-forget pattern matches existing welcome email implementation for consistency
- Notification component uses client-side role checking for immediate UI response; server-side publishing has no access control since facade runs in secure context
- Email masking (first 3 chars + '***') balances admin usefulness with privacy best practices
- Channel name uses 'admin:' prefix to clearly indicate privileged access channel

**Security Considerations:**
- Ably channel capabilities should restrict ADMIN_NEWSLETTER_SIGNUPS channel to admin users via Ably dashboard rules or token auth (future enhancement)
- Current implementation relies on client-side role check; malicious users could subscribe but would need to know channel name
- Email addresses are masked in transit to limit exposure

**Potential Risks:**
- Low: Ably service outage would prevent notifications but not impact subscriptions (by design)
- Low: High signup volume could exceed Ably rate limits; circuit breaker will trip to protect system
- Medium: Client-side only role check means channel security depends on obscurity; consider Ably capability tokens for production

**Future Enhancements:**
- Implement Ably token authentication with channel-specific capabilities for true server-side access control
- Add notification preferences to admin user settings
- Create notification history/log viewer in admin panel
- Expand to other admin notification types (reports, user registrations, etc.)

---

## File Discovery Summary

### Files to Create (3)
1. `src/lib/constants/ably-channels.ts` - Channel constants and payload types
2. `src/lib/services/ably.service.ts` - Server-side Ably REST service
3. `src/components/admin/newsletter-signup-notifications.tsx` - Admin notification component

### Files to Modify (4)
1. `src/lib/constants/operations.ts` - Add NOTIFY_ADMIN_SIGNUP operation
2. `src/lib/facades/newsletter/newsletter.facade.ts` - Add notification trigger
3. `src/app/(app)/admin/page.tsx` - Add notification component
4. `.env` - Add ABLY_API_KEY

### Reference Files (Key Patterns)
- `src/lib/services/resend.service.ts` - Circuit breaker pattern
- `src/components/layout/ably-provider.tsx` - Client Ably setup
- `src/app/examples/ably/page.tsx` - useChannel hook usage
- `src/hooks/use-admin-role.ts` - Admin role checking

---

## Documentation Reference Summary

**Ably Documentation to Consult:**
| Step | Search Queries |
|------|----------------|
| Step 1 | "Ably channels Next.js TypeScript" |
| Step 3 | "Ably REST API publish message Node.js server-side", "Ably Next.js server components App Router" |
| Step 5 | "Ably React hooks useChannel Next.js", "Ably ably/react subscribe messages TypeScript" |
| Step 7 | "Ably API key authentication REST server-side" |
| Step 8 | "Ably npm package installation Next.js 2024" |

Use `mcp__Ref__ref_search_documentation` to search and `mcp__Ref__ref_read_url` to read the documentation before implementing each Ably-related step.
