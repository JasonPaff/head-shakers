# Onboarding Experience - Orchestration Index

**Feature**: New user onboarding experience for learning collections/subcollections/bobbleheads
**Created**: 2025-01-22
**Status**: Complete

## Workflow Overview

This orchestration creates a detailed implementation plan through a 3-step process:

1. **Feature Request Refinement** - Enhance the user request with project context
2. **File Discovery** - Find all relevant files for the implementation
3. **Implementation Planning** - Generate detailed Markdown implementation plan

## Step Logs

| Step | File                                                             | Status   | Duration |
| ---- | ---------------------------------------------------------------- | -------- | -------- |
| 1    | [01-feature-refinement.md](./01-feature-refinement.md)           | Complete | ~30s     |
| 2    | [02-file-discovery.md](./02-file-discovery.md)                   | Complete | ~60s     |
| 3    | [03-implementation-planning.md](./03-implementation-planning.md) | Complete | ~60s     |

## Original Request

> an onboarding experience for new users to learn how to create collections/subcollections/bobbleheads

## Refined Request

Implement a guided onboarding experience for new users that introduces them to the core workflows of creating collections, subcollections, and bobbleheads on the Head Shakers platform. The onboarding should activate automatically after a user's first successful Clerk authentication, detected by checking a `hasCompletedOnboarding` flag stored in the user profile database table via Drizzle ORM. The experience should consist of an interactive multi-step wizard built using Radix UI Dialog components for modal overlays, with progress indicators and navigation controls styled with Tailwind CSS 4.

## Output Files

- **Implementation Plan**: [../plans/onboarding-experience-implementation-plan.md](../plans/onboarding-experience-implementation-plan.md)

## Execution Summary

| Metric               | Value        |
| -------------------- | ------------ |
| Total Duration       | ~2.5 minutes |
| Files Discovered     | 32           |
| Implementation Steps | 17           |
| Estimated Duration   | 4-5 days     |
| Complexity           | High         |
| Risk Level           | Medium       |

## Key Deliverables

### Files to Create (11)

- `src/lib/db/schema/users.schema.ts` (MODIFY)
- `src/components/feature/onboarding/onboarding-wizard.tsx`
- `src/components/feature/onboarding/onboarding-provider.tsx`
- `src/components/feature/onboarding/onboarding-progress.tsx`
- `src/components/feature/onboarding/steps/create-collection-step.tsx`
- `src/components/feature/onboarding/steps/subcollection-intro-step.tsx`
- `src/components/feature/onboarding/steps/add-bobblehead-step.tsx`
- `src/lib/actions/onboarding/onboarding.actions.ts`
- `src/lib/facades/onboarding/onboarding.facade.ts`
- `src/lib/validations/onboarding.validation.ts`

### Files to Modify (6)

- `src/app/(app)/(home)/page.tsx`
- `src/app/(app)/settings/profile/page.tsx`
- `src/lib/constants/action-names.ts`
- `src/lib/constants/operations.ts`
- `src/lib/constants/error-codes.ts`
- `src/lib/facades/users/users.facade.ts`
