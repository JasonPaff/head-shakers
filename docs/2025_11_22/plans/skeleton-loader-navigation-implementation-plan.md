# Skeleton Loader Navigation Implementation Plan

**Generated**: 2025-11-22
**Feature**: Replace "Loading navigation" text with styled skeleton loader

---

## Analysis Summary

- **Original Request**: Replace the "Loading navigation" text in bobblehead navigation with a styled skeleton loader that matches the navigation button dimensions
- **Key Finding**: The skeleton loader already exists and is properly styled. The change needed is to improve the aria-label for better accessibility semantics.
- **Files Discovered**: 11 (1 to modify, 10 for reference)

---

## Overview

**Estimated Duration**: 15-30 minutes
**Complexity**: Low
**Risk Level**: Low

## Quick Summary

Replace the generic "Loading navigation" aria-label in the bobblehead navigation skeleton component with semantically accurate accessible labeling that matches the real navigation component's aria-label pattern ("Bobblehead navigation"). This ensures consistent accessibility semantics between the skeleton and rendered states.

## Prerequisites

- [ ] Review existing `bobblehead-navigation.tsx` component for accessibility pattern (aria-label="Bobblehead navigation")
- [ ] Confirm skeleton component structure mirrors the actual navigation component

## Implementation Steps

### Step 1: Update Accessibility Labels in Bobblehead Navigation Skeleton

**What**: Change the aria-label from generic "Loading navigation" to semantically accurate "Bobblehead navigation" to match the actual navigation component's labeling convention.

**Why**: The skeleton should announce the same semantic meaning as the real component it represents. Using "Bobblehead navigation" instead of "Loading navigation" provides consistent accessibility semantics, and the `aria-busy="true"` attribute already communicates the loading state to assistive technologies.

**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton.tsx` - Update aria-label attribute value

**Changes:**

- Modify the `aria-label` attribute value from "Loading navigation" to "Bobblehead navigation"
- This aligns with the pattern used in `bobblehead-navigation.tsx` where `aria-label={'Bobblehead navigation'}` is used on the `<nav>` element
- The `aria-busy={'true'}` attribute remains unchanged and correctly indicates the loading state

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] The `aria-label` attribute on the skeleton container div now reads "Bobblehead navigation"
- [ ] The `aria-busy="true"` attribute is preserved
- [ ] The `role="navigation"` attribute is preserved
- [ ] All validation commands pass
- [ ] Screen readers will now announce "Bobblehead navigation" with busy state, consistent with the actual component

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Manual verification: Confirm the skeleton component renders correctly as a Suspense fallback
- [ ] Accessibility verification: aria-label value matches the real navigation component pattern

## Notes

- The existing skeleton structure (two Skeleton elements with `h-8 w-24 sm:w-28` dimensions) correctly represents the navigation button structure and requires no changes
- Other skeleton components in the codebase (e.g., `bobblehead-header-skeleton.tsx`, `collection-header-skeleton.tsx`) do not use explicit aria-labels on containers, instead relying on semantic HTML structure. The navigation skeleton appropriately uses aria-label because it has `role="navigation"`
- The `aria-busy="true"` attribute properly communicates the loading state to assistive technologies, so the aria-label should describe WHAT is loading, not THAT it is loading
- This change maintains semantic consistency between the skeleton loading state and the actual rendered component

---

## File Discovery Results

### Files Requiring Modification (1)

| Priority | File Path                                                                                                         | Change Type       |
| -------- | ----------------------------------------------------------------------------------------------------------------- | ----------------- |
| CRITICAL | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton.tsx` | Update aria-label |

### Reference Files (10)

| Priority | File Path                                                                                                            | Purpose                         |
| -------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| HIGH     | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx`                       | Shows proper aria-label pattern |
| HIGH     | `src/components/ui/skeleton.tsx`                                                                                     | Base Skeleton UI component      |
| HIGH     | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx`           | Integration point               |
| HIGH     | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx`                                                   | Suspense fallback usage         |
| MEDIUM   | `src/lib/types/bobblehead-navigation.types.ts`                                                                       | Type definitions                |
| MEDIUM   | `src/lib/test-ids/index.ts`                                                                                          | Test ID utilities               |
| MEDIUM   | `src/components/feature/comments/skeletons/comment-section-skeleton.tsx`                                             | Pattern example                 |
| MEDIUM   | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-header-skeleton.tsx`        | Sibling skeleton                |
| LOW      | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-photo-gallery-skeleton.tsx` | Pattern reference               |
| LOW      | `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-metrics-skeleton.tsx`       | Pattern reference               |
