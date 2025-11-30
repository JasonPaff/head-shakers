# Step 3: Coverage Gap Analysis

**Started**: 2025-11-29
**Status**: Complete
**Scope Filter**: e2e

## Coverage Summary

| Metric               | Value                           |
| -------------------- | ------------------------------- |
| Current E2E Coverage | 0 tests                         |
| Total Coverage Gaps  | 9 distinct user flows           |
| Test Cases Needed    | 12 E2E tests                    |
| Priority Breakdown   | Critical: 7, High: 5, Medium: 3 |

## Coverage Gaps by Priority

### Critical Priority (7 tests)

#### Gap 1: Anonymous User Subscription (3 tests)

- Anonymous user sees subscribe form in footer
- Anonymous user submits valid email → sees success message
- Subscription persists after page refresh
- **Risk**: Primary user acquisition path

#### Gap 2: Authenticated Non-Subscriber (3 tests)

- Logged-in user (not subscribed) sees subscribe form
- User subscribes → UI transitions to unsubscribe interface
- State persists across page refresh
- **Risk**: Core authenticated feature path

#### Gap 3: Authenticated Subscriber Unsubscribe (2 tests)

- Logged-in subscriber sees unsubscribe button with their email
- Clicking unsubscribe transitions back to subscribe form
- **Risk**: GDPR/CAN-SPAM compliance requirement

### High Priority (5 tests)

#### Gap 4: Email Validation Errors (2 tests)

- Empty email shows validation message
- Invalid format shows error message
- **Risk**: Prevents invalid data submission

#### Gap 5: Optimistic UI Loading States (2 tests)

- Submit button shows "Subscribing..." during request
- Email input disabled during submission
- **Risk**: Prevents accidental double-submission

#### Gap 6: Duplicate Subscription Privacy (2 tests)

- Resubscriber sees identical message as new subscriber
- No email enumeration vulnerability
- **Risk**: Security/privacy requirement

#### Gap 7: Unsubscribe Button Loading (1 test)

- Button shows "Unsubscribing..." during request
- **Risk**: Consistent UX pattern

### Medium Priority (3 tests)

#### Gap 8: Page Refresh State Consistency (2 tests)

- Subscription state persists after page navigation
- Server component fetches fresh data
- **Risk**: Data integrity

#### Gap 9: Footer Visibility (1 test)

- Newsletter component renders on all pages
- Correct state shown in different contexts
- **Risk**: Feature discoverability

## Test Data Requirements

### Database States Required

1. **Non-Subscriber**: User NOT in newsletter_signups table
2. **Active Subscriber**: Record with unsubscribedAt = NULL
3. **Previously Unsubscribed**: Record with unsubscribedAt = previous date

### Test Users Needed

- Anonymous user (no auth)
- Authenticated user without subscription
- Authenticated user with active subscription

## Test Infrastructure Needed

### Page Object Extensions

```typescript
// home.page.ts extensions
newsletterSubscribeForm: Locator
newsletterEmailInput: Locator
newsletterSubmitButton: Locator
newsletterUnsubscribeButton: Locator

async subscribeToNewsletter(email: string): Promise<void>
async unsubscribeFromNewsletter(): Promise<void>
```

### Test Files to Create

- `tests/e2e/specs/feature/newsletter-footer.spec.ts` (main test file)
- `tests/e2e/fixtures/newsletter.fixtures.ts` (test fixtures)

## Validation Results

- All source files analyzed: Yes
- Gaps categorized by priority: Yes
- Test estimates provided: Yes (12 tests total)
