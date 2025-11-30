# Step 2: File Discovery

**Started**: 2025-11-29T00:00:30.000Z
**Completed**: 2025-11-29T00:01:30.000Z
**Status**: Success

## Input

Refined feature request for newsletter subscription component in footer with differentiated experiences for authenticated and public users.

## Discovery Results

### Critical Priority (Core Implementation)

| File                                                                            | Description                                                                   | Status             |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------ |
| `src/components/layout/app-footer/components/footer-newsletter.tsx`             | Current placeholder (4 lines) - needs full implementation                     | EXISTS             |
| `src/components/layout/app-footer/components/footer-newsletter-subscribe.tsx`   | Subscribe client component                                                    | NEW FILE           |
| `src/components/layout/app-footer/components/footer-newsletter-unsubscribe.tsx` | Unsubscribe client component                                                  | NEW FILE           |
| `src/lib/actions/newsletter/newsletter.actions.ts`                              | Server actions (subscribeToNewsletterAction, unsubscribeFromNewsletterAction) | EXISTS (142 lines) |
| `src/lib/validations/newsletter.validation.ts`                                  | Zod schemas (insertNewsletterSignupSchema)                                    | EXISTS (58 lines)  |
| `src/lib/facades/newsletter/newsletter.facade.ts`                               | NewsletterFacade with getIsActiveSubscriberAsync                              | EXISTS (248 lines) |
| `src/lib/queries/newsletter/newsletter.queries.ts`                              | Database query methods                                                        | EXISTS (219 lines) |
| `src/lib/db/schema/newsletter-signups.schema.ts`                                | Newsletter signups table schema                                               | EXISTS (46 lines)  |

### High Priority (Supporting Infrastructure)

| File                                                     | Description                                     | Status             |
| -------------------------------------------------------- | ----------------------------------------------- | ------------------ |
| `src/utils/auth-utils.ts`                                | getUserIdAsync() for authentication             | EXISTS (69 lines)  |
| `src/lib/facades/users/users.facade.ts`                  | UsersFacade.getEmailByUserIdAsync()             | EXISTS             |
| `src/hooks/use-server-action.ts`                         | Hook with isDisableToast for optimistic updates | EXISTS (190 lines) |
| `src/hooks/use-like.tsx`                                 | Example of optimistic updates pattern           | EXISTS (103 lines) |
| `src/components/ui/form/index.tsx`                       | useAppForm hook export                          | EXISTS             |
| `src/components/ui/form/field-components/text-field.tsx` | TextField for email input                       | EXISTS (90 lines)  |
| `src/components/ui/button.tsx`                           | Button with destructive variant                 | EXISTS (96 lines)  |
| `src/lib/test-ids/generator.ts`                          | generateTestId() function                       | EXISTS (312 lines) |

### Medium Priority (Reference Examples)

| File                                                                  | Description                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/components/layout/app-footer/app-footer.tsx`                     | Main footer showing where FooterNewsletter renders (line 62) |
| `src/components/layout/app-footer/components/footer-social-links.tsx` | Example footer component with styling patterns               |
| `src/components/layout/app-footer/components/footer-legal.tsx`        | Example with Tailwind styling                                |
| `src/app/(public)/coming-soon/launch-waitlist-form.tsx`               | Simple email form with useAppForm                            |
| `src/components/feature/users/username-edit-form.tsx`                 | Complex form with useServerAction                            |
| `src/lib/constants/action-names.ts`                                   | ACTION_NAMES.NEWSLETTER for breadcrumbs                      |

### Low Priority (Testing)

| File                                                              | Description              |
| ----------------------------------------------------------------- | ------------------------ |
| `tests/unit/lib/actions/newsletter/newsletter.actions.test.ts`    | Action unit tests        |
| `tests/e2e/specs/feature/newsletter-footer.spec.ts`               | E2E tests for newsletter |
| `tests/components/layout/app-footer/footer-social-links.test.tsx` | Component test example   |

## Architecture Insights

1. **Complete Backend Implementation**: All server actions, facades, queries, and database schema are fully implemented with privacy-preserving behavior, soft delete pattern, caching, and Sentry integration.

2. **Three-Tier Architecture**:
   - Actions Layer: Server actions with rate limiting, validation
   - Facade Layer: Business logic with caching
   - Query Layer: Drizzle ORM operations

3. **Optimistic Update Pattern** (from use-like.tsx):
   - Use `useState` for local subscription status
   - Update immediately in `onBeforeSuccess`
   - Rollback in `onBeforeError`
   - `isDisableToast: true` for authenticated users

4. **Styling Patterns** (from footer components):
   - Gradient backgrounds for dark mode
   - Focus rings with orange-500
   - Destructive button variant for unsubscribe

## Discovery Statistics

- Total files discovered: 45+
- Critical files: 8 (6 existing, 2 new)
- High priority files: 8
- Medium priority files: 8
- Low priority files: 6
