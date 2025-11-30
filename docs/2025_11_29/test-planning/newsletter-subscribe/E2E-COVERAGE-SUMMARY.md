# E2E Test Coverage Summary: Newsletter Subscribe/Unsubscribe

## Quick Overview

| Metric                            | Value                                                   |
| --------------------------------- | ------------------------------------------------------- |
| **Current E2E Coverage**          | 0 tests for newsletter footer                           |
| **Total Coverage Gaps**           | 9 distinct user flows                                   |
| **Test Cases to Implement**       | 12 E2E tests                                            |
| **New Test File**                 | 1 (`tests/e2e/specs/feature/newsletter-footer.spec.ts`) |
| **Estimated Implementation Time** | 15-18 hours                                             |
| **Test Types**                    | Playwright E2E (Page Object Model)                      |

---

## Coverage Gap Breakdown

```
CRITICAL PRIORITY (7 tests) - Core Feature Paths
├── Gap 1: Anonymous User Subscription (3 tests)
│   └── User sees subscribe form → submits email → confirms subscription
├── Gap 2: Authenticated Non-Subscriber (3 tests)
│   └── Logged-in user subscribes → UI transitions to unsubscribe view
└── Gap 3: Authenticated Subscriber Unsubscribe (2 tests)
    └── Subscriber clicks unsubscribe → transitions to subscribe form

HIGH PRIORITY (5 tests) - UX & Validation
├── Gap 4: Email Validation Errors (2 tests)
│   └── Invalid emails show validation errors in form
├── Gap 5: Optimistic UI Loading States (2 tests)
│   └── Button/input disabled during submission with "Subscribing..." text
├── Gap 6: Duplicate Subscription Privacy (2 tests)
│   └── Resubscribe shows same message as new (no email enumeration)
└── Gap 7: Unsubscribe Button Loading (1 test)
    └── Unsubscribe button shows "Unsubscribing..." state

MEDIUM PRIORITY (2 tests) - Data Persistence
├── Gap 8: Page Refresh State Consistency (2 tests)
│   └── Subscription state persists after page navigation
└── Gap 9: Footer Visibility (1 test)
    └── Component renders on all pages consistently
```

---

## Coverage Matrix

### User Flows Tested

```
                        | Anonymous | Auth (No Sub) | Auth (Subscribed)
------------------------+-----------+---------------+------------------
View Subscribe Form     | Gap 1     | Gap 2         | Gap 3 (not shown)
Submit Valid Email      | Gap 1     | Gap 2         | N/A
Validation Errors       | Gap 4     | Gap 4         | Gap 4
Loading State (Sub)     | Gap 5     | Gap 5         | N/A
Loading State (Unsub)   | N/A       | N/A           | Gap 7
Unsubscribe Flow        | N/A       | N/A           | Gap 3
Privacy (Duplicate Sub) | Gap 6     | Gap 6         | Gap 6
Page Refresh State      | Gap 8     | Gap 8         | Gap 8
Footer Visibility       | Gap 9     | Gap 9         | Gap 9
```

---

## Source Components Under Test

### 1. `footer-newsletter.tsx` (Server Component)

- **Role**: Orchestrates subscription state logic
- **Tests**: Gap 1, 2, 3, 8, 9
- **Coverage**: Server-side state fetching, conditional rendering

### 2. `footer-newsletter-subscribe.tsx` (Client Component)

- **Role**: Email input form with optimistic UI
- **Tests**: Gap 1, 2, 4, 5, 6
- **Coverage**: Form submission, validation, optimistic state transitions

### 3. `footer-newsletter-unsubscribe.tsx` (Client Component)

- **Role**: Unsubscribe interface with user email display
- **Tests**: Gap 3, 7, 8
- **Coverage**: Unsubscribe action, loading state, state transitions

### 4. `app-footer.tsx` (Server Component)

- **Role**: Footer layout wrapper
- **Tests**: Gap 9 (implicitly)
- **Coverage**: Component integration, accessibility

### 5. `newsletter.actions.ts` (Server Actions)

- **Role**: Handle mutations with rate limiting
- **Tests**: Gap 1, 2, 3, 4, 5, 6, 7 (via component tests)
- **Coverage**: Form submission backend (tested through UI flows)

---

## Test Implementation Roadmap

### Phase 1: Infrastructure Setup (Day 1)

```
1. Extend HomePage.page.ts with newsletter locators
2. Create newsletter.fixtures.ts with test data
3. Configure test user database states
```

### Phase 2: Public User Flows (Day 2)

```
4. Gap 1: Anonymous subscription (3 tests)
5. Gap 4: Email validation (2 tests)
6. Gap 5: Optimistic loading (2 tests)
7. Gap 6: Privacy behavior (2 tests)
```

### Phase 3: Authenticated Flows (Day 3)

```
8. Gap 2: Non-subscriber authentication (3 tests)
9. Gap 3: Subscriber unsubscribe (2 tests)
10. Gap 7: Unsubscribe loading (1 test)
```

### Phase 4: State Persistence (Day 4)

```
11. Gap 8: Page refresh consistency (2 tests)
12. Gap 9: Footer visibility (1 test)
```

---

## Test Isolation & Data

### Anonymous User Tests (Gap 1, 4, 5, 6)

- **Isolation**: No Clerk authentication
- **Database Setup**: None (testing new subscriptions)
- **Fixture**: `page` (default browser context)
- **Teardown**: Optional (can reuse emails across tests)

### Authenticated Non-Subscriber Tests (Gap 2)

- **Isolation**: Uses `userPage` fixture (pre-authenticated)
- **Database Setup**: Ensure user NOT in newsletter_signups
- **Fixture**: `userPage` (authenticated session)
- **Teardown**: Clear newsletter signup after tests

### Authenticated Subscriber Tests (Gap 3, 7, 8)

- **Isolation**: Requires fresh subscriber user
- **Database Setup**: Insert active subscription (unsubscribedAt = NULL)
- **Fixture**: `userPage` (authenticated session)
- **Teardown**: Reset subscription state after each test

---

## Key Features Tested

### Form Submission

```
✓ Valid email accepted
✓ Invalid email rejected with error message
✓ Empty field shows validation
✓ Submit disabled during "Subscribing..."
✓ Input disabled during submission
```

### State Transitions

```
✓ Subscribe form → "Newsletter Subscriber" confirmation
✓ "Newsletter Subscriber" → Subscribe form (after unsubscribe)
✓ Optimistic UI shows immediately
✓ Server state syncs on page refresh
```

### Privacy & Security

```
✓ Duplicate subscription shows same message
✓ Unsubscribe always succeeds (no email enumeration)
✓ Email masked in logs (verified in backend unit tests)
```

### Accessibility

```
✓ Form labeled correctly ("Stay Updated")
✓ Email input has placeholder
✓ Button text updates during loading
✓ Region role for newsletter section
```

### Error Handling

```
✓ Network errors shown to user
✓ Rate limiting handled gracefully (implicit via server action)
✓ Invalid email format detected client-side
```

---

## Page Object Pattern

```typescript
// Usage in tests
const homePage = new HomePage(userPage);
await homePage.goto();

// Newsletter actions
await homePage.subscribeToNewsletter('test@example.com');
await homePage.unsubscribeFromNewsletter();

// Newsletter assertions
await expect(homePage.newsletterSubscriberEmail).toContainText('test@example.com');
await expect(homePage.newsletterSubmitButton).toHaveText('Subscribe');
```

---

## Database Test Data States

### Clean Non-Subscriber State

```sql
DELETE FROM newsletter_signups WHERE user_id = '<test-user-id>';
```

### Active Subscription State

```sql
INSERT INTO newsletter_signups (id, email, user_id, subscribed_at, unsubscribed_at, created_at)
VALUES (gen_random_uuid(), 'test@example.com', '<user-id>', NOW(), NULL, NOW());
```

### Previously Unsubscribed State

```sql
INSERT INTO newsletter_signups (id, email, user_id, subscribed_at, unsubscribed_at, created_at)
VALUES (gen_random_uuid(), 'test@example.com', '<user-id>', NOW() - INTERVAL '1 day', NOW(), NOW());
```

---

## Expected Test Results

### All Tests Pass Locally

```bash
npm run test:e2e -- tests/e2e/specs/feature/newsletter-footer.spec.ts

[✓] Newsletter Footer - Public User (5 tests)
[✓] Newsletter Footer - Authenticated (Non-Subscriber) (3 tests)
[✓] Newsletter Footer - Authenticated (Subscriber) (3 tests)
[✓] Newsletter Footer - Cross-page State (2 tests)
═══════════════════════════════════════════════════════════
12 tests passed, 0 failed
```

---

## Related Documentation

- **Unit/Integration Tests**: `newsletter-subscribe-test-plan.md` (59 tests)
- **Component Tests**: Would complement component-level testing
- **Full Coverage Analysis**: `newsletter-e2e-coverage-gaps.md` (detailed)

---

## Risk Assessment

| Risk                                 | Impact | Mitigation                               |
| ------------------------------------ | ------ | ---------------------------------------- |
| Database state leaking between tests | Medium | Use fresh test users per test            |
| Flaky network timeouts               | Medium | Increase timeout for subscription action |
| Email enumeration vulnerability      | High   | Verify identical messages in both cases  |
| Optimistic UI not reverting on error | Medium | Test error state explicitly              |
| Page refresh losing state            | Medium | Verify server-side data persistence      |

---

## Success Criteria

After implementing all 12 test cases:

- [ ] All tests pass consistently (3+ runs)
- [ ] Zero test interdependencies (each isolated)
- [ ] No hardcoded credentials in test files
- [ ] Proper cleanup after each test
- [ ] Tests document expected user behavior
- [ ] Identified any broken edge cases in code
- [ ] Can run full suite in CI/CD pipeline

---

## Getting Started

See detailed implementation guide: `newsletter-e2e-coverage-gaps.md`

```bash
# After implementation, run full E2E suite
npm run test:e2e

# Run newsletter tests specifically
npm run test:e2e -- tests/e2e/specs/feature/newsletter-footer.spec.ts

# Run with debug info
npm run test:e2e -- --debug
```
