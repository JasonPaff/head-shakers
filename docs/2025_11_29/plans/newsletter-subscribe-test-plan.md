# Test Implementation Plan: Newsletter Subscribe/Unsubscribe

**Generated**: 2025-11-29
**Original Request**: Newsletter subscribe/unsubscribe component in the app footer
**Scope Filter**: unit

## Overview

| Metric | Value |
|--------|-------|
| Total Tests | 59 |
| Test Files to Create | 6 |
| Risk Level | Medium |
| Complexity | Medium-High |

**Priority Breakdown**:
- Critical: 14 tests (facade business logic)
- High: 32 tests (validations, queries, response helpers)
- Medium: 7 tests (email utilities)
- Low: 6 tests (server actions)

## Analysis Summary

- Feature area refined into testable requirements
- Discovered 21 source files, 0 existing tests
- Identified 59 coverage gaps across 6 testable files
- Generated 6-step test implementation plan

## Prerequisites

### Directory Structure

Create these directories before implementation:

```
tests/unit/lib/
├── utils/
├── validations/
├── queries/
│   └── newsletter/
├── facades/
│   └── newsletter/
└── actions/
    └── newsletter/
```

### Mock Utilities Needed

1. **Database Mock** (`tests/mocks/database.mock.ts`)
   - Mock Drizzle ORM query builder
   - Mock transaction context

2. **Service Mocks** (`tests/mocks/services/`)
   - `CacheService` mock for `newsletter.isActiveSubscriber`
   - `CacheRevalidationService` mock for `newsletter.onSubscriptionChange`
   - `ResendService` mock for `sendNewsletterWelcomeAsync`

3. **Auth Mock** (`tests/mocks/auth.mock.ts`)
   - Mock `getUserIdAsync` for server action tests

### Test Fixtures Needed

```typescript
// tests/fixtures/newsletter.fixtures.ts
export const validEmails = [
  'test@example.com',
  'user.name@domain.org',
  'USER@EXAMPLE.COM', // Tests normalization
  '  padded@email.com  ', // Tests trimming
];

export const invalidEmails = [
  '', // Empty
  'invalid', // No @ symbol
  '@nodomain.com', // No local part
  'a'.repeat(256) + '@example.com', // Exceeds max length
];

export const mockNewsletterSignup = {
  id: 'uuid-here',
  email: 'test@example.com',
  userId: null,
  subscribedAt: new Date(),
  unsubscribedAt: null,
  createdAt: new Date(),
};
```

## Implementation Steps

### Step 1: Email Utilities

**Test Type**: Unit
**Priority**: Medium
**Source File**: `src/lib/utils/email-utils.ts`
**Test File to Create**: `tests/unit/lib/utils/email-utils.test.ts`

**Test Cases** (7 tests):

| Test Case | Description |
|-----------|-------------|
| `normalizeEmail - lowercase` | Converts `USER@EXAMPLE.COM` to `user@example.com` |
| `normalizeEmail - trim` | Converts `  test@example.com  ` to `test@example.com` |
| `normalizeEmail - combined` | Handles mixed case with whitespace |
| `normalizeEmail - already normalized` | Returns unchanged for normalized input |
| `normalizeEmail - preserves structure` | Keeps `local@domain.tld` format intact |
| `maskEmail - standard` | Converts `john@example.com` to `joh***@example.com` |
| `maskEmail - short local` | Handles emails with <3 char local parts |

**Mocks Required**: None (pure functions)

**Patterns to Follow**: See existing utility tests in `tests/unit/lib/utils/`

**Validation Command**:
```bash
npm run test:unit -- tests/unit/lib/utils/email-utils.test.ts
```

**Success Criteria**:
- All 7 tests pass
- No TypeScript errors
- Edge cases covered (empty strings, unicode, etc.)

---

### Step 2: Action Response Helpers

**Test Type**: Unit
**Priority**: High
**Source File**: `src/lib/utils/action-response.ts`
**Test File to Create**: `tests/unit/lib/utils/action-response.test.ts`

**Test Cases** (6 tests):

| Test Case | Description |
|-----------|-------------|
| `actionSuccess - with data` | Returns `{ wasSuccess: true, data: {...} }` |
| `actionSuccess - with message` | Includes optional message field |
| `actionSuccess - null data` | Handles delete operations returning null |
| `actionFailure - with message` | Returns `{ wasSuccess: false, message: '...' }` |
| `isActionSuccess - type guard` | Correctly identifies success responses |
| `isActionFailure - type guard` | Correctly identifies failure responses |

**Mocks Required**: None (pure functions)

**Patterns to Follow**: Standard TypeScript type guard testing

**Validation Command**:
```bash
npm run test:unit -- tests/unit/lib/utils/action-response.test.ts
```

**Success Criteria**:
- All 6 tests pass
- Type narrowing works correctly
- TypeScript inference validated

---

### Step 3: Validation Schemas

**Test Type**: Unit
**Priority**: High
**Source File**: `src/lib/validations/newsletter.validation.ts`
**Test File to Create**: `tests/unit/lib/validations/newsletter.validation.test.ts`

**Test Cases** (12 tests):

**insertNewsletterSignupSchema** (9 tests):

| Test Case | Input | Expected |
|-----------|-------|----------|
| Valid email | `{ email: 'test@example.com' }` | Success |
| Trims whitespace | `{ email: '  test@example.com  ' }` | Success, trimmed |
| Lowercases | `{ email: 'TEST@EXAMPLE.COM' }` | Success, lowercased |
| Invalid format | `{ email: 'invalid' }` | Failure |
| Exceeds max length | `{ email: 'a'.repeat(256) + '@x.com' }` | Failure |
| Below min length | `{ email: 'a@b' }` | Failure |
| Empty email | `{ email: '' }` | Failure |
| Omits id field | `{ email: '...', id: '...' }` | id stripped |
| Omits subscribedAt | `{ email: '...', subscribedAt: '...' }` | subscribedAt stripped |

**unsubscribeFromNewsletterSchema** (3 tests):

| Test Case | Input | Expected |
|-----------|-------|----------|
| Valid email | `{ email: 'test@example.com' }` | Success |
| Invalid format | `{ email: 'invalid' }` | Failure |
| Exceeds max length | Long email | Failure |

**Mocks Required**: None (Zod schema testing)

**Patterns to Follow**: See `tests/unit/lib/validations/` for existing patterns

**Validation Command**:
```bash
npm run test:unit -- tests/unit/lib/validations/newsletter.validation.test.ts
```

**Success Criteria**:
- All 12 tests pass
- Schema transformations verified (trim, lowercase)
- Error messages are user-friendly

---

### Step 4: Query Layer

**Test Type**: Unit
**Priority**: High
**Source File**: `src/lib/queries/newsletter/newsletter.queries.ts`
**Test File to Create**: `tests/unit/lib/queries/newsletter/newsletter.queries.test.ts`

**Test Cases** (16 tests):

| Method | Test Cases |
|--------|------------|
| `createSignupAsync` | Creates record, handles conflict, normalizes email, accepts null userId |
| `findByEmailAsync` | Finds existing, returns null for missing, normalizes email |
| `getActiveSubscriberAsync` | Returns active only, returns null for unsubscribed |
| `getIsActiveSubscriberAsync` | Returns true/false correctly, handles non-existent |
| `emailExistsAsync` | Returns true/false for existence check |
| `resubscribeAsync` | Clears unsubscribedAt, returns null for missing |
| `unsubscribeAsync` | Sets unsubscribedAt, returns updated record |
| `updateUserIdAsync` | Updates when null, returns null when already set |

**Mocks Required**:
- Mock Drizzle ORM database instance
- Mock query builder methods (select, insert, update, where)

**Patterns to Follow**: See existing query tests, use `vi.mock()` for database

**Validation Command**:
```bash
npm run test:unit -- tests/unit/lib/queries/newsletter/newsletter.queries.test.ts
```

**Success Criteria**:
- All 16 tests pass
- Email normalization verified at query layer
- Soft delete pattern tested (unsubscribedAt)

---

### Step 5: Facade Layer (Critical)

**Test Type**: Unit
**Priority**: Critical
**Source File**: `src/lib/facades/newsletter/newsletter.facade.ts`
**Test File to Create**: `tests/unit/lib/facades/newsletter/newsletter.facade.test.ts`

**Test Cases** (14 tests):

**getIsActiveSubscriberAsync** (2 tests):

| Test Case | Description |
|-----------|-------------|
| Returns true for active | Active subscriber returns true |
| Returns false for inactive | Unsubscribed/non-existent returns false |

**subscribeAsync** (9 tests):

| Test Case | Description |
|-----------|-------------|
| New subscription | Creates record, sends welcome email |
| Already subscribed | Returns `isAlreadySubscribed: true` |
| Resubscribe | Previously unsubscribed gets resubscribed |
| Links userId | Anonymous signup linked to authenticated user |
| Updates userId | Existing signup without userId gets updated |
| Normalizes email | Email normalized before operations |
| Invalidates cache | Cache invalidated after subscription |
| Welcome email failure | Subscription succeeds even if email fails |
| Race condition | Handles concurrent subscription attempts |

**unsubscribeAsync** (3 tests):

| Test Case | Description |
|-----------|-------------|
| Active subscriber | Successfully unsubscribes |
| Non-existent email | Returns success (privacy) |
| Invalidates cache | Cache invalidated after unsubscribe |

**Mocks Required**:
- `NewsletterQuery` methods
- `CacheService.newsletter`
- `CacheRevalidationService.newsletter`
- `ResendService.sendNewsletterWelcomeAsync`

**Patterns to Follow**: See existing facade tests, comprehensive mocking

**Validation Command**:
```bash
npm run test:unit -- tests/unit/lib/facades/newsletter/newsletter.facade.test.ts
```

**Success Criteria**:
- All 14 tests pass
- Privacy-preserving behavior verified
- Cache invalidation tested
- Welcome email non-blocking behavior verified

---

### Step 6: Server Actions

**Test Type**: Unit
**Priority**: Low
**Source File**: `src/lib/actions/newsletter/newsletter.actions.ts`
**Test File to Create**: `tests/unit/lib/actions/newsletter/newsletter.actions.test.ts`

**Test Cases** (6 tests):

**subscribeToNewsletterAction** (3 tests):

| Test Case | Description |
|-----------|-------------|
| Calls facade | Passes input to facade correctly |
| Returns success | Returns actionSuccess with result |
| Privacy message | Uses privacy-preserving message |

**unsubscribeFromNewsletterAction** (3 tests):

| Test Case | Description |
|-----------|-------------|
| Calls facade | Passes email to facade correctly |
| Returns success | Returns actionSuccess regardless of existence |
| Privacy message | Uses privacy-preserving message |

**Mocks Required**:
- `NewsletterFacade` methods
- `getUserIdAsync` from auth utilities
- Sentry breadcrumb calls

**Patterns to Follow**: See existing action tests in `tests/unit/lib/actions/`

**Validation Command**:
```bash
npm run test:unit -- tests/unit/lib/actions/newsletter/newsletter.actions.test.ts
```

**Success Criteria**:
- All 6 tests pass
- Facade integration verified
- Privacy-preserving responses validated

---

## Quality Gates

### All Steps Must Pass

```bash
# Run all newsletter unit tests
npm run test:unit -- tests/unit/lib/**/newsletter* tests/unit/lib/utils/email-utils.test.ts tests/unit/lib/utils/action-response.test.ts

# Run typecheck
npm run typecheck

# Run linting
npm run lint
```

### Success Criteria

- [ ] 59/59 tests pass (100%)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Privacy-preserving behavior verified in facade and action tests
- [ ] Email normalization consistent across all layers
- [ ] Cache invalidation tested

## Implementation Order Rationale

1. **Email utils first** - No dependencies, quick wins
2. **Action response helpers** - No dependencies, used by actions
3. **Validation schemas** - No external deps, foundation for actions
4. **Query layer** - Database operations, requires mocking
5. **Facade layer** - Business logic, requires query/service mocks
6. **Action layer** - Thin wrapper, requires facade mocks

This bottom-up approach ensures each layer's tests are in place before testing layers that depend on them.

## Execution

Execute this plan using:

```bash
/implement-tests docs/2025_11_29/plans/newsletter-subscribe-test-plan.md
```
