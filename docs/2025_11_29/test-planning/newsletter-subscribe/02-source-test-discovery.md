# Step 2: Source & Test Discovery

**Step**: 2 of 4
**Status**: Completed
**Started**: 2025-11-29T00:01:00Z
**Completed**: 2025-11-29T00:02:00Z

## Input

**Refined Scope**: Newsletter subscribe/unsubscribe feature unit tests including validation schemas, email utilities, facade business logic, query transformations, and action response builders.

## Discovery Results

### Source Files (21 files discovered)

#### Critical Priority - Core Implementation

| File Path | Category | Description |
|-----------|----------|-------------|
| `src/lib/validations/newsletter.validation.ts` | SOURCE | Zod schemas: insertNewsletterSignupSchema, unsubscribeFromNewsletterSchema |
| `src/lib/facades/newsletter/newsletter.facade.ts` | SOURCE | Business logic: getIsActiveSubscriberAsync, subscribeAsync, unsubscribeAsync |
| `src/lib/queries/newsletter/newsletter.queries.ts` | SOURCE | Database queries: createSignupAsync, findByEmailAsync, resubscribeAsync, etc. |
| `src/lib/actions/newsletter/newsletter.actions.ts` | SOURCE | Server actions: subscribeToNewsletterAction, unsubscribeFromNewsletterAction |

#### High Priority - Components

| File Path | Category | Description |
|-----------|----------|-------------|
| `src/components/layout/app-footer/components/footer-newsletter.tsx` | SOURCE | Server component - conditional subscribe/unsubscribe rendering |
| `src/components/layout/app-footer/components/footer-newsletter-subscribe.tsx` | SOURCE | Client component - email form with optimistic UI |
| `src/components/layout/app-footer/components/footer-newsletter-unsubscribe.tsx` | SOURCE | Client component - unsubscribe button with optimistic UI |

#### Medium Priority - Supporting

| File Path | Category | Description |
|-----------|----------|-------------|
| `src/lib/utils/email-utils.ts` | SOURCE | Utilities: maskEmail, normalizeEmail |
| `src/lib/utils/action-response.ts` | SOURCE | Helpers: actionSuccess, actionFailure |
| `src/lib/db/schema/newsletter-signups.schema.ts` | SOURCE | Table schema definition |
| `src/lib/services/resend.service.ts` | SOURCE | Email service: sendNewsletterWelcomeAsync |
| `src/lib/services/cache.service.ts` | SOURCE | Cache: newsletter.isActiveSubscriber |
| `src/lib/services/cache-revalidation.service.ts` | SOURCE | Cache invalidation: newsletter.onSubscriptionChange |
| `src/hooks/use-optimistic-server-action.ts` | SOURCE | Custom hook for optimistic UI updates |

#### Low Priority - Configuration

| File Path | Category | Description |
|-----------|----------|-------------|
| `src/lib/constants/operations.ts` | SOURCE | Operation names: OPERATIONS.NEWSLETTER |
| `src/lib/constants/schema-limits.ts` | SOURCE | Schema limits: NEWSLETTER_SIGNUP.EMAIL |
| `src/lib/constants/action-names.ts` | SOURCE | Action names for tracking |
| `src/lib/constants/cache.ts` | SOURCE | Cache configuration |
| `src/lib/constants/config.ts` | SOURCE | Rate limiting config |
| `src/components/layout/app-footer/app-footer.tsx` | SOURCE | Footer layout component |
| `src/lib/test-ids/generator.ts` | SOURCE | Test ID generator utility |

### Test Files (0 files discovered)

**No existing tests found for newsletter functionality.**

Search patterns used:
- `tests/unit/**/*newsletter*.test.ts` - No matches
- `tests/unit/**/*subscribe*.test.ts` - No matches
- `tests/components/**/*newsletter*.test.tsx` - No matches
- `tests/integration/**/*newsletter*.test.ts` - No matches
- `tests/e2e/specs/**/*newsletter*.spec.ts` - No matches

## Architecture Insights

**Key Patterns**:
1. **Layered Architecture**: Components → Actions → Facades → Queries → Schema
2. **Optimistic UI**: Both subscribe/unsubscribe use optimistic updates
3. **Privacy-Preserving**: Unsubscribe always returns success (prevents enumeration)
4. **Soft Delete**: Uses `unsubscribedAt` timestamp instead of hard deletes
5. **Email Normalization**: All operations normalize emails (lowercase, trim)
6. **Caching Strategy**: Subscription status cached with 4-hour TTL
7. **Rate Limiting**: Subscribe action has specific rate limits

## Validation Results

- Source files discovered: 21 (exceeds minimum of 3)
- Test files discovered: 0 (no existing coverage)
- All file paths validated as existing
- Files categorized by priority
