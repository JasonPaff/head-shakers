# Footer Newsletter Subscription Implementation Plan

**Generated**: 2025-11-29
**Original Request**: Implement newsletter subscribe/unsubscribe feature in app footer placeholder with differentiated experiences for authenticated and public users

## Refined Request

Implement a newsletter subscription component in the footer's designated placeholder below the social media links that serves both authenticated and public users with tailored experiences. Public users will encounter a subscription form with an email input field and submit button that displays a success toast upon completion; authenticated users who are not subscribed will see the same subscription form but will experience optimistic UI updates—the component will immediately render the unsubscribe state upon form submission without waiting for server confirmation, showing a toast only if the subscribeToNewsletterAction encounters an error. Authenticated users who are actively subscribed will see a distinct unsubscribe interface displaying their subscription status with a subtle destructive-variant unsubscribe button; when they click unsubscribe and invoke unsubscribeFromNewsletterAction, the UI will optimistically revert to the subscribe form immediately, with error toasts appearing only if the action fails.

---

## Overview

**Estimated Duration**: 4-6 hours
**Complexity**: Medium
**Risk Level**: Medium

## Quick Summary

Implement a newsletter subscription component in the footer that provides different experiences for public and authenticated users. Public users see a standard subscription form with toast notifications, while authenticated users experience optimistic UI updates that immediately reflect state changes (subscribe/unsubscribe) without waiting for server confirmation, displaying errors only when actions fail.

## Prerequisites

- [ ] Verify all existing infrastructure files are accessible and exported correctly
- [ ] Confirm `useServerAction` hook supports `isDisableToast` option
- [ ] Ensure `NewsletterFacade.getIsActiveSubscriberAsync()` is available
- [ ] Verify `getUserIdAsync()` and `UsersFacade.getEmailByUserIdAsync()` are working

## File Discovery Summary

### Files to Create

| File                                                                            | Purpose                                |
| ------------------------------------------------------------------------------- | -------------------------------------- |
| `src/components/layout/app-footer/components/footer-newsletter-subscribe.tsx`   | Client component for subscription form |
| `src/components/layout/app-footer/components/footer-newsletter-unsubscribe.tsx` | Client component for unsubscribe UI    |

### Files to Modify

| File                                                                | Purpose                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/components/layout/app-footer/components/footer-newsletter.tsx` | Transform placeholder to server component orchestrator |

### Existing Infrastructure (No Changes Needed)

- `src/lib/actions/newsletter/newsletter.actions.ts` - Server actions
- `src/lib/facades/newsletter/newsletter.facade.ts` - Business logic
- `src/hooks/use-server-action.ts` - Hook with optimistic support
- `src/components/ui/form/index.tsx` - Form system
- `src/utils/auth-utils.ts` - Authentication utilities

---

## Implementation Steps

### Step 1: Create Footer Newsletter Subscribe Client Component

**What**: Create the client component that handles both public and authenticated user subscription flows with conditional optimistic UI updates
**Why**: This component must handle two distinct user experiences - toast-based feedback for public users and optimistic updates for authenticated users
**Confidence**: High

**Files to Create:**

- `src/components/layout/app-footer/components/footer-newsletter-subscribe.tsx`

**Changes:**

- Create `FooterNewsletterSubscribe` client component accepting `userEmail?: string` and `onOptimisticSubscribe?: () => void` props
- Implement `useAppForm` with `insertNewsletterSignupSchema` for email validation
- Add conditional `useServerAction` call with `isDisableToast: true` when `userEmail` is provided (authenticated)
- Implement form submission handler that calls `onOptimisticSubscribe` for authenticated users before server action
- Use `TextField` component for email input with proper labels and error handling
- Add `Button` component for submit with loading states
- Include breadcrumb context for server action: `{ area: 'layout', feature: 'footer-newsletter', action: 'subscribe' }`
- Add test IDs using `generateTestId('layout', 'app-footer', 'newsletter-subscribe-form')` pattern
- Style with Tailwind CSS following footer component patterns (dark background, gradient accents, focus rings)
- Add proper ARIA labels and accessibility attributes
- Implement focus management for form fields

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component accepts optional `userEmail` and `onOptimisticSubscribe` props
- [ ] Form validates email input using Zod schema
- [ ] Authenticated users trigger optimistic callback before server action
- [ ] Public users see toast on successful subscription
- [ ] All validation commands pass
- [ ] Test IDs are properly generated and applied

---

### Step 2: Create Footer Newsletter Unsubscribe Client Component

**What**: Create the client component that displays subscription status and handles unsubscribe with optimistic UI rollback
**Why**: Authenticated subscribed users need a distinct interface to manage their subscription with immediate feedback
**Confidence**: High

**Files to Create:**

- `src/components/layout/app-footer/components/footer-newsletter-unsubscribe.tsx`

**Changes:**

- Create `FooterNewsletterUnsubscribe` client component accepting `userEmail: string` and `onOptimisticUnsubscribe: () => void` props
- Implement `useServerAction` with `isDisableToast: true` for `unsubscribeFromNewsletterAction`
- Add unsubscribe button click handler that calls `onOptimisticUnsubscribe` before server action
- Display subscription status message showing user's email
- Use `Button` component with `variant="destructive"` for unsubscribe action
- Include breadcrumb context: `{ area: 'layout', feature: 'footer-newsletter', action: 'unsubscribe' }`
- Add test IDs using `generateTestId('layout', 'app-footer', 'newsletter-unsubscribe')` pattern
- Style with Tailwind CSS matching footer aesthetic with subtle destructive styling
- Add proper ARIA labels for accessibility
- Handle loading states during server action execution

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component displays current subscription status with user email
- [ ] Unsubscribe button triggers optimistic callback immediately
- [ ] Destructive variant styling is applied correctly
- [ ] Error toasts appear only when server action fails
- [ ] All validation commands pass
- [ ] Test IDs are properly generated and applied

---

### Step 3: Implement Footer Newsletter Server Component Orchestrator

**What**: Create the server component that determines authentication status, fetches user data, checks subscription state, and conditionally renders appropriate child components
**Why**: This component serves as the orchestration layer that personalizes the newsletter experience based on user authentication and subscription status
**Confidence**: High

**Files to Modify:**

- `src/components/layout/app-footer/components/footer-newsletter.tsx`

**Changes:**

- Remove existing placeholder content
- Import `getUserIdAsync` from auth-utils
- Import `UsersFacade.getEmailByUserIdAsync` and `NewsletterFacade.getIsActiveSubscriberAsync`
- Import both client components created in Steps 1 and 2
- Implement async server component that calls `getUserIdAsync()` to check authentication
- For authenticated users, fetch email via `UsersFacade.getEmailByUserIdAsync(userId)`
- For authenticated users, check subscription status via `NewsletterFacade.getIsActiveSubscriberAsync(userId)`
- Add wrapper client component to manage optimistic state using `useState` for subscription status
- Pass optimistic state and callbacks to subscribe/unsubscribe components
- For public users, render `FooterNewsletterSubscribe` without props
- For authenticated non-subscribers, render `FooterNewsletterSubscribe` with `userEmail` and optimistic callback
- For authenticated subscribers, render `FooterNewsletterUnsubscribe` with `userEmail` and optimistic callback
- Add semantic HTML section wrapper with appropriate heading
- Style container to match footer layout patterns with proper spacing
- Add test ID for newsletter section container

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Server component correctly identifies authentication status
- [ ] User email is fetched for authenticated users
- [ ] Subscription status is checked for authenticated users
- [ ] Correct client component is rendered based on user state
- [ ] Optimistic state management works correctly
- [ ] All validation commands pass
- [ ] Component integrates seamlessly with existing footer layout

---

### Step 4: Verify Integration and Component Behavior

**What**: Test the complete newsletter component integration in the footer and verify all user flows
**Why**: Ensure the implementation works correctly across all user states and that optimistic updates behave as expected
**Confidence**: High

**Files to Modify:**

- None (verification step only)

**Changes:**

- Verify footer-newsletter component renders in app footer without errors
- Test public user flow: submit email, verify toast appears, check database entry
- Test authenticated non-subscriber flow: verify form shows with pre-filled email, submit, verify optimistic update
- Test authenticated subscriber flow: verify unsubscribe button appears, click, verify optimistic rollback to subscribe form
- Test error handling: verify toast appears only when server actions fail
- Verify accessibility: keyboard navigation, screen reader labels, focus management
- Check responsive design across different viewport sizes
- Verify styling consistency with other footer components
- Test loading states during async operations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Newsletter component renders correctly in footer
- [ ] All three user states (public, authenticated non-subscriber, authenticated subscriber) work as expected
- [ ] Optimistic UI updates occur immediately for authenticated users
- [ ] Error toasts display appropriately
- [ ] Keyboard navigation and accessibility work correctly
- [ ] Component is responsive and styled consistently
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Newsletter component renders without console errors
- [ ] All three user flows (public, auth non-subscriber, auth subscriber) function correctly
- [ ] Optimistic updates work as specified for authenticated users
- [ ] Error handling displays toasts only when server actions fail
- [ ] Accessibility attributes are present and functional
- [ ] Component styling matches existing footer patterns

## Notes

### Key Architectural Decisions

1. **Optimistic State Management**: A wrapper client component within the server component orchestrator will manage the optimistic subscription state using `useState`. This allows immediate UI updates before server confirmation.

2. **Conditional Toast Behavior**: The `useServerAction` hook's `isDisableToast: true` option is used only for authenticated users to suppress success toasts, enabling optimistic updates. Public users retain standard toast notifications.

3. **Component Separation**: Three distinct components provide clear separation of concerns - server orchestrator for data fetching, subscribe component for acquisition, unsubscribe component for retention management.

4. **Email Pre-population**: For authenticated users, the email field will be pre-filled and potentially read-only to improve UX and reduce friction.

### Assumptions Requiring Validation

- The existing `NewsletterFacade.getIsActiveSubscriberAsync()` correctly identifies active subscriptions (Confidence: High)
- The `useServerAction` hook properly handles the `isDisableToast` option (Confidence: High)
- Server actions are idempotent and handle edge cases (Confidence: Medium - recommend testing duplicate submissions)

### Risk Mitigation

- **Race Conditions**: Optimistic updates could conflict with slow server responses. Mitigated by error handling that reverts optimistic state on failure.
- **Stale Data**: User might see outdated subscription status if changed in another session. Consider adding cache revalidation after successful actions.
- **Email Privacy**: Ensure email display in unsubscribe component doesn't create privacy concerns in shared browsing contexts.
