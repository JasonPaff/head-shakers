# Step 2: Source & Test Discovery

**Started**: 2025-11-29
**Status**: Complete
**Scope Filter**: e2e

## Source Files Discovered

### Critical (Core Logic - Business Layer)

| File                                               | Description                                                |
| -------------------------------------------------- | ---------------------------------------------------------- |
| `src/lib/facades/newsletter/newsletter.facade.ts`  | Business logic facade for subscribe/unsubscribe operations |
| `src/lib/actions/newsletter/newsletter.actions.ts` | Server actions with rate limiting and validation           |
| `src/lib/queries/newsletter/newsletter.queries.ts` | Database queries for newsletter operations                 |

### High (User-Facing Components)

| File                                                                            | Description                                       |
| ------------------------------------------------------------------------------- | ------------------------------------------------- |
| `src/components/layout/app-footer/components/footer-newsletter.tsx`             | Server component orchestrating newsletter display |
| `src/components/layout/app-footer/components/footer-newsletter-subscribe.tsx`   | Client subscribe form with optimistic UI          |
| `src/components/layout/app-footer/components/footer-newsletter-unsubscribe.tsx` | Client unsubscribe interface                      |
| `src/components/layout/app-footer/app-footer.tsx`                               | Main footer with newsletter section               |

### Medium (Supporting - Validations, Services)

| File                                             | Description                               |
| ------------------------------------------------ | ----------------------------------------- |
| `src/lib/validations/newsletter.validation.ts`   | Zod schemas for newsletter validation     |
| `src/lib/db/schema/newsletter-signups.schema.ts` | Drizzle ORM schema for newsletter_signups |
| `src/lib/services/cache.service.ts`              | Cache service with newsletter methods     |
| `src/lib/services/cache-revalidation.service.ts` | Cache invalidation service                |
| `src/lib/services/resend.service.ts`             | Email service for welcome emails          |

### Low (Utilities, Constants)

| File                                        | Description                     |
| ------------------------------------------- | ------------------------------- |
| `src/lib/utils/email-utils.ts`              | Email normalization and masking |
| `src/lib/utils/cache-tags.utils.ts`         | Cache tag generators            |
| `src/hooks/use-optimistic-server-action.ts` | Optimistic update hook          |
| `src/lib/constants/action-names.ts`         | Action name constants           |
| `src/lib/constants/cache.ts`                | Cache configuration             |

## Existing Test Files

### Footer Component Tests (Not Newsletter-Specific)

| File                                                              | Description                |
| ----------------------------------------------------------------- | -------------------------- |
| `tests/components/layout/app-footer/app-footer.test.tsx`          | Footer component tests     |
| `tests/components/layout/app-footer/footer-legal.test.tsx`        | Footer legal section tests |
| `tests/components/layout/app-footer/footer-social-links.test.tsx` | Footer social links tests  |
| `tests/components/layout/app-footer/footer-nav-link.test.tsx`     | Footer nav link tests      |

### E2E Test Files (May Cover Footer)

| File                                              | Description                   |
| ------------------------------------------------- | ----------------------------- |
| `tests/e2e/specs/smoke/auth-flow.spec.ts`         | Auth flow smoke tests         |
| `tests/e2e/specs/smoke/health.spec.ts`            | Health check tests            |
| `tests/e2e/specs/public/home-sections.spec.ts`    | Public home page sections     |
| `tests/e2e/specs/user/home-authenticated.spec.ts` | Authenticated home page tests |

### Test Infrastructure

| File                             | Description                                       |
| -------------------------------- | ------------------------------------------------- |
| `tests/setup/test-db.ts`         | Test database setup (includes newsletter_signups) |
| `tests/mocks/handlers/index.ts`  | MSW handlers index                                |
| `tests/mocks/data/users.mock.ts` | User mock data                                    |

## Summary

- **Source Files**: 21 files discovered
- **Existing Tests**: 4 footer component tests (none newsletter-specific)
- **E2E Tests**: 4 existing specs (none newsletter-specific)
- **Test Infrastructure**: Ready (newsletter_signups in known tables)

## Key Finding

**No E2E tests exist specifically for the newsletter subscribe/unsubscribe feature.** The existing E2E tests cover authentication flows and general page sections but do not test the newsletter functionality in the footer.
