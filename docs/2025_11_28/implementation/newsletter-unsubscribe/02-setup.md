# Setup and Step-Type Detection

**Timestamp**: 2025-11-28T12:01:00Z

## Step-Type Detection Results

Using the detection algorithm to route each step to the appropriate specialist:

### Step 1: Add Unsubscribe Validation Schema

- **Files**: `src/lib/validations/newsletter.validation.ts`
- **Detection Rule**: Files contain `src/lib/validations/` OR end with `.validation.ts` → **validation-specialist**
- **Skills to Load**: validation-schemas

### Step 2: Add Unsubscribe Facade Method

- **Files**: `src/lib/facades/newsletter/newsletter.facade.ts`
- **Detection Rule**: Files contain `src/lib/facades/` OR end with `.facade.ts` → **facade-specialist**
- **Skills to Load**: facade-layer, caching, sentry-server, drizzle-orm

### Step 3: Add Unsubscribe Server Action

- **Files**: `src/lib/actions/newsletter/newsletter.actions.ts`
- **Detection Rule**: Files contain `src/lib/actions/` OR end with `.actions.ts` → **server-action-specialist**
- **Skills to Load**: server-actions, sentry-server, validation-schemas

### Step 4: Convert Footer Component to Server Component with Client Islands

- **Files**:
  - `src/components/layout/app-footer/components/footer-newsletter.tsx` (convert to server)
  - `src/components/layout/app-footer/components/footer-newsletter-subscribe.tsx` (new client)
  - `src/components/layout/app-footer/components/footer-newsletter-unsubscribe.tsx` (new client)
- **Detection Rule**: Multi-domain step
  - Primary: `footer-newsletter.tsx` async server component → **server-component-specialist**
  - Secondary: Client components with hooks/events → client-component-specialist
- **Skills to Load**: react-coding-conventions, ui-components, server-components, client-components

### Step 5: Handle Edge Cases and Privacy Considerations

- **Files**:
  - `src/lib/facades/newsletter/newsletter.facade.ts`
  - `src/lib/actions/newsletter/newsletter.actions.ts`
- **Detection Rule**: Review/validation step across multiple domains → **general-purpose**
- **Skills to Load**: None (manual review step)

## Routing Table

| Step | Specialist                  | Primary Domain     | Secondary Domains |
| ---- | --------------------------- | ------------------ | ----------------- |
| 1    | validation-specialist       | Validation Schemas | -                 |
| 2    | facade-specialist           | Business Logic     | -                 |
| 3    | server-action-specialist    | Server Actions     | -                 |
| 4    | server-component-specialist | Server Components  | Client Components |
| 5    | general-purpose             | Review             | Facades, Actions  |

## Step Dependencies

- Step 2 depends on Step 1 (facade uses validation types)
- Step 3 depends on Step 2 (action uses facade)
- Step 4 depends on Step 3 (components use action)
- Step 5 depends on Steps 2-4 (review step)

## Files Summary

**Files to Modify**:

1. `src/lib/validations/newsletter.validation.ts`
2. `src/lib/facades/newsletter/newsletter.facade.ts`
3. `src/lib/actions/newsletter/newsletter.actions.ts`
4. `src/components/layout/app-footer/components/footer-newsletter.tsx`

**Files to Create**:

1. `src/components/layout/app-footer/components/footer-newsletter-subscribe.tsx`
2. `src/components/layout/app-footer/components/footer-newsletter-unsubscribe.tsx`

## CHECKPOINT

Setup complete, beginning implementation with Step 1.
