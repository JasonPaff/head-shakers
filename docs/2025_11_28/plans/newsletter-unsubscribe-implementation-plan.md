# Implementation Plan: Newsletter Unsubscribe Feature

## Overview

**Estimated Duration**: 2-3 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

Add unsubscribe functionality to the footer newsletter component by checking user authentication status and subscription state, then conditionally rendering either the subscription form or an unsubscribe interface with a server action to handle unsubscription.

## Prerequisites

- [x] Database already has `unsubscribedAt` field in `newsletterSignups` schema
- [x] Query layer has `unsubscribeAsync` and `isActiveSubscriberAsync` methods
- [x] Constants `ACTION_NAMES.NEWSLETTER.UNSUBSCRIBE` and `OPERATIONS.NEWSLETTER.UNSUBSCRIBE` already defined
- [x] User schema has email field for matching subscription records

## Implementation Steps

### Step 1: Add Unsubscribe Validation Schema

**What**: Create Zod validation schema for unsubscribe action input
**Why**: Type-safe validation following project conventions with drizzle-zod integration
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/newsletter.validation.ts` - Add unsubscribe schema and type exports

**Changes:**

- Add `unsubscribeFromNewsletterSchema` using Zod with email validation
- Add type exports `UnsubscribeFromNewsletter` and `UnsubscribeFromNewsletterInput`
- Schema should validate email format and length matching existing subscription schema patterns

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Unsubscribe schema validates email format
- [ ] Type exports available for use in actions
- [ ] All validation commands pass

---

### Step 2: Add Unsubscribe Facade Method

**What**: Implement `unsubscribeAsync` business logic method in NewsletterFacade
**Why**: Centralize business logic for unsubscription with proper error handling and Sentry integration
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/newsletter/newsletter.facade.ts` - Add unsubscribeAsync static method

**Changes:**

- Add `unsubscribeAsync` method accepting email and optional dbInstance
- Use `executeFacadeOperation` wrapper for consistent error handling
- Call `NewsletterQuery.unsubscribeAsync` to perform database update
- Add breadcrumb logging for unsubscribe operations
- Handle case where email doesn't exist (return success for privacy)
- Return result indicating success/failure

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Method signature matches facade patterns
- [ ] Uses executeFacadeOperation wrapper
- [ ] Includes proper Sentry breadcrumbs
- [ ] Handles non-existent emails gracefully
- [ ] All validation commands pass

---

### Step 3: Add Unsubscribe Server Action

**What**: Create `unsubscribeFromNewsletterAction` using next-safe-action
**Why**: Provide server-side mutation endpoint with validation and error handling
**Confidence**: High

**Files to Modify:**

- `src/lib/actions/newsletter/newsletter.actions.ts` - Add unsubscribe action

**Changes:**

- Add `unsubscribeFromNewsletterAction` using `publicActionClient`
- Use `ACTION_NAMES.NEWSLETTER.UNSUBSCRIBE` metadata
- Set `isTransactionRequired: true`
- Apply `unsubscribeFromNewsletterSchema` as input validation
- Get userId via `getUserIdAsync` for authorization check
- Call `NewsletterFacade.unsubscribeAsync` with email and transaction db
- Use `withActionErrorHandling` wrapper with `OPERATIONS.NEWSLETTER.UNSUBSCRIBE`
- Return `actionSuccess` with privacy-preserving message
- Add actionBreadcrumb calls for tracking

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Action follows existing subscribeToNewsletterAction pattern
- [ ] Includes proper Sentry context and breadcrumbs
- [ ] Authorization checks user authentication
- [ ] Returns consistent success message
- [ ] All validation commands pass

---

### Step 4: Convert Footer Component to Server Component with Client Islands

**What**: Refactor FooterNewsletter to check subscription status server-side and conditionally render subscribe or unsubscribe UI
**Why**: Leverage server components for auth checks while keeping interactive portions as client components
**Confidence**: Medium

**Files to Create:**

- `src/components/layout/app-footer/components/footer-newsletter-subscribe.tsx` - Client component for subscription form
- `src/components/layout/app-footer/components/footer-newsletter-unsubscribe.tsx` - Client component for unsubscribe interface

**Files to Modify:**

- `src/components/layout/app-footer/components/footer-newsletter.tsx` - Convert to async server component wrapper

**Changes:**

**FooterNewsletter (parent server component):**

- Remove 'use client' directive to make it a server component
- Import getUserIdAsync from auth-utils
- Import UsersFacade to get user email
- Import NewsletterQuery to check subscription status
- Check if user is authenticated via getUserIdAsync
- If authenticated, get user record via UsersFacade.getUserByIdAsync
- If user exists, check NewsletterQuery.isActiveSubscriberAsync with user email
- Conditionally render FooterNewsletterSubscribe or FooterNewsletterUnsubscribe based on status
- Maintain existing container structure with aria-labelledby and role

**FooterNewsletterSubscribe (new client component):**

- Move existing subscription form logic from FooterNewsletter
- Keep all existing functionality: form handling, useServerAction, field components
- Export as named export following project conventions
- Apply withFocusManagement wrapper

**FooterNewsletterUnsubscribe (new client component):**

- Create 'use client' component with similar structure to subscribe component
- Accept userEmail as prop for display purposes
- Use useServerAction hook with unsubscribeFromNewsletterAction
- Display current subscription status message
- Include unsubscribe button using Button component with destructive variant
- Show user email in UI for confirmation
- Handle loading states during action execution
- Apply withFocusManagement wrapper for consistency

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Server component properly checks auth and subscription status
- [ ] Subscribe client component maintains existing functionality
- [ ] Unsubscribe client component follows UI patterns with Radix and Tailwind
- [ ] Components use proper test IDs via generateTestId
- [ ] Breadcrumb tracking included in unsubscribe component
- [ ] All validation commands pass

---

### Step 5: Handle Edge Cases and Privacy Considerations

**What**: Review and ensure privacy-preserving behavior and proper error handling
**Why**: Prevent email enumeration and ensure robust user experience
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/newsletter/newsletter.facade.ts` - Review unsubscribeAsync privacy handling
- `src/lib/actions/newsletter/newsletter.actions.ts` - Review action error messages

**Changes:**

- Ensure unsubscribe facade returns success even for non-existent emails (privacy)
- Verify error messages don't reveal subscription status to unauthenticated users
- Confirm masked email logging in Sentry breadcrumbs
- Validate that only authenticated users can access unsubscribe interface
- Test that unsubscribing updates `unsubscribedAt` timestamp correctly
- Verify resubscribe flow still works after unsubscribing

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] No email enumeration vulnerabilities
- [ ] Consistent success messages regardless of email existence
- [ ] Masked emails in all logging
- [ ] Authorization checks prevent unauthorized unsubscribes
- [ ] All validation commands pass

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Test manually: anonymous user sees subscribe form
- [ ] Test manually: authenticated non-subscriber sees subscribe form
- [ ] Test manually: authenticated subscriber sees unsubscribe interface
- [ ] Test manually: unsubscribe action works and updates database
- [ ] Test manually: after unsubscribing, can resubscribe successfully
- [ ] Verify Sentry breadcrumbs are logged correctly for both actions

## Notes

**Architecture Decisions:**

1. **Server Component Pattern (High Confidence)**: Using server components for the parent wrapper allows us to check authentication and subscription status on the server, avoiding client-side flicker and reducing client bundle size. Client components are used only for the interactive subscribe/unsubscribe forms.

2. **Query vs Facade for Subscription Check (High Confidence)**: Using NewsletterQuery.isActiveSubscriberAsync directly in the server component is appropriate as this is a simple read operation without complex business logic. The facade is used for mutations (subscribe/unsubscribe).

3. **Privacy-Preserving Unsubscribe (High Confidence)**: Following the existing subscribe pattern, the unsubscribe action should return success regardless of whether the email exists to prevent email enumeration attacks.

4. **Email Source (High Confidence)**: Using the user's database email (from users table) rather than requiring email input for unsubscribe, since authenticated users have verified emails in the system. This improves UX and security.

**Assumptions Requiring Confirmation:**

- Users table email field is kept in sync with Clerk authentication email
- Only authenticated users should see the unsubscribe interface (no magic link unsubscribe)
- Unsubscribe should be a soft delete (set unsubscribedAt) not hard delete - already confirmed in schema
- The footer newsletter component is rendered on all pages for both authenticated and anonymous users

**Alternative Approaches Considered:**

1. **Client-Side Auth Check**: Could use Clerk's useUser hook in client component, but this causes layout shift and exposes auth logic to client
2. **Separate Unsubscribe Page**: Could create dedicated unsubscribe route, but inline footer unsubscribe is better UX
3. **Magic Link Unsubscribe**: Could send unsubscribe links via email, but adds complexity and isn't requested
