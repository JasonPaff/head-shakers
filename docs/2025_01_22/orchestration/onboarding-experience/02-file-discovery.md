# Step 2: AI-Powered File Discovery

## Step Metadata

| Field | Value |
|-------|-------|
| Start Time | 2025-01-22T00:00:30Z |
| End Time | 2025-01-22T00:01:30Z |
| Duration | ~60 seconds |
| Status | Success |

## Input

Refined feature request from Step 1 (onboarding wizard with Clerk auth, Radix UI Dialog, TanStack Form, Cloudinary integration).

## Discovery Results Summary

- **Directories Explored**: 15+
- **Files Examined**: 80+
- **Highly Relevant Files**: 32
- **Supporting Files**: 25+

## Critical Files (Must Create/Modify)

### Database Schema - New Column Required

| File | Priority | Action |
|------|----------|--------|
| `src/lib/db/schema/users.schema.ts` | CRITICAL | Add `hasCompletedOnboarding` boolean flag to `userSettings` table |

### New Components to Create

| File | Priority | Description |
|------|----------|-------------|
| `src/components/feature/onboarding/` (directory) | CRITICAL | New directory for onboarding components |
| `src/components/feature/onboarding/onboarding-wizard.tsx` | CRITICAL | Main wizard with multi-step navigation |
| `src/components/feature/onboarding/onboarding-provider.tsx` | CRITICAL | Provider component (model after username-onboarding-provider) |
| `src/components/feature/onboarding/steps/create-collection-step.tsx` | CRITICAL | Step 1: Create first collection |
| `src/components/feature/onboarding/steps/subcollection-intro-step.tsx` | CRITICAL | Step 2: Subcollection explanation |
| `src/components/feature/onboarding/steps/add-bobblehead-step.tsx` | CRITICAL | Step 3: Add first bobblehead |
| `src/components/feature/onboarding/onboarding-progress.tsx` | CRITICAL | Progress indicator |

### New Server Actions to Create

| File | Priority | Description |
|------|----------|-------------|
| `src/lib/actions/onboarding/` (directory) | CRITICAL | Directory for onboarding actions |
| `src/lib/actions/onboarding/onboarding.actions.ts` | CRITICAL | Actions for completing/skipping onboarding |

### New Facade to Create

| File | Priority | Description |
|------|----------|-------------|
| `src/lib/facades/onboarding/onboarding.facade.ts` | CRITICAL | Business logic for onboarding state management |

### New Validation to Create

| File | Priority | Description |
|------|----------|-------------|
| `src/lib/validations/onboarding.validation.ts` | CRITICAL | Zod schemas for onboarding actions |

## High Priority - Pattern Reference Files

### Existing Onboarding Pattern (Username Setup)

| File | Relevance |
|------|-----------|
| `src/components/feature/users/username-onboarding-provider.tsx` | Provider pattern for onboarding dialogs with localStorage dismiss handling |
| `src/components/feature/users/username-setup-dialog.tsx` | Multi-step dialog with skip functionality |
| `src/components/feature/users/username-edit-form.tsx` | Form component with validation and server action integration |

### Collection/Subcollection Creation Patterns

| File | Relevance |
|------|-----------|
| `src/components/feature/collections/collection-create-dialog.tsx` | Dialog for creating collections with cover image upload |
| `src/components/feature/subcollections/subcollection-create-dialog.tsx` | Dialog for creating subcollections |

### Action/Facade Patterns

| File | Relevance |
|------|-----------|
| `src/lib/actions/collections/collections.actions.ts` | Server action structure with authActionClient, Sentry |
| `src/lib/actions/users/username.actions.ts` | User-related action patterns |
| `src/lib/facades/users/users.facade.ts` | Facade pattern for user operations |
| `src/lib/facades/collections/collections.facade.ts` | Facade pattern for collection operations |

## Medium Priority - Files to Modify

### Layout/Page Integration

| File | Action |
|------|--------|
| `src/app/(app)/(home)/page.tsx` | Add onboarding provider (similar to UsernameOnboardingProvider on lines 89-91) |
| `src/app/(app)/settings/profile/page.tsx` | Add option to restart onboarding from settings |

### Constants to Extend

| File | Action |
|------|--------|
| `src/lib/constants/action-names.ts` | Add ONBOARDING action names |
| `src/lib/constants/operations.ts` | Add ONBOARDING operations |
| `src/lib/constants/error-codes.ts` | Add ONBOARDING error codes |
| `src/lib/constants/defaults.ts` | Add ONBOARDING defaults |

## Medium Priority - UI Components Reference

| File | Purpose |
|------|---------|
| `src/components/ui/dialog.tsx` | Radix Dialog wrapper |
| `src/components/ui/progress.tsx` | Progress bar for wizard steps |
| `src/components/ui/tooltip.tsx` | Contextual help overlays |
| `src/components/ui/button.tsx` | Button variants |
| `src/components/ui/card.tsx` | Card for step content |
| `src/components/ui/form/index.tsx` | TanStack Form integration |
| `src/components/ui/cloudinary-cover-upload.tsx` | Cover image upload |

## Low Priority - Context Files

### Validation Schemas

| File | Purpose |
|------|---------|
| `src/lib/validations/collections.validation.ts` | Collection validation patterns |
| `src/lib/validations/subcollections.validation.ts` | Subcollection validation patterns |
| `src/lib/validations/bobbleheads.validation.ts` | Bobblehead validation patterns |
| `src/lib/validations/users.validation.ts` | User validation with drizzle-zod |

### Database/Query Context

| File | Purpose |
|------|---------|
| `src/lib/db/schema/collections.schema.ts` | Collection/subcollection schema |
| `src/lib/db/schema/bobbleheads.schema.ts` | Bobblehead schema |
| `src/lib/queries/users/users-query.ts` | User query patterns |

### Hooks/Utilities

| File | Purpose |
|------|---------|
| `src/hooks/use-server-action.ts` | Server action hook with toast |
| `src/hooks/use-toggle.ts` | Toggle state for wizard navigation |
| `src/lib/utils/next-safe-action.ts` | Safe action client config |
| `src/lib/test-ids/index.ts` | TestID generation |

## Architecture Insights

### Key Patterns Discovered

1. **Onboarding Provider Pattern**: Uses server-side flag checking (`shouldShow` prop), localStorage for dismissal persistence, Dialog-based UI with close animations

2. **Dialog Component Pattern**: All feature dialogs use `withFocusManagement` HOC wrapper, `useAppForm` with TanStack Form, `useServerAction` hook for mutations, Radix Dialog primitives

3. **Server Action Pattern**: Uses `authActionClient` for authenticated routes, `ctx.sanitizedInput` parsed through Zod, Sentry breadcrumbs/context, `CacheRevalidationService`

4. **Type-safe Navigation**: Uses `$path` from `next-typesafe-url`

5. **Facade Layer Pattern**: Static methods on class, Cache integration via `CacheService`, Query context creation

### Existing Similar Functionality

The username onboarding flow (`UsernameOnboardingProvider` + `UsernameSetupDialog`) provides excellent template:
- Activated when `usernameChangedAt` is null
- Uses localStorage to prevent repeated showing
- Multi-step dialog with skip option
- Server action to persist state

### Integration Points

1. **Home Page**: Add onboarding check similar to lines 66-74 in `(home)/page.tsx`
2. **User Settings**: Add "Restart Onboarding" option in profile settings
3. **Database**: Add `hasCompletedOnboarding` boolean to `userSettings` table
4. **Constants**: Extend action names, operations, and error codes

## Validation Results

| Check | Result |
|-------|--------|
| Minimum Files (3+) | Pass (32 files discovered) |
| File Path Validation | Pass (all paths verified) |
| Categorization | Pass (Critical/High/Medium/Low) |
| Coverage | Pass (all architectural layers covered) |
