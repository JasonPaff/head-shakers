# Onboarding Experience Implementation Plan

**Generated**: 2025-01-22
**Original Request**: an onboarding experience for new users to learn how to create collections/subcollections/bobbleheads

## Refined Request

Implement a guided onboarding experience for new users that introduces them to the core workflows of creating collections, subcollections, and bobbleheads on the Head Shakers platform. The onboarding should activate automatically after a user's first successful Clerk authentication, detected by checking a `hasCompletedOnboarding` flag stored in the user profile database table via Drizzle ORM. The experience should consist of an interactive multi-step wizard built using Radix UI Dialog components for modal overlays, with progress indicators and navigation controls styled with Tailwind CSS 4. The wizard should walk users through three primary workflows: first, creating their initial collection with a name, description, and optional cover image uploaded via Cloudinary integration; second, understanding how subcollections can organize bobbleheads within a parent collection for better categorization; and third, adding their first bobblehead entry with key fields like name, photos, acquisition details, and specifications using TanStack React Form for validation and form state management.

## Analysis Summary

- Feature request refined with project context
- Discovered 32 files across 15+ directories
- Generated 17-step implementation plan

## File Discovery Results

### Critical - Must Create

| File                                                                   | Action                              |
| ---------------------------------------------------------------------- | ----------------------------------- |
| `src/lib/db/schema/users.schema.ts`                                    | MODIFY - add hasCompletedOnboarding |
| `src/components/feature/onboarding/`                                   | CREATE directory                    |
| `src/components/feature/onboarding/onboarding-wizard.tsx`              | CREATE                              |
| `src/components/feature/onboarding/onboarding-provider.tsx`            | CREATE                              |
| `src/components/feature/onboarding/onboarding-progress.tsx`            | CREATE                              |
| `src/components/feature/onboarding/steps/create-collection-step.tsx`   | CREATE                              |
| `src/components/feature/onboarding/steps/subcollection-intro-step.tsx` | CREATE                              |
| `src/components/feature/onboarding/steps/add-bobblehead-step.tsx`      | CREATE                              |
| `src/lib/actions/onboarding/onboarding.actions.ts`                     | CREATE                              |
| `src/lib/facades/onboarding/onboarding.facade.ts`                      | CREATE                              |
| `src/lib/validations/onboarding.validation.ts`                         | CREATE                              |

### High Priority - Pattern Reference

| File                                                              | Relevance         |
| ----------------------------------------------------------------- | ----------------- |
| `src/components/feature/users/username-onboarding-provider.tsx`   | Provider pattern  |
| `src/components/feature/users/username-setup-dialog.tsx`          | Multi-step dialog |
| `src/components/feature/collections/collection-create-dialog.tsx` | Form patterns     |

### Medium Priority - Modify

| File                                      | Action                 |
| ----------------------------------------- | ---------------------- |
| `src/app/(app)/(home)/page.tsx`           | Add OnboardingProvider |
| `src/app/(app)/settings/profile/page.tsx` | Add restart option     |
| `src/lib/constants/action-names.ts`       | Add ONBOARDING         |
| `src/lib/constants/operations.ts`         | Add ONBOARDING         |
| `src/lib/constants/error-codes.ts`        | Add ONBOARDING         |
| `src/lib/facades/users/users.facade.ts`   | Add onboarding methods |

---

## Overview

**Estimated Duration**: 4-5 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

- Implement a multi-step interactive wizard that activates automatically for new users after first Clerk authentication
- Store onboarding completion status via `hasCompletedOnboarding` flag in the `userSettings` database table
- Guide users through three core workflows: creating a collection, understanding subcollections, and adding their first bobblehead
- Provide restart onboarding option in user profile settings

## Prerequisites

- [ ] Ensure database migrations are up to date with `npm run db:generate && npm run db:migrate`
- [ ] Verify Clerk authentication is properly configured
- [ ] Ensure Cloudinary integration is working for image uploads
- [ ] Review existing username onboarding pattern in `src/components/feature/users/username-onboarding-provider.tsx`

## Implementation Steps

### Step 1: Add Onboarding Constants

**What**: Add onboarding-related constants to action-names, operations, error-codes, and error-messages files
**Why**: Maintain consistency with existing patterns and enable type-safe action handling
**Confidence**: High

**Files to Modify:**

- `src/lib/constants/action-names.ts` - Add ONBOARDING action names
- `src/lib/constants/operations.ts` - Add ONBOARDING operations
- `src/lib/constants/error-codes.ts` - Add ONBOARDING error codes
- `src/lib/constants/error-messages.ts` - Add ONBOARDING error messages
- `src/lib/constants/defaults.ts` - Add ONBOARDING defaults

**Changes:**

- Add `ONBOARDING` section to ACTION_NAMES with: COMPLETE_ONBOARDING, RESET_ONBOARDING, GET_ONBOARDING_STATUS
- Add `ONBOARDING` section to OPERATIONS with: complete_onboarding, reset_onboarding, get_onboarding_status
- Add `ONBOARDING` section to ERROR_CODES with: COMPLETE_FAILED, RESET_FAILED, STATUS_CHECK_FAILED
- Add `ONBOARDING` section to ERROR_MESSAGES with user-friendly error messages
- Add `ONBOARDING` section to DEFAULTS with: HAS_COMPLETED_ONBOARDING: false

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All constant files updated with ONBOARDING sections
- [ ] Type exports updated to include new constants
- [ ] All validation commands pass

---

### Step 2: Modify Database Schema for Onboarding Flag

**What**: Add `hasCompletedOnboarding` boolean field to the `userSettings` table in the database schema
**Why**: Persist onboarding completion state per user in the database for reliable detection across sessions
**Confidence**: High

**Files to Modify:**

- `src/lib/db/schema/users.schema.ts` - Add hasCompletedOnboarding column to userSettings table

**Changes:**

- Add `hasCompletedOnboarding` boolean field to `userSettings` table with default value of `false`
- Place field after existing boolean fields following alphabetical ordering convention

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] hasCompletedOnboarding column added to userSettings table schema
- [ ] Default value set to false using DEFAULTS constant
- [ ] All validation commands pass

---

### Step 3: Generate and Run Database Migration

**What**: Generate and execute database migration for the new hasCompletedOnboarding field
**Why**: Apply schema changes to the actual database
**Confidence**: High

**Files to Create:**

- New migration file will be auto-generated in `src/lib/db/migrations/`

**Changes:**

- Run migration generation to create SQL migration file
- Execute migration against development database
- Verify migration applied successfully

**Validation Commands:**

```bash
npm run db:generate && npm run db:migrate
```

**Success Criteria:**

- [ ] Migration file generated successfully
- [ ] Migration applied to development database
- [ ] Column exists in userSettings table with correct default value

---

### Step 4: Create Onboarding Validation Schema

**What**: Create Zod validation schemas for onboarding-related operations
**Why**: Enable type-safe input validation for onboarding server actions following project patterns
**Confidence**: High

**Files to Create:**

- `src/lib/validations/onboarding.validation.ts`

**Changes:**

- Create schema for completing onboarding with step tracking
- Create schema for resetting onboarding status
- Export all necessary types using drizzle-zod patterns from collections.validation.ts

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Validation schemas created following existing patterns
- [ ] Type exports properly defined
- [ ] All validation commands pass

---

### Step 5: Create Onboarding Facade

**What**: Create OnboardingFacade class to handle onboarding business logic
**Why**: Centralize onboarding operations following the facade pattern used throughout the project
**Confidence**: High

**Files to Create:**

- `src/lib/facades/onboarding/onboarding.facade.ts`

**Changes:**

- Create static methods: getOnboardingStatusAsync, completeOnboardingAsync, resetOnboardingAsync
- Implement database queries to check and update hasCompletedOnboarding field
- Add Sentry breadcrumbs and error handling following CollectionsFacade patterns
- Use CacheService for caching onboarding status

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] OnboardingFacade class created with all required methods
- [ ] Error handling matches existing facade patterns
- [ ] Sentry integration added for observability
- [ ] All validation commands pass

---

### Step 6: Create Onboarding Server Actions

**What**: Create server actions for onboarding operations using next-safe-action
**Why**: Enable secure, validated server-side operations for onboarding state management
**Confidence**: High

**Files to Create:**

- `src/lib/actions/onboarding/onboarding.actions.ts`

**Changes:**

- Create completeOnboardingAction using authActionClient
- Create resetOnboardingAction using authActionClient
- Create getOnboardingStatusAction using authActionClient
- Follow patterns from collections.actions.ts for structure and error handling
- Use ctx.sanitizedInput parsed through Zod schema per project rules

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All three server actions created
- [ ] Actions use authActionClient for authentication
- [ ] Error handling follows existing patterns
- [ ] All validation commands pass

---

### Step 7: Create Onboarding Progress Component

**What**: Create progress indicator component showing current step in the onboarding wizard
**Why**: Provide visual feedback to users about their progress through the onboarding flow
**Confidence**: High

**Files to Create:**

- `src/components/feature/onboarding/onboarding-progress.tsx`

**Changes:**

- Create client component with step indicators (3 steps total)
- Style using Tailwind CSS 4 with proper responsive design
- Accept current step and total steps as props
- Add step labels: "Create Collection", "Subcollections", "Add Bobblehead"

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Progress component displays current step visually
- [ ] Component is accessible with proper ARIA attributes
- [ ] Styling matches existing UI patterns
- [ ] All validation commands pass

---

### Step 8: Create Collection Step Component

**What**: Create the first onboarding step component for creating an initial collection
**Why**: Guide users through creating their first collection with name, description, and optional cover image
**Confidence**: High

**Files to Create:**

- `src/components/feature/onboarding/steps/create-collection-step.tsx`

**Changes:**

- Create client component with TanStack React Form integration
- Include name field (required), description field (optional), cover image upload via Cloudinary
- Add isPublic toggle switch
- Use useAppForm hook following collection-create-dialog.tsx patterns
- Add onComplete callback prop for advancing to next step

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Form includes all required fields for collection creation
- [ ] Cloudinary upload integration working
- [ ] Form validation matches insertCollectionSchema
- [ ] All validation commands pass

---

### Step 9: Create Subcollection Intro Step Component

**What**: Create the second onboarding step explaining subcollections conceptually
**Why**: Educate users about subcollection organization without requiring them to create one
**Confidence**: High

**Files to Create:**

- `src/components/feature/onboarding/steps/subcollection-intro-step.tsx`

**Changes:**

- Create informational component explaining subcollection benefits
- Include visual diagram or illustration of collection hierarchy
- Add "Skip" and "Continue" buttons
- Include optional link to create subcollection or continue to next step
- Make this step educational rather than action-required

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Clear explanation of subcollection purpose and benefits
- [ ] User can proceed without creating a subcollection
- [ ] Styling consistent with other wizard steps
- [ ] All validation commands pass

---

### Step 10: Create Add Bobblehead Step Component

**What**: Create the third onboarding step for adding the first bobblehead entry
**Why**: Guide users through adding their first bobblehead with essential fields
**Confidence**: Medium

**Files to Create:**

- `src/components/feature/onboarding/steps/add-bobblehead-step.tsx`

**Changes:**

- Create client component with TanStack React Form integration
- Include essential fields: name, photos (Cloudinary), acquisition details, specifications
- Pre-select the collection created in step 1
- Use useAppForm hook following existing bobblehead form patterns
- Add skip option for users who want to add bobbleheads later

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Form includes essential bobblehead fields
- [ ] Collection from step 1 is pre-selected
- [ ] Photo upload via Cloudinary works correctly
- [ ] Skip option available for users
- [ ] All validation commands pass

---

### Step 11: Create Onboarding Wizard Component

**What**: Create the main wizard container component that orchestrates all steps
**Why**: Manage wizard state, navigation, and step transitions within a Radix UI Dialog
**Confidence**: High

**Files to Create:**

- `src/components/feature/onboarding/onboarding-wizard.tsx`

**Changes:**

- Create client component using Radix UI Dialog for modal overlay
- Manage current step state and step data persistence
- Implement navigation controls (Next, Back, Skip)
- Include OnboardingProgress component
- Handle wizard completion by calling completeOnboardingAction
- Add proper close handling that marks onboarding complete
- Style with Tailwind CSS 4

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Wizard displays correct step content based on state
- [ ] Navigation between steps works correctly
- [ ] Completion triggers server action to update database
- [ ] Dialog follows Radix UI accessibility patterns
- [ ] All validation commands pass

---

### Step 12: Create Onboarding Provider Component

**What**: Create provider component that controls when to show the onboarding wizard
**Why**: Encapsulate onboarding detection logic and conditionally render the wizard
**Confidence**: High

**Files to Create:**

- `src/components/feature/onboarding/onboarding-provider.tsx`

**Changes:**

- Create client component following username-onboarding-provider.tsx pattern
- Accept hasCompletedOnboarding prop from server
- Manage local state for wizard visibility
- Handle localStorage for dismissal tracking
- Render OnboardingWizard when conditions are met

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Provider correctly determines when to show wizard
- [ ] LocalStorage integration for session persistence
- [ ] Follows existing username onboarding provider pattern
- [ ] All validation commands pass

---

### Step 13: Integrate Onboarding Provider into Home Page

**What**: Add OnboardingProvider to the main home page after username onboarding
**Why**: Trigger onboarding wizard automatically for authenticated users who haven't completed it
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/(home)/page.tsx` - Add onboarding provider

**Changes:**

- Import OnboardingProvider component
- Fetch hasCompletedOnboarding status from userSettings via UsersFacade
- Add OnboardingProvider below UsernameOnboardingProvider (onboarding should occur after username setup)
- Pass necessary props (hasCompletedOnboarding status)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] OnboardingProvider renders on home page for authenticated users
- [ ] Onboarding shows after username onboarding completes
- [ ] Page loads correctly without errors
- [ ] All validation commands pass

---

### Step 14: Add Restart Onboarding Option to Profile Settings

**What**: Add UI element in profile settings to allow users to restart the onboarding experience
**Why**: Give users the ability to re-experience onboarding for reference or if they skipped steps
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/settings/profile/page.tsx` - Add restart onboarding card

**Changes:**

- Add new Card component section for "Onboarding"
- Include button to trigger resetOnboardingAction
- Add confirmation dialog before resetting
- Show current onboarding status (completed/not completed)
- Use useServerAction hook for reset action

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Restart onboarding card visible in profile settings
- [ ] Reset button triggers server action correctly
- [ ] Confirmation dialog prevents accidental resets
- [ ] Status display shows current onboarding state
- [ ] All validation commands pass

---

### Step 15: Update UsersFacade for Onboarding Status

**What**: Add methods to UsersFacade for retrieving onboarding status with user data
**Why**: Centralize user data queries to include onboarding status where needed
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/users/users.facade.ts` - Add onboarding-related methods

**Changes:**

- Add getUserWithOnboardingStatus method to fetch user with settings including hasCompletedOnboarding
- Add getOnboardingStatus helper method for quick status check
- Update existing getUserById to optionally include settings

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New methods properly query userSettings table
- [ ] Caching integrated for performance
- [ ] Follows existing UsersFacade patterns
- [ ] All validation commands pass

---

### Step 16: Create Onboarding Component Index

**What**: Ensure proper file organization for all onboarding components (no barrel files)
**Why**: Maintain project convention of direct imports without index.ts re-exports
**Confidence**: High

**Files to Verify:**

- Directory structure: `src/components/feature/onboarding/`
- Directory structure: `src/components/feature/onboarding/steps/`

**Changes:**

- Verify all component files are in correct locations
- Ensure imports use direct file paths (not barrel imports)
- Add appropriate JSDoc comments to main components

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All files in correct directory structure
- [ ] No index.ts barrel files created
- [ ] Direct imports used throughout
- [ ] All validation commands pass

---

### Step 17: Final Integration Testing and Validation

**What**: Perform comprehensive validation of the complete onboarding flow
**Why**: Ensure all components work together correctly before considering implementation complete
**Confidence**: High

**Files to Verify:**

- All created onboarding files
- Modified home page
- Modified profile settings page
- Database migration applied

**Changes:**

- Run full build to verify no compilation errors
- Run type check across entire codebase
- Run lint fix to ensure code style compliance
- Verify development server starts correctly

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run build
```

**Success Criteria:**

- [ ] Full build completes without errors
- [ ] All TypeScript types resolve correctly
- [ ] Lint passes with no warnings
- [ ] Development server runs and onboarding flow works end-to-end

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Database migration applied successfully via `npm run db:migrate`
- [ ] Build completes successfully via `npm run build`
- [ ] Manual verification: New user sees onboarding wizard after first login
- [ ] Manual verification: Completing onboarding updates database flag
- [ ] Manual verification: Returning users do not see onboarding
- [ ] Manual verification: Restart onboarding option works in profile settings

## Notes

- The onboarding should only appear AFTER username onboarding completes (Step 13 ordering is important)
- LocalStorage is used for session-level dismissal, but database flag is source of truth for completion
- The subcollection intro step (Step 9) is educational only - users are not required to create a subcollection
- The add bobblehead step (Step 10) should allow skipping for users who want to explore first
- Consider adding analytics/Sentry breadcrumbs for tracking onboarding completion rates
- All Radix UI Dialog components must follow accessibility patterns for keyboard navigation and screen readers
- Cloudinary upload components should use the existing CloudinaryCoverUpload and CloudinaryService patterns
- TanStack React Form should use the project's useAppForm hook and field components from `src/components/ui/form/`
