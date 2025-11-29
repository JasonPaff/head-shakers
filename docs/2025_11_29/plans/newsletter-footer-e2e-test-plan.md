# Test Implementation Plan: Newsletter Footer E2E Tests

**Generated**: 2025-11-29
**Original Request**: Newsletter subscribe/unsubscribe component in the app footer
**Scope Filter**: e2e

## Overview

| Metric | Value |
|--------|-------|
| Total Tests | 12 |
| New Test Files | 1 spec file + Page Object extensions |
| Complexity | Medium |
| Risk Level | High (user acquisition + compliance) |
| Estimated Effort | 4-6 hours |

## Analysis Summary

- Feature area refined into 6 testable dimensions
- Discovered 21 source files, 0 existing newsletter E2E tests
- Identified 9 coverage gaps requiring 12 E2E tests
- Tests organized into 4 implementation phases

## Prerequisites

### Test Infrastructure Required

1. **Page Object Extensions** - Extend `HomePage` with newsletter locators
2. **Test Data** - Ensure test users have correct subscription states
3. **Test IDs** - Verify newsletter components have data-testid attributes

### Dependencies

- Playwright configured (exists in `playwright.config.ts`)
- Base fixture available (`tests/e2e/fixtures/base.fixture.ts`)
- Auth setup complete (admin, user, new-user contexts)

---

## Implementation Steps

### Step 1: Extend HomePage Page Object

**What**: Add newsletter-specific locators and helper methods to `HomePage`

**Why**: Enable clean, reusable test interactions with newsletter components

**Test Type**: Infrastructure

**Files to Modify**:
- `tests/e2e/pages/home.page.ts`

**Changes to Make**:

```typescript
// Add to HomePage class

// Newsletter locators
get newsletterSection(): Locator {
  return this.finder.layout('footer-newsletter');
}

get newsletterSubscribeForm(): Locator {
  return this.finder.form('newsletter-subscribe');
}

get newsletterEmailInput(): Locator {
  return this.page.getByRole('textbox', { name: /email/i });
}

get newsletterSubmitButton(): Locator {
  return this.page.getByRole('button', { name: /subscribe/i });
}

get newsletterUnsubscribeButton(): Locator {
  return this.page.getByRole('button', { name: /unsubscribe/i });
}

get newsletterSuccessMessage(): Locator {
  return this.page.getByText(/thanks for subscribing/i);
}

get newsletterEmailError(): Locator {
  return this.page.getByText(/valid email/i);
}

// Helper methods
async subscribeToNewsletter(email: string): Promise<void> {
  await this.newsletterEmailInput.fill(email);
  await this.newsletterSubmitButton.click();
}

async scrollToFooter(): Promise<void> {
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await this.newsletterSection.waitFor({ state: 'visible' });
}
```

**Validation Commands**:
```bash
npm run typecheck
```

**Success Criteria**:
- TypeScript compiles without errors
- Locators match actual component test IDs

---

### Step 2: Create Newsletter E2E Test File

**What**: Create the main E2E test spec file with test structure

**Why**: Establish the test file with proper imports and describe blocks

**Test Type**: E2E Infrastructure

**Files to Create**:
- `tests/e2e/specs/feature/newsletter-footer.spec.ts`

**Test Cases**:

```typescript
import { expect, test } from '../../fixtures/base.fixture';
import { HomePage } from '../../pages/home.page';

test.describe('Newsletter Footer - Public (Unauthenticated)', () => {
  // Tests for anonymous users
});

test.describe('Newsletter Footer - Authenticated Non-Subscriber', () => {
  // Tests for logged-in users without subscription
});

test.describe('Newsletter Footer - Authenticated Subscriber', () => {
  // Tests for logged-in users with active subscription
});
```

**Patterns to Follow**:
- Use `test.describe` blocks to group by user state
- Import from `../../fixtures/base.fixture`
- Instantiate `HomePage` in `beforeEach`

**Validation Commands**:
```bash
npm run test:e2e -- tests/e2e/specs/feature/newsletter-footer.spec.ts --list
```

**Success Criteria**:
- Test file recognized by Playwright
- All test cases listed

---

### Step 3: Implement Public User Tests (Gap 1, 4, 5, 6)

**What**: Implement E2E tests for anonymous/public user flows

**Why**: Cover primary user acquisition path and validation

**Test Type**: E2E

**Files to Modify**:
- `tests/e2e/specs/feature/newsletter-footer.spec.ts`

**Test Cases**:

| Test | Gap | Priority |
|------|-----|----------|
| should display subscribe form for anonymous users | 1 | Critical |
| should successfully subscribe with valid email | 1 | Critical |
| should show validation error for invalid email | 4 | High |
| should show validation error for empty email | 4 | High |
| should show loading state during submission | 5 | High |
| should show same message for duplicate subscription | 6 | High |

**Implementation Details**:

```typescript
test.describe('Newsletter Footer - Public (Unauthenticated)', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.scrollToFooter();
  });

  test('should display subscribe form for anonymous users', async ({ page }) => {
    await expect(homePage.newsletterSection).toBeVisible();
    await expect(homePage.newsletterEmailInput).toBeVisible();
    await expect(homePage.newsletterSubmitButton).toBeVisible();
    await expect(page.getByText(/stay updated/i)).toBeVisible();
  });

  test('should successfully subscribe with valid email', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`;
    await homePage.subscribeToNewsletter(testEmail);
    await expect(homePage.newsletterSuccessMessage).toBeVisible({ timeout: 10000 });
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await homePage.newsletterEmailInput.fill('invalid-email');
    await homePage.newsletterSubmitButton.click();
    await expect(homePage.newsletterEmailError).toBeVisible();
  });

  test('should show validation error for empty email', async ({ page }) => {
    await homePage.newsletterSubmitButton.click();
    await expect(homePage.newsletterEmailError).toBeVisible();
  });

  test('should show loading state during submission', async ({ page }) => {
    await homePage.newsletterEmailInput.fill(`test-${Date.now()}@example.com`);
    await homePage.newsletterSubmitButton.click();
    // Check for loading state (button text changes to "Subscribing...")
    await expect(page.getByRole('button', { name: /subscribing/i })).toBeVisible();
  });

  test('should show same message for duplicate subscription (privacy)', async ({ page }) => {
    // Use a known existing email - should still show success message
    const existingEmail = 'existing@example.com';
    await homePage.subscribeToNewsletter(existingEmail);
    // Privacy: same message regardless of existing/new
    await expect(homePage.newsletterSuccessMessage).toBeVisible({ timeout: 10000 });
  });
});
```

**Validation Commands**:
```bash
npm run test:e2e -- tests/e2e/specs/feature/newsletter-footer.spec.ts --grep "Public"
```

**Success Criteria**:
- All 6 tests pass
- No flaky tests (run 3x)

---

### Step 4: Implement Authenticated Non-Subscriber Tests (Gap 2)

**What**: Implement E2E tests for authenticated users without subscription

**Why**: Cover authenticated user subscription flow

**Test Type**: E2E

**Files to Modify**:
- `tests/e2e/specs/feature/newsletter-footer.spec.ts`

**Test Cases**:

| Test | Gap | Priority |
|------|-----|----------|
| should display subscribe form for authenticated non-subscriber | 2 | Critical |
| should transition to unsubscribe view after subscribing | 2 | Critical |
| should persist subscription state after page refresh | 2 | Critical |

**Implementation Details**:

```typescript
test.describe('Newsletter Footer - Authenticated Non-Subscriber', () => {
  test('should display subscribe form for authenticated non-subscriber', async ({ newUserPage }) => {
    const homePage = new HomePage(newUserPage);
    await homePage.goto();
    await homePage.scrollToFooter();

    // New user should see subscribe form (not yet subscribed)
    await expect(homePage.newsletterEmailInput).toBeVisible();
    await expect(homePage.newsletterSubmitButton).toBeVisible();
  });

  test('should transition to unsubscribe view after subscribing', async ({ newUserPage }) => {
    const homePage = new HomePage(newUserPage);
    await homePage.goto();
    await homePage.scrollToFooter();

    // Subscribe using their authenticated email
    await homePage.newsletterSubmitButton.click();

    // Should transition to unsubscribe view
    await expect(homePage.newsletterUnsubscribeButton).toBeVisible({ timeout: 10000 });
    await expect(homePage.newsletterEmailInput).not.toBeVisible();
  });

  test('should persist subscription state after page refresh', async ({ newUserPage }) => {
    const homePage = new HomePage(newUserPage);
    await homePage.goto();
    await homePage.scrollToFooter();

    // Subscribe first
    await homePage.newsletterSubmitButton.click();
    await expect(homePage.newsletterUnsubscribeButton).toBeVisible({ timeout: 10000 });

    // Refresh page
    await newUserPage.reload();
    await homePage.scrollToFooter();

    // Should still show unsubscribe view
    await expect(homePage.newsletterUnsubscribeButton).toBeVisible();
  });
});
```

**Validation Commands**:
```bash
npm run test:e2e -- tests/e2e/specs/feature/newsletter-footer.spec.ts --grep "Non-Subscriber"
```

**Success Criteria**:
- All 3 tests pass
- UI transitions correctly observed

---

### Step 5: Implement Authenticated Subscriber Tests (Gap 3, 7, 8)

**What**: Implement E2E tests for authenticated users with active subscription

**Why**: Cover unsubscribe flow and GDPR/CAN-SPAM compliance

**Test Type**: E2E

**Files to Modify**:
- `tests/e2e/specs/feature/newsletter-footer.spec.ts`

**Test Cases**:

| Test | Gap | Priority |
|------|-----|----------|
| should display unsubscribe button with user email | 3 | Critical |
| should transition to subscribe form after unsubscribing | 3 | Critical |
| should show loading state during unsubscribe | 7 | High |

**Implementation Details**:

```typescript
test.describe('Newsletter Footer - Authenticated Subscriber', () => {
  test('should display unsubscribe button with user email', async ({ userPage }) => {
    const homePage = new HomePage(userPage);
    await homePage.goto();
    await homePage.scrollToFooter();

    // Subscribed user should see unsubscribe interface
    await expect(homePage.newsletterUnsubscribeButton).toBeVisible();
    // Should show their email (masked or full)
    await expect(userPage.getByText(/@/)).toBeVisible();
  });

  test('should transition to subscribe form after unsubscribing', async ({ userPage }) => {
    const homePage = new HomePage(userPage);
    await homePage.goto();
    await homePage.scrollToFooter();

    // Click unsubscribe
    await homePage.newsletterUnsubscribeButton.click();

    // Should transition to subscribe form
    await expect(homePage.newsletterEmailInput).toBeVisible({ timeout: 10000 });
    await expect(homePage.newsletterSubmitButton).toBeVisible();
    await expect(homePage.newsletterUnsubscribeButton).not.toBeVisible();
  });

  test('should show loading state during unsubscribe', async ({ userPage }) => {
    const homePage = new HomePage(userPage);
    await homePage.goto();
    await homePage.scrollToFooter();

    await homePage.newsletterUnsubscribeButton.click();
    // Check for loading state
    await expect(userPage.getByRole('button', { name: /unsubscribing/i })).toBeVisible();
  });
});
```

**Validation Commands**:
```bash
npm run test:e2e -- tests/e2e/specs/feature/newsletter-footer.spec.ts --grep "Subscriber"
```

**Success Criteria**:
- All 3 tests pass
- Unsubscribe flow completes successfully

---

### Step 6: Run Full Test Suite and Validate

**What**: Execute all newsletter E2E tests and verify coverage

**Why**: Ensure all tests pass and coverage goals met

**Test Type**: E2E Validation

**Validation Commands**:
```bash
# Run all newsletter tests
npm run test:e2e -- tests/e2e/specs/feature/newsletter-footer.spec.ts

# Run with verbose output
npm run test:e2e -- tests/e2e/specs/feature/newsletter-footer.spec.ts --reporter=list

# Run multiple times to check for flakiness
npm run test:e2e -- tests/e2e/specs/feature/newsletter-footer.spec.ts --repeat-each=3
```

**Success Criteria**:
- All 12 tests pass
- No flaky tests across 3 runs
- Coverage gaps addressed:
  - Gap 1: Anonymous subscription (3 tests) ✓
  - Gap 2: Auth non-subscriber (3 tests) ✓
  - Gap 3: Auth subscriber unsubscribe (2 tests) ✓
  - Gap 4: Email validation (2 tests) ✓
  - Gap 5: Loading states (2 tests - shared with other tests) ✓
  - Gap 6: Privacy (1 test) ✓
  - Gap 7: Unsubscribe loading (1 test) ✓
  - Gap 8: State persistence (covered in Gap 2) ✓
  - Gap 9: Footer visibility (covered in all tests) ✓

---

## Quality Gates

### Gate 1: Infrastructure Ready
- [ ] HomePage Page Object extended with newsletter locators
- [ ] TypeScript compiles without errors
- [ ] Test file created and recognized by Playwright

### Gate 2: Public Tests Pass
- [ ] All 6 public user tests pass
- [ ] Validation errors display correctly
- [ ] Loading states visible during submission

### Gate 3: Authenticated Tests Pass
- [ ] Non-subscriber can subscribe (3 tests)
- [ ] Subscriber can unsubscribe (3 tests)
- [ ] UI transitions correctly between states

### Gate 4: Full Suite Validation
- [ ] All 12 tests pass
- [ ] No flaky tests (3x repeat)
- [ ] All 9 coverage gaps addressed

---

## Test Infrastructure Notes

### Test IDs Required

Ensure these data-testid attributes exist on newsletter components:

| Component | Test ID |
|-----------|---------|
| Newsletter section | `layout-footer-newsletter` |
| Subscribe form | `form-newsletter-subscribe` |
| Email input | Standard `textbox` role |
| Submit button | Standard `button` role |
| Unsubscribe button | Standard `button` role |

### Database Considerations

- Tests create real database records via server actions
- Use unique emails with timestamps to avoid conflicts: `test-${Date.now()}@example.com`
- For duplicate subscription test, use a known seeded email
- E2E tests run against isolated Neon branch (existing infrastructure)

### Authentication Contexts

| Context | User State | Newsletter State |
|---------|------------|------------------|
| `page` (anonymous) | Not logged in | N/A |
| `newUserPage` | Logged in | Not subscribed |
| `userPage` | Logged in | Subscribed |

---

## File Structure After Implementation

```
tests/e2e/
├── fixtures/
│   └── base.fixture.ts (existing)
├── pages/
│   ├── base.page.ts (existing)
│   └── home.page.ts (MODIFIED - add newsletter locators)
└── specs/
    └── feature/
        └── newsletter-footer.spec.ts (NEW - 12 tests)
```

---

## Execution Command

To implement this plan:

```bash
/implement-plan docs/2025_11_29/plans/newsletter-footer-e2e-test-plan.md
```
