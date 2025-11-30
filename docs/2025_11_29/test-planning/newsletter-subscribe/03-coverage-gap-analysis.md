# Step 3: Coverage Gap Analysis

**Step**: 3 of 4
**Status**: Completed
**Started**: 2025-11-29T00:02:00Z
**Completed**: 2025-11-29T00:03:00Z

## Input

**Source Files Analyzed**: 7
**Existing Tests**: 0
**Scope Filter**: unit

## Coverage Matrix

| Source File                                        | Unit Tests | Status      |
| -------------------------------------------------- | ---------- | ----------- |
| `src/lib/validations/newsletter.validation.ts`     | 0          | Missing     |
| `src/lib/utils/email-utils.ts`                     | 0          | Missing     |
| `src/lib/utils/action-response.ts`                 | 0          | Missing     |
| `src/lib/facades/newsletter/newsletter.facade.ts`  | 0          | Missing     |
| `src/lib/queries/newsletter/newsletter.queries.ts` | 0          | Missing     |
| `src/lib/actions/newsletter/newsletter.actions.ts` | 0          | Missing     |
| `src/lib/db/schema/newsletter-signups.schema.ts`   | N/A        | Schema only |

## Coverage Gaps by Priority

### Critical Priority (14 Tests)

**File**: `src/lib/facades/newsletter/newsletter.facade.ts`

| Function                     | Test Cases Needed | Risk                        |
| ---------------------------- | ----------------- | --------------------------- |
| `subscribeAsync`             | 9                 | Core subscription logic     |
| `unsubscribeAsync`           | 3                 | Privacy-preserving behavior |
| `getIsActiveSubscriberAsync` | 2                 | Cache integration           |

### High Priority (32 Tests)

**File**: `src/lib/validations/newsletter.validation.ts` (12 tests)

| Export                            | Test Cases                                    |
| --------------------------------- | --------------------------------------------- |
| `insertNewsletterSignupSchema`    | 9 (valid, invalid, trim, length, omit fields) |
| `unsubscribeFromNewsletterSchema` | 3 (valid, invalid, length)                    |

**File**: `src/lib/queries/newsletter/newsletter.queries.ts` (16 tests)

| Function                     | Test Cases |
| ---------------------------- | ---------- |
| `createSignupAsync`          | 4          |
| `findByEmailAsync`           | 3          |
| `getActiveSubscriberAsync`   | 2          |
| `getIsActiveSubscriberAsync` | 3          |
| `emailExistsAsync`           | 2          |
| `resubscribeAsync`           | 2          |
| `unsubscribeAsync`           | 2          |
| `updateUserIdAsync`          | 3          |

**File**: `src/lib/utils/action-response.ts` (6 tests)

| Function        | Test Cases |
| --------------- | ---------- |
| `actionSuccess` | 4          |
| `actionFailure` | 2          |

### Medium Priority (5 Tests)

**File**: `src/lib/utils/email-utils.ts`

| Function         | Test Cases |
| ---------------- | ---------- |
| `normalizeEmail` | 5          |
| `maskEmail`      | 2          |

### Low Priority (6 Tests)

**File**: `src/lib/actions/newsletter/newsletter.actions.ts`

| Function                          | Test Cases |
| --------------------------------- | ---------- |
| `subscribeToNewsletterAction`     | 3          |
| `unsubscribeFromNewsletterAction` | 3          |

## Test Count Summary

| Priority  | Files | Tests  |
| --------- | ----- | ------ |
| Critical  | 1     | 14     |
| High      | 3     | 32     |
| Medium    | 1     | 7      |
| Low       | 1     | 6      |
| **Total** | **6** | **59** |

## Test Files to Create

```
tests/unit/lib/
├── validations/
│   └── newsletter.validation.test.ts (12 tests)
├── utils/
│   ├── email-utils.test.ts (7 tests)
│   └── action-response.test.ts (6 tests)
├── facades/
│   └── newsletter/
│       └── newsletter.facade.test.ts (14 tests)
├── queries/
│   └── newsletter/
│       └── newsletter.queries.test.ts (16 tests)
└── actions/
    └── newsletter/
        └── newsletter.actions.test.ts (6 tests)
```

## Critical Testing Notes

1. **Privacy-Preserving Behavior**: Unsubscribe must return success for non-existent emails (prevents enumeration)
2. **Email Normalization**: All layers must normalize emails consistently (lowercase, trim)
3. **Cache Invalidation**: Must invalidate cache after subscribe/unsubscribe operations
4. **Welcome Email**: Failures should not affect subscription success (non-blocking)

## Validation Results

- All source files analyzed: Yes
- Gaps prioritized: Yes
- Test estimates provided: Yes (59 total tests)
