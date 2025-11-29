# Setup and Routing

**Timestamp**: 2025-11-29

## Extracted Implementation Steps

### Step 1: Email Utilities Tests
- **Test Type**: unit
- **Specialist**: unit-test-specialist
- **Priority**: Critical
- **Source File**: `src/lib/utils/email-utils.ts`
- **Test File**: `tests/unit/lib/utils/email-utils.test.ts`
- **Test Cases**: 7 total (normalizeEmail: 4, maskEmail: 3)

### Step 2: Action Response Helpers Tests
- **Test Type**: unit
- **Specialist**: unit-test-specialist
- **Priority**: High
- **Source File**: `src/lib/utils/action-response.ts`
- **Test File**: `tests/unit/lib/utils/action-response.test.ts`
- **Test Cases**: 6 total (actionSuccess: 2, actionFailure: 1, Type Guards: 3)

### Step 3: Newsletter Validation Schema Tests
- **Test Type**: unit
- **Specialist**: unit-test-specialist
- **Priority**: Critical
- **Source File**: `src/lib/validations/newsletter.validation.ts`
- **Test File**: `tests/unit/lib/validations/newsletter.validation.test.ts`
- **Test Cases**: 12 total (insertNewsletterSignupSchema: 6, unsubscribeFromNewsletterSchema: 6)

### Step 4: Newsletter Query Layer Tests
- **Test Type**: unit
- **Specialist**: unit-test-specialist
- **Priority**: High
- **Source File**: `src/lib/queries/newsletter/newsletter.queries.ts`
- **Test File**: `tests/unit/lib/queries/newsletter/newsletter.queries.test.ts`
- **Test Cases**: 16 total

### Step 5: Newsletter Facade Layer Tests
- **Test Type**: unit
- **Specialist**: unit-test-specialist
- **Priority**: Critical
- **Source File**: `src/lib/facades/newsletter/newsletter.facade.ts`
- **Test File**: `tests/unit/lib/facades/newsletter/newsletter.facade.test.ts`
- **Test Cases**: 14 total

### Step 6: Newsletter Server Actions Tests
- **Test Type**: unit
- **Specialist**: unit-test-specialist
- **Priority**: High
- **Source File**: `src/lib/actions/newsletter/newsletter.actions.ts`
- **Test File**: `tests/unit/lib/actions/newsletter/newsletter.actions.test.ts`
- **Test Cases**: 6 total

## Step Routing Table

| Step | Test Type | Specialist | Files | Test Count |
|------|-----------|------------|-------|------------|
| 1 | unit | unit-test-specialist | email-utils.test.ts | 7 |
| 2 | unit | unit-test-specialist | action-response.test.ts | 6 |
| 3 | unit | unit-test-specialist | newsletter.validation.test.ts | 12 |
| 4 | unit | unit-test-specialist | newsletter.queries.test.ts | 16 |
| 5 | unit | unit-test-specialist | newsletter.facade.test.ts | 14 |
| 6 | unit | unit-test-specialist | newsletter.actions.test.ts | 6 |

## Step Dependencies

- Steps 1-3: Independent (no dependencies)
- Step 4: Uses email-utils (Step 1)
- Step 5: Depends on queries (Step 4), uses utilities (Steps 1-2)
- Step 6: Depends on facade (Step 5), validation (Step 3), utilities (Steps 1-2)

## Todo List Created

7 items created:
1. Step 1: Email Utilities Tests [unit] - pending
2. Step 2: Action Response Helpers Tests [unit] - pending
3. Step 3: Newsletter Validation Schema Tests [unit] - pending
4. Step 4: Newsletter Query Layer Tests [unit] - pending
5. Step 5: Newsletter Facade Layer Tests [unit] - pending
6. Step 6: Newsletter Server Actions Tests [unit] - pending
7. Run full test validation - pending

## Checkpoint

Setup complete. Beginning implementation with Step 1.
