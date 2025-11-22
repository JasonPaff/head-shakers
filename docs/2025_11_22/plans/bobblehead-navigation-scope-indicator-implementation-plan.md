# Implementation Plan: Collection Context Indicator for Bobblehead Navigation

**Generated**: 2025-11-22
**Original Request**: Add visual indication or label to bobblehead navigation showing which collection/subcollection the navigation is scoped to (e.g., "Navigating: Sports Legends Collection")

**Refined Request**: When users navigate between bobbleheads using the sequential navigation controls, they currently have no visual indication of which collection or subcollection context is scoping their navigation. This feature request adds a clear, contextual label to the bobblehead navigation interface that displays the active collection or subcollection name, helping users understand the boundaries of their navigation. The implementation should add a visual indicator component that renders alongside or near the existing previous/next navigation controls, displaying text such as "Navigating: Sports Legends Collection" or "Navigating: Vintage Baseball Subcollection" depending on whether the user is browsing within a top-level collection or a nested subcollection.

---

## Overview

**Estimated Duration**: 4-6 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

This implementation adds a visual collection context indicator to the bobblehead sequential navigation interface. The indicator will display the currently scoped collection or subcollection name (e.g., "Navigating: Sports Legends Collection" or "Navigating: Vintage Baseball Subcollection") between the previous/next navigation controls, helping users understand the boundaries of their navigation. The approach extends existing types and schemas to include context data, modifies the async server component to fetch collection/subcollection names, and updates the client component to render the contextual label with optional truncation and tooltip support for long names.

## Prerequisites

- [ ] Familiarity with the existing bobblehead navigation implementation
- [ ] Understanding of the BobbleheadsFacade and CollectionsFacade patterns
- [ ] Access to the existing Badge and Tooltip UI components

---

## Implementation Steps

### Step 1: Extend Type Definitions for Navigation Context

**What**: Add collection context information to the BobbleheadNavigationData type definition
**Why**: The navigation component needs to know the collection/subcollection name to display the context indicator
**Confidence**: High

**Files to Modify:**

- `src/lib/types/bobblehead-navigation.types.ts` - Add context fields

**Changes:**

- Add a new `NavigationContext` type containing `contextType` (collection or subcollection), `contextName`, and `contextId`
- Extend `BobbleheadNavigationData` to include an optional `context` field of type `NavigationContext | null`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New type `NavigationContext` is defined with contextType, contextName, and contextId fields
- [ ] `BobbleheadNavigationData` type includes optional context field
- [ ] All validation commands pass

---

### Step 2: Update Zod Validation Schema for Navigation Context

**What**: Add corresponding Zod schema for the navigation context data
**Why**: Maintains type safety and runtime validation consistency with the new type definitions
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/bobblehead-navigation.validation.ts` - Add context schema

**Changes:**

- Add `navigationContextSchema` with contextType (enum: 'collection' | 'subcollection'), contextName (string), and contextId (UUID)
- Update `bobbleheadNavigationDataSchema` to include optional `context` field using the new schema
- Export the new type inference for NavigationContextSchema

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] `navigationContextSchema` Zod schema is defined
- [ ] `bobbleheadNavigationDataSchema` includes nullable context field
- [ ] Type export `NavigationContextSchema` is available
- [ ] All validation commands pass

---

### Step 3: Update Facade to Fetch and Return Collection Context

**What**: Modify the BobbleheadsFacade.getBobbleheadNavigationData method to include collection/subcollection name in the response
**Why**: The server component needs the collection context data from the facade to pass to the client component
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Extend navigation data method

**Changes:**

- Import `CollectionsFacade` and `SubcollectionsFacade`
- Within `getBobbleheadNavigationData`, after fetching adjacent bobbleheads:
  - If `subcollectionId` is provided, call `SubcollectionsFacade.getSubCollectionForPublicView` to get subcollection name
  - If only `collectionId` is provided, call `CollectionsFacade.getCollectionById` to get collection name
- Include the context data (contextType, contextName, contextId) in the returned navigation data
- Update Sentry breadcrumb to include context information

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Navigation data includes context when collection or subcollection ID is provided
- [ ] Context type correctly identifies 'collection' vs 'subcollection'
- [ ] Context name is populated from the appropriate facade method
- [ ] All validation commands pass

---

### Step 4: Update Async Server Component to Pass Context Data

**What**: Modify the BobbleheadNavigationAsync server component to pass the navigation context to the client component
**Why**: The server component fetches data and must forward the new context information to the rendering client component
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx` - Pass context prop

**Changes:**

- The `navigationData` already contains the context from the facade (added in Step 3)
- No additional changes needed - the data flows through automatically since `navigationData` is passed directly to `BobbleheadNavigation`
- Verify the existing prop passing works with the extended type

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Server component correctly receives extended navigation data with context
- [ ] Context data is available for client component consumption
- [ ] All validation commands pass

---

### Step 5: Create Collection Context Indicator Component

**What**: Create a new reusable component for displaying the collection context label
**Why**: Separating the indicator into its own component promotes reusability, testability, and clean separation of concerns
**Confidence**: High

**Files to Create:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/collection-context-indicator.tsx` - New context indicator component

**Changes:**

- Create a client component that accepts `contextType`, `contextName`, and optional `maxLength` prop
- Display label with format "Navigating: [Collection/Subcollection Name]"
- Use Badge component from ui/badge.tsx with 'secondary' variant for visual styling
- Implement text truncation for long names with ellipsis
- Wrap in Tooltip component to show full name on hover when truncated
- Include proper test IDs using generateTestId pattern
- Add aria-label for accessibility

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component renders label with "Navigating:" prefix
- [ ] Long names are truncated with ellipsis
- [ ] Tooltip shows full name on hover when truncated
- [ ] Component uses Badge with secondary variant styling
- [ ] Proper test IDs and accessibility attributes are included
- [ ] All validation commands pass

---

### Step 6: Update Client Navigation Component to Include Context Indicator

**What**: Integrate the CollectionContextIndicator component into the BobbleheadNavigation component
**Why**: This renders the visual context indicator alongside the existing navigation controls
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx` - Add context indicator

**Changes:**

- Import the new CollectionContextIndicator component
- Extract context data from navigationData prop
- Render the CollectionContextIndicator between the Previous and Next navigation links (centered)
- Wrap indicator in Conditional component to only show when context exists
- Update the nav container's flex layout to accommodate the centered indicator (justify-between with flex-1 on sides)
- Add responsive behavior: hide full label on mobile, show abbreviated version or just icon

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Context indicator renders between previous/next buttons
- [ ] Indicator only appears when context data exists
- [ ] Layout remains balanced with indicator in center
- [ ] Responsive behavior hides or abbreviates on small screens
- [ ] All validation commands pass

---

### Step 7: Update Navigation Skeleton for Context Indicator

**What**: Update the skeleton loader to include a placeholder for the context indicator
**Why**: Maintains visual consistency during loading states and prevents layout shifts
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton.tsx` - Add context skeleton

**Changes:**

- Add a centered Skeleton component between the previous and next button skeletons
- Match the approximate width and height of the context indicator
- Apply appropriate responsive classes (hidden on mobile if indicator is hidden)
- Add test ID for the context skeleton

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Skeleton includes placeholder for context indicator
- [ ] Skeleton dimensions approximate the actual indicator size
- [ ] Responsive behavior matches the actual indicator
- [ ] Test ID is included for the skeleton element
- [ ] All validation commands pass

---

### Step 8: Manual Integration Testing

**What**: Verify the feature works correctly in the running application
**Why**: Ensures the implementation functions as expected across different scenarios
**Confidence**: High

**Files to Modify:**

- None (testing only)

**Changes:**

- Test navigation within a top-level collection (should show "Navigating: [Collection Name]")
- Test navigation within a subcollection (should show "Navigating: [Subcollection Name]")
- Test navigation without collection context (indicator should not appear)
- Test with long collection/subcollection names (should truncate and show tooltip)
- Test responsive behavior on different screen sizes
- Verify keyboard navigation still works correctly

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run dev
```

**Success Criteria:**

- [ ] Collection context indicator appears when navigating within collection
- [ ] Subcollection context indicator appears when navigating within subcollection
- [ ] No indicator appears when not in collection context
- [ ] Long names truncate properly with working tooltip
- [ ] Layout is responsive and adapts to screen sizes
- [ ] Keyboard arrow navigation remains functional
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Type definitions and Zod schemas are synchronized
- [ ] Component renders correctly in development environment
- [ ] Accessibility attributes (aria-label, role) are properly set
- [ ] Test IDs follow project conventions
- [ ] No layout shifts during loading states

## Notes

**Architectural Decision - Context Fetching Location (Confidence: High)**:
The context data is fetched in the facade layer alongside the navigation data. This approach:

- Leverages existing caching infrastructure
- Keeps the async server component thin
- Reduces unnecessary database roundtrips by batching queries

**Architectural Decision - Truncation Length (Confidence: Medium)**:
Default max length for collection names before truncation is set to 25 characters. This balances readability with layout constraints. May need adjustment based on user feedback.

**Edge Cases to Consider**:

- Collections/subcollections with very short names (1-2 characters)
- Special characters in collection names
- RTL language support for collection names
- Concurrent navigation when collection context changes

**Potential Future Enhancements**:

- Add click-to-navigate functionality on the context indicator to return to collection view
- Consider adding a breadcrumb-style path for deeply nested subcollections
- Add animation for context indicator appearance/transition

---

## File Discovery Results

### Critical Priority Files

| File                                                                                                       | Relevance                                         |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx`             | Primary client component with navigation controls |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx` | Server component wrapper fetching data            |
| `src/lib/types/bobblehead-navigation.types.ts`                                                             | Type definitions to extend                        |
| `src/lib/validations/bobblehead-navigation.validation.ts`                                                  | Zod schemas to update                             |

### High Priority Files

| File                                                                                                              | Relevance                 |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton.tsx` | Skeleton loader to update |
| `src/lib/facades/bobbleheads/bobbleheads.facade.ts`                                                               | Business logic to extend  |

### Medium Priority Files

| File                                                  | Relevance                   |
| ----------------------------------------------------- | --------------------------- |
| `src/lib/queries/collections/collections.query.ts`    | Collection queries          |
| `src/lib/queries/collections/subcollections.query.ts` | Subcollection queries       |
| `src/components/ui/tooltip.tsx`                       | For truncated name tooltips |
| `src/components/ui/badge.tsx`                         | For styling the label       |
