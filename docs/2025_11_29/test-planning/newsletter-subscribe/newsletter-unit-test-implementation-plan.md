# Newsletter Subscribe/Unsubscribe Unit Tests - Implementation Plan

## Overview

This plan outlines the implementation of comprehensive unit tests for the newsletter subscribe/unsubscribe feature, covering six layers of the application stack from utilities through server actions.

### Scope Summary

- **Total Tests**: 59 test cases
- **Test Files to Create**: 6 new unit test files
- **Risk Level**: Medium (critical user-facing feature with privacy implications)
- **Complexity**: Medium to High (facade/action layers require careful mocking)

### Files Under Test

1. `src/lib/utils/email-utils.ts` - Email normalization and masking utilities (7 tests)
2. `src/lib/utils/action-response.ts` - Action response helpers (6 tests)
3. `src/lib/validations/newsletter.validation.ts` - Zod validation schemas (12 tests)
4. `src/lib/queries/newsletter/newsletter.queries.ts` - Database query layer (16 tests)
5. `src/lib/facades/newsletter/newsletter.facade.ts` - Business logic facade (14 tests)
6. `src/lib/actions/newsletter/newsletter.actions.ts` - Server actions (6 tests)

### Test Distribution

- **Critical Priority**: 14 tests (email normalization, validation schemas, core facade logic)
- **High Priority**: 32 tests (query methods, action responses, privacy-preserving behavior)
- **Medium Priority**: 7 tests (edge cases, error handling)
- **Low Priority**: 6 tests (type guards, optional functionality)

---

## Prerequisites

### Test Infrastructure Required

#### 1. Mock Utilities Needed

- **Database Mocking**: Mock `db` instance for query layer tests
- **Query Context Mocking**: Mock `QueryContext` for testing BaseQuery methods
- **Drizzle ORM Mocking**: Mock Drizzle query builders (select, insert, update, where, etc.)
- **Sentry Mocking**: Mock Sentry breadcrumb and error capture functions
- **Cache Service Mocking**: Mock `CacheService.newsletter.isActiveSubscriber`
- **Resend Service Mocking**: Mock `ResendService.sendNewsletterWelcomeAsync`
- **Cache Revalidation Mocking**: Mock `CacheRevalidationService.newsletter.onSubscriptionChange`
- **Auth Utilities Mocking**: Mock `getUserIdAsync()` for action tests
- **Action Client Mocking**: Mock `publicActionClient` and rate limiting middleware

#### 2. Test Fixtures Needed

- **Valid Email Addresses**: Standard format emails for happy path testing
- **Invalid Email Addresses**: Malformed emails, missing @, invalid domains, etc.
- **Edge Case Emails**:
  - Maximum length email (255 characters)
  - Minimum length email (5 characters)
  - Emails with whitespace (leading/trailing/internal)
  - Mixed case emails
  - Special character emails
  - Unicode/international emails
- **Newsletter Signup Records**: Mock database records for testing queries/facades
- **User IDs**: Mock Clerk user IDs for authenticated operations
- **Dates**: Fixed dates for testing timestamp fields

#### 3. Directory Structure to Create

```
tests/unit/lib/
├── utils/
│   ├── email-utils.test.ts (NEW)
│   └── action-response.test.ts (NEW)
├── validations/
│   └── newsletter.validation.test.ts (NEW)
├── queries/
│   └── newsletter/
│       └── newsletter.queries.test.ts (NEW)
├── facades/
│   └── newsletter/
│       └── newsletter.facade.test.ts (NEW)
└── actions/
    └── newsletter/
        └── newsletter.actions.test.ts (NEW)
```

#### 4. Shared Test Helpers to Consider

- Email generator function for creating test emails
- Newsletter signup factory for creating mock records
- Query builder mock factory for consistent Drizzle mocking
- Date helper for creating consistent test timestamps

---

## Implementation Steps

### Step 1: Email Utilities Tests

**Test Type**: Unit
**Priority**: Critical
**Source File**: `C:\Users\JasonPaff\dev\head-shakers\src\lib\utils\email-utils.ts`
**Test File to Create**: `C:\Users\JasonPaff\dev\head-shakers\tests\unit\lib\utils\email-utils.test.ts`

#### Test Cases (7 total)

**normalizeEmail (4 tests - CRITICAL)**

1. Should convert uppercase email to lowercase
   - Input: `"TEST@EXAMPLE.COM"`
   - Expected: `"test@example.com"`
2. Should trim leading and trailing whitespace
   - Input: `"  user@example.com  "`
   - Expected: `"user@example.com"`
3. Should handle both uppercase and whitespace
   - Input: `"  MIXED@CASE.COM  "`
   - Expected: `"mixed@case.com"`
4. Should handle already normalized email
   - Input: `"normal@example.com"`
   - Expected: `"normal@example.com"` (no change)

**maskEmail (3 tests - HIGH)**

1. Should mask email with standard length local part
   - Input: `"john.doe@example.com"`
   - Expected: `"joh***@example.com"` (first 3 chars visible)
2. Should mask short email (less than 3 characters in local part)
   - Input: `"ab@example.com"`
   - Expected: `"ab***@example.com"` (shows all available chars up to 3)
3. Should handle email with missing domain gracefully
   - Input: `"testuser@"`
   - Expected: `"tes***@"` (handles malformed input)

#### Mocks Required

- None (pure functions with no dependencies)

#### Patterns to Follow

- Use `describe` block for each function
- Use descriptive test names following pattern: "should [expected behavior] when [condition]"
- Use inline snapshots for expected values (not snapshot files)
- Test edge cases explicitly
- Reference: `tests/unit/lib/utils/cloudinary.utils.test.ts` for pure utility testing patterns

#### Validation Command

```bash
npm run test:unit -- tests/unit/lib/utils/email-utils.test.ts
```

#### Success Criteria

- All 7 tests pass
- 100% code coverage for `email-utils.ts`
- Tests run in isolation without external dependencies
- Clear test descriptions that serve as documentation

---

### Step 2: Action Response Helpers Tests

**Test Type**: Unit
**Priority**: High
**Source File**: `C:\Users\JasonPaff\dev\head-shakers\src\lib\utils\action-response.ts`
**Test File to Create**: `C:\Users\JasonPaff\dev\head-shakers\tests\unit\lib\utils\action-response.test.ts`

#### Test Cases (6 total)

**actionSuccess (2 tests - HIGH)**

1. Should create success response with data only
   - Input: `actionSuccess({ id: "123" })`
   - Expected: `{ data: { id: "123" }, wasSuccess: true }` (no message field)
2. Should create success response with data and message
   - Input: `actionSuccess({ id: "123" }, "Success!")`
   - Expected: `{ data: { id: "123" }, message: "Success!", wasSuccess: true }`

**actionFailure (1 test - HIGH)**

1. Should create failure response with message
   - Input: `actionFailure("Error occurred")`
   - Expected: `{ data: null, message: "Error occurred", wasSuccess: false }`

**Type Guards (3 tests - LOW)**

1. Should identify success response with isActionSuccess
   - Input: Success response object
   - Expected: `true` for success, `false` for failure
2. Should identify failure response with isActionFailure
   - Input: Failure response object
   - Expected: `true` for failure, `false` for success
3. Should unwrap successful response data or throw on failure
   - Test `unwrapActionResponse` with both success and failure cases
   - Verify error thrown contains failure message

#### Mocks Required

- None (pure functions)

#### Patterns to Follow

- Group tests by function in `describe` blocks
- Test discriminated union type narrowing
- Verify TypeScript types are correctly inferred (compile-time checks)
- Test both positive and negative cases for type guards
- Reference: Validation test files for similar schema testing patterns

#### Validation Command

```bash
npm run test:unit -- tests/unit/lib/utils/action-response.test.ts
```

#### Success Criteria

- All 6 tests pass
- Type guards correctly narrow TypeScript types
- 100% code coverage for response helper functions
- Clear demonstration of discriminated union behavior

---

### Step 3: Newsletter Validation Schema Tests

**Test Type**: Unit
**Priority**: Critical
**Source File**: `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\newsletter.validation.ts`
**Test File to Create**: `C:\Users\JasonPaff\dev\head-shakers\tests\unit\lib\validations\newsletter.validation.test.ts`

#### Test Cases (12 total)

**insertNewsletterSignupSchema (6 tests - CRITICAL)**

1. Should accept valid email address
   - Input: `{ email: "user@example.com" }`
   - Expected: Success with email `"user@example.com"`
2. Should reject invalid email format (missing @)
   - Input: `{ email: "notanemail" }`
   - Expected: Validation error with message about email format
3. Should reject email exceeding maximum length
   - Input: `{ email: "a".repeat(246) + "@test.com" }` (256 chars total, max is 255)
   - Expected: Validation error: `"Email must be at most 255 characters"`
4. Should trim whitespace from email
   - Input: `{ email: "  user@example.com  " }`
   - Expected: Success with email `"user@example.com"` (trimmed)
5. Should reject empty email
   - Input: `{ email: "" }`
   - Expected: Validation error about email format
6. Should reject email with only whitespace
   - Input: `{ email: "   " }`
   - Expected: Validation error (trimmed to empty)

**unsubscribeFromNewsletterSchema (6 tests - CRITICAL)**

1. Should accept valid email address
   - Input: `{ email: "user@example.com" }`
   - Expected: Success with email `"user@example.com"`
2. Should reject invalid email format
   - Input: `{ email: "invalid.email" }`
   - Expected: Validation error with message `"Please enter a valid email address"`
3. Should reject email exceeding maximum length (255 chars)
   - Input: `{ email: "a".repeat(246) + "@test.com" }`
   - Expected: Validation error: `"Email must be at most 255 characters"`
4. Should trim whitespace from email
   - Input: `{ email: "  unsubscribe@example.com  " }`
   - Expected: Success with email `"unsubscribe@example.com"`
5. Should reject missing email field
   - Input: `{}`
   - Expected: Validation error about required field
6. Should accept email at maximum allowed length
   - Input: 255-character valid email
   - Expected: Success (boundary test)

#### Mocks Required

- Import `SCHEMA_LIMITS` constant for max length validation

#### Patterns to Follow

- Use `describe` blocks for each schema
- Test both `.parse()` and `.safeParse()` methods
- Verify error messages match expected text from schema definitions
- Test boundary conditions (max length, min length)
- Verify trimming behavior explicitly
- Reference: `tests/unit/lib/validations/users.validation.test.ts` for validation testing patterns

#### Validation Command

```bash
npm run test:unit -- tests/unit/lib/validations/newsletter.validation.test.ts
```

#### Success Criteria

- All 12 tests pass
- Error messages match schema definitions
- Boundary conditions properly tested
- Trimming behavior verified
- 100% coverage of schema validation logic

---

### Step 4: Newsletter Query Layer Tests

**Test Type**: Unit
**Priority**: High
**Source File**: `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\newsletter\newsletter.queries.ts`
**Test File to Create**: `C:\Users\JasonPaff\dev\head-shakers\tests\unit\lib\queries\newsletter\newsletter.queries.test.ts`

#### Test Cases (16 total)

**createSignupAsync (3 tests - HIGH)**

1. Should create new signup with normalized email and userId
   - Mock insert operation returning new record
   - Verify email normalized before insert
   - Verify userId passed correctly
2. Should handle conflict gracefully (onConflictDoNothing)
   - Mock insert returning empty array (conflict case)
   - Expected: `null` return value
3. Should handle anonymous signup (userId undefined)
   - Verify userId can be undefined
   - Mock successful insert with userId = undefined

**emailExistsAsync (2 tests - MEDIUM)**

1. Should return true when email exists
   - Mock select query returning record
   - Expected: `true`
2. Should return false when email doesn't exist
   - Mock select query returning empty array
   - Expected: `false`

**findByEmailAsync (2 tests - HIGH)**

1. Should find signup by normalized email
   - Mock select query returning record
   - Verify email normalized in where clause
   - Expected: Newsletter signup record
2. Should return null when email not found
   - Mock select query returning empty array
   - Expected: `null`

**getActiveSubscriberAsync (3 tests - CRITICAL)**

1. Should return subscriber when active (not unsubscribed)
   - Mock record with `unsubscribedAt = null`
   - Expected: Newsletter signup record
2. Should return null when subscriber is unsubscribed
   - Mock record with `unsubscribedAt = new Date()`
   - Expected: `null`
3. Should return null when email doesn't exist
   - Mock empty query result
   - Expected: `null`

**getIsActiveSubscriberAsync (2 tests - CRITICAL)**

1. Should return true for active subscriber
   - Mock query returning `{ exists: 1 }`
   - Verify WHERE clause checks subscribedAt NOT NULL and unsubscribedAt IS NULL
   - Expected: `true`
2. Should return false for inactive/non-existent subscriber
   - Mock query returning empty array
   - Expected: `false`

**resubscribeAsync (2 tests - HIGH)**

1. Should resubscribe existing email (clear unsubscribedAt, update subscribedAt)
   - Mock findByEmailAsync returning existing record
   - Mock update returning resubscribed record
   - Verify both timestamps updated
2. Should return null when email doesn't exist
   - Mock findByEmailAsync returning null
   - Expected: `null` (no update attempted)

**unsubscribeAsync (1 test - HIGH)**

1. Should set unsubscribedAt timestamp for normalized email
   - Mock update returning updated record
   - Verify email normalized in where clause
   - Expected: Updated signup record

**updateUserIdAsync (1 test - MEDIUM)**

1. Should update userId only if currently null
   - Mock findByEmailAsync returning record with userId = null
   - Mock update returning updated record
   - Expected: Updated record with userId set
2. Should return null when userId already set (idempotent check)
   - Mock existing record with userId already set
   - Expected: `null` (no update)

#### Mocks Required

- **Database Instance**: Mock Drizzle database client
- **Query Context**: Mock `QueryContext` with db instance
- **Query Builders**: Mock Drizzle chain methods:
  - `insert().values().onConflictDoNothing().returning()`
  - `select().from().where().limit()`
  - `update().set().where().returning()`
- **Email Normalization**: Import actual `normalizeEmail` utility (don't mock)
- **BaseQuery Methods**: Mock `getDbInstance(context)` to return mocked db

#### Patterns to Follow

- Create reusable mock factory for Drizzle query builders
- Mock database at the query builder level, not at the query method level
- Verify email normalization is called for all email-based queries
- Test return value transformations (array to single record or null)
- Use `vi.fn()` for mocking and verify calls with `expect().toHaveBeenCalledWith()`
- Reference: Query transformer tests for mocking patterns

#### Validation Command

```bash
npm run test:unit -- tests/unit/lib/queries/newsletter/newsletter.queries.test.ts
```

#### Success Criteria

- All 16 tests pass
- Email normalization verified in all query methods
- Proper null handling for not-found cases
- onConflictDoNothing behavior tested
- Query builder mocks properly chained
- 100% coverage of query methods

---

### Step 5: Newsletter Facade Layer Tests

**Test Type**: Unit
**Priority**: Critical
**Source File**: `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\newsletter\newsletter.facade.ts`
**Test File to Create**: `C:\Users\JasonPaff\dev\head-shakers\tests\unit\lib\facades\newsletter\newsletter.facade.test.ts`

#### Test Cases (14 total)

**subscribeAsync - New Subscriptions (4 tests - CRITICAL)**

1. Should create new subscription and send welcome email
   - Mock `findByEmailAsync` returning null (new subscriber)
   - Mock `createSignupAsync` returning new record
   - Mock `sendWelcomeEmailAsync` (verify called)
   - Mock cache invalidation
   - Expected: `{ isSuccessful: true, isAlreadySubscribed: false, signup: <record> }`
2. Should handle race condition (conflict after check)
   - Mock `createSignupAsync` returning null (conflict)
   - Mock second `findByEmailAsync` returning existing record
   - Expected: `{ isSuccessful: true, isAlreadySubscribed: true, signup: <record> }`
3. Should normalize email before all operations
   - Verify `normalizeEmail` called with input email
   - Verify normalized email used in all queries
4. Should invalidate cache after successful subscription
   - Mock `CacheRevalidationService.newsletter.onSubscriptionChange`
   - Verify called with normalized email and 'subscribe' operation

**subscribeAsync - Existing Subscribers (3 tests - CRITICAL)**

1. Should return success for already active subscriber (privacy-preserving)
   - Mock `findByEmailAsync` returning active subscriber (unsubscribedAt = null)
   - Expected: `{ isSuccessful: true, isAlreadySubscribed: true, signup: <record> }`
   - Verify no new signup created
2. Should update userId if provided and not already set
   - Mock existing active subscriber with userId = null
   - Mock `updateUserIdAsync` called
   - Expected: userId updated
3. Should not update userId if already set
   - Mock existing subscriber with userId already set
   - Verify `updateUserIdAsync` not called

**subscribeAsync - Resubscriptions (2 tests - HIGH)**

1. Should resubscribe previously unsubscribed email
   - Mock `findByEmailAsync` returning unsubscribed record (unsubscribedAt not null)
   - Mock `resubscribeAsync` returning updated record
   - Expected: `{ isSuccessful: true, isAlreadySubscribed: false, signup: <resubscribed> }`
2. Should update userId on resubscription if provided and different
   - Mock resubscribed record with different userId
   - Mock `updateUserIdAsync` called

**unsubscribeAsync (2 tests - CRITICAL)**

1. Should unsubscribe existing email and invalidate cache
   - Mock `unsubscribeAsync` returning updated record
   - Mock cache invalidation
   - Expected: `{ isSuccessful: true, isAlreadySubscribed: false, signup: <record> }`
2. Should return success even if email doesn't exist (privacy-preserving)
   - Mock `unsubscribeAsync` returning null
   - Expected: `{ isSuccessful: true, signup: null }`
   - Verify cache still invalidated (privacy)

**getIsActiveSubscriberAsync (2 tests - HIGH)**

1. Should return cached result when available
   - Mock `CacheService.newsletter.isActiveSubscriber` returning cached value
   - Verify query not called
   - Expected: Cached boolean value
2. Should query and cache result when cache miss
   - Mock cache miss, calling provided function
   - Mock query returning boolean
   - Expected: Query result

**sendWelcomeEmailAsync (1 test - MEDIUM)**

1. Should not throw error if welcome email fails
   - Mock `ResendService.sendNewsletterWelcomeAsync` throwing error
   - Mock Sentry warning capture
   - Expected: No error thrown, warning logged

#### Mocks Required

- **Newsletter Query Methods**: Mock all `NewsletterQuery` static methods
  - `findByEmailAsync`
  - `createSignupAsync`
  - `resubscribeAsync`
  - `unsubscribeAsync`
  - `updateUserIdAsync`
  - `getIsActiveSubscriberAsync`
- **Cache Service**: Mock `CacheService.newsletter.isActiveSubscriber`
- **Cache Revalidation**: Mock `CacheRevalidationService.newsletter.onSubscriptionChange`
- **Resend Service**: Mock `ResendService.sendNewsletterWelcomeAsync`
- **Sentry Functions**: Mock `captureFacadeWarning` and `facadeBreadcrumb`
- **Email Normalization**: Import actual utility (don't mock)
- **Database Instance**: Mock db instance passed to facade methods
- **executeFacadeOperation**: Mock or use actual (consider testing wrapper separately)

#### Patterns to Follow

- Mock at module boundaries (queries, services, utilities)
- Test privacy-preserving behavior explicitly
- Verify cache invalidation in all mutation paths
- Test async error handling (email sending failures)
- Use `vi.spyOn` for mocking module exports
- Verify Sentry breadcrumbs/warnings captured appropriately
- Test idempotency (calling operations multiple times)
- Reference: Integration facade tests for mocking patterns, but focus on unit isolation

#### Validation Command

```bash
npm run test:unit -- tests/unit/lib/facades/newsletter/newsletter.facade.test.ts
```

#### Success Criteria

- All 14 tests pass
- Privacy-preserving behavior verified
- Cache invalidation tested in all paths
- Error handling doesn't break subscription flow
- Proper mocking of external dependencies
- 100% coverage of facade methods

---

### Step 6: Newsletter Server Actions Tests

**Test Type**: Unit
**Priority**: High
**Source File**: `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\newsletter\newsletter.actions.ts`
**Test File to Create**: `C:\Users\JasonPaff\dev\head-shakers\tests\unit\lib\actions\newsletter\newsletter.actions.test.ts`

#### Test Cases (6 total)

**subscribeToNewsletterAction (3 tests - HIGH)**

1. Should return success response for new subscription
   - Mock validation passing
   - Mock `NewsletterFacade.subscribeAsync` returning success with `isAlreadySubscribed: false`
   - Mock `getUserIdAsync` returning userId
   - Expected: `actionSuccess` with `{ isAlreadySubscribed: false, signupId: "<id>" }`
   - Verify success message: "Thanks for subscribing! You'll receive our latest updates."
2. Should return success response for existing subscriber (same message for privacy)
   - Mock facade returning `isAlreadySubscribed: true`
   - Expected: Same success message as new subscription (privacy-preserving)
   - Verify signupId included
3. Should return failure response when facade fails
   - Mock facade returning `{ isSuccessful: false, error: "Database error" }`
   - Expected: `actionFailure` with message: "Unable to process your subscription. Please try again."
   - Verify Sentry breadcrumb captured

**unsubscribeFromNewsletterAction (3 tests - HIGH)**

1. Should return success response for valid unsubscribe
   - Mock validation passing
   - Mock `NewsletterFacade.unsubscribeAsync` returning success
   - Expected: `actionSuccess` with message: "You have been unsubscribed from the newsletter."
2. Should return same success message even if email doesn't exist (privacy)
   - Mock facade returning success with signup = null
   - Expected: Same success message (privacy-preserving)
3. Should return failure response when facade fails
   - Mock facade returning `{ isSuccessful: false, error: "Error" }`
   - Expected: `actionFailure` with message: "Unable to process your unsubscribe request. Please try again."

#### Mocks Required

- **Newsletter Facade**: Mock `NewsletterFacade.subscribeAsync` and `NewsletterFacade.unsubscribeAsync`
- **Auth Utility**: Mock `getUserIdAsync()` returning mock Clerk user ID or null
- **Validation Schemas**: Use actual schemas (test validation integration)
- **Action Client**: Mock `publicActionClient` and rate limiting middleware
  - Mock `.metadata()`, `.inputSchema()`, `.action()` chain
- **Action Context**: Mock `ctx` with `db` instance and `sanitizedInput`
- **Sentry Functions**: Mock `actionBreadcrumb` and `withActionErrorHandling`
- **Email Masking**: Import actual `maskEmail` utility

#### Patterns to Follow

- Test action client middleware integration
- Verify input validation occurs before facade calls
- Test both authenticated and anonymous user scenarios
- Verify privacy-preserving messaging (same message for all cases)
- Test error handling and failure responses
- Verify Sentry breadcrumbs captured with masked email
- Mock at facade layer, use real validation
- Reference: Integration action tests for structure, but maintain unit isolation

#### Validation Command

```bash
npm run test:unit -- tests/unit/lib/actions/newsletter/newsletter.actions.test.ts
```

#### Success Criteria

- All 6 tests pass
- Privacy-preserving messages verified
- Input validation tested
- Error handling paths covered
- Sentry integration verified
- Both authenticated and anonymous flows tested
- 100% coverage of action logic

---

## Quality Gates

### All Tests Must Pass

- **Total**: 59 tests across 6 test files
- **Zero Failures**: All tests must pass consistently
- **No Flaky Tests**: Tests must be deterministic and reliable

### TypeScript Compliance

- **No Type Errors**: `npm run typecheck` must pass
- **Strict Mode**: All tests written in strict TypeScript mode
- **Type Inference**: Proper type narrowing and inference verified

### Code Coverage

- **Target**: 100% coverage for all source files under test
- **Branches**: All conditional branches covered
- **Edge Cases**: Boundary conditions and error paths tested

### Code Quality

- **Linting**: All test files pass ESLint without warnings
- **Formatting**: All files formatted with Prettier
- **Naming Conventions**: Descriptive test names following project patterns
- **No Disabled Rules**: No ESLint disable comments
- **No Type Ignores**: No TS-ignore comments

### Testing Best Practices

- **Isolation**: Each test runs independently without side effects
- **Mocking**: External dependencies properly mocked at module boundaries
- **Clarity**: Test descriptions serve as documentation
- **Maintainability**: Tests are easy to understand and update
- **Performance**: Unit tests complete in under 100ms total

### Documentation

- **Test Plans**: This implementation plan serves as test documentation
- **Comments**: Complex mocking strategies explained with inline comments
- **Examples**: Follow existing test patterns in the codebase

### Validation Commands

```bash
# Run all newsletter unit tests
npm run test:unit -- tests/unit/lib/utils/email-utils.test.ts tests/unit/lib/utils/action-response.test.ts tests/unit/lib/validations/newsletter.validation.test.ts tests/unit/lib/queries/newsletter/newsletter.queries.test.ts tests/unit/lib/facades/newsletter/newsletter.facade.test.ts tests/unit/lib/actions/newsletter/newsletter.actions.test.ts

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run formatting check
npm run format

# Generate coverage report
npm run test:coverage -- tests/unit/lib/utils/email-utils.test.ts tests/unit/lib/utils/action-response.test.ts tests/unit/lib/validations/newsletter.validation.test.ts tests/unit/lib/queries/newsletter/newsletter.queries.test.ts tests/unit/lib/facades/newsletter/newsletter.facade.test.ts tests/unit/lib/actions/newsletter/newsletter.actions.test.ts
```

---

## Implementation Order Rationale

The steps are ordered to minimize dependencies and maximize parallel development:

1. **Step 1 (Email Utils)**: Pure functions with no dependencies - can be implemented first
2. **Step 2 (Action Response)**: Pure functions used by facades/actions - implement early
3. **Step 3 (Validation Schemas)**: Zod schemas used by actions - no external dependencies
4. **Step 4 (Query Layer)**: Database operations - depends only on utilities
5. **Step 5 (Facade Layer)**: Business logic - depends on queries and utilities
6. **Step 6 (Action Layer)**: Server actions - depends on facades, validation, and utilities

This order allows:

- Early completion of foundational layers
- Parallel work on Steps 1-3 (no interdependencies)
- Clear testing of integration points as layers build up
- Bottom-up testing approach ensuring stable foundation

---

## Risk Mitigation

### High-Risk Areas

1. **Privacy Violations**: Email enumeration attacks
   - Mitigation: Explicitly test privacy-preserving messaging
2. **Email Normalization**: Case sensitivity causing duplicates
   - Mitigation: Test normalization in every layer
3. **Race Conditions**: Concurrent signups
   - Mitigation: Test conflict handling with mocks
4. **Cache Invalidation**: Stale subscription status
   - Mitigation: Verify cache invalidation in all mutation paths

### Testing Challenges

1. **Mocking Complexity**: Facade/action layers have many dependencies
   - Mitigation: Create reusable mock factories
2. **Async Operations**: Welcome email sending
   - Mitigation: Test error handling doesn't break flow
3. **Type Safety**: Drizzle query builder types
   - Mitigation: Use proper TypeScript mocking with vi.spyOn

---

## Notes

- This plan focuses on **unit tests only** - integration tests are out of scope
- All tests should use **Vitest** as the test runner
- Mock external dependencies at **module boundaries**
- Prioritize **privacy-preserving behavior** testing
- Verify **email normalization** happens consistently across all layers
- Test files should mirror source structure in `tests/unit/lib/` directory
- Use existing test files as reference for consistent patterns and style
