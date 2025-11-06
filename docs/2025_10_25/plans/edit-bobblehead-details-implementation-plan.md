# Edit Bobblehead Details - Implementation Plan

**Generated**: 2025-10-25T00:06:15Z
**Original Request**: as a user I would like the ability to edit my bobblehead details
**Orchestration Logs**: `docs/2025_10_25/orchestration/edit-bobblehead-details/`

---

## Analysis Summary

- Feature request refined with comprehensive project context (449 words)
- Discovered 45 files across 4 priority levels (12 CRITICAL, 15 HIGH, 10 MEDIUM, 8 LOW)
- Generated 12-step implementation plan following layered architecture
- Estimated duration: 2-3 days
- Complexity: Medium | Risk: Medium

---

## Refined Feature Request

Implement a bobblehead details editing feature that enables authenticated users to modify the information of their existing bobbleheads through a dedicated edit form accessible from the bobblehead detail page or user's collection management interface, leveraging the existing Next.js 15.5.3 App Router architecture with React 19.1.0 and integrating seamlessly with the current Clerk authentication system to ensure users can only edit bobbleheads they own. The implementation should utilize TanStack React Form for form state management and user interactions, with comprehensive Zod validation schemas defined in the lib/validations directory to ensure data integrity for all editable fields including bobblehead name, description, manufacturer, year of production, condition, acquisition date, acquisition price, estimated value, category, subcategory, rarity, and any custom fields, while maintaining type safety through the existing Drizzle ORM schema definitions. The edit functionality should be implemented through a Next-Safe-Action server action in the lib/actions directory that handles the database update transaction via Drizzle ORM, performing proper authorization checks to verify the authenticated user owns the bobblehead being edited, validating all input data against the Zod schema, and handling any related updates such as updating timestamps or triggering cache invalidation. The UI should present an edit form modal or dedicated edit page styled with Tailwind CSS 4 and Radix UI components matching the existing design system, pre-populated with current bobblehead data, providing real-time validation feedback as users modify fields, supporting image updates through the existing Cloudinary integration for photo management, and displaying appropriate loading states during submission and success/error notifications using the project's established toast or notification patterns.

---

## File Discovery Results

### CRITICAL Files (12 files - Must Modify)

**Backend Layer:**

1. `src/lib/validations/bobbleheads.validation.ts` - Add update schemas
2. `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Add updateAsync method
3. `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Add update business logic
4. `src/lib/actions/bobbleheads/bobbleheads.actions.ts` - Add update server action
5. `src/lib/constants/action-names.ts` - Complete BOBBLEHEADS.UPDATE constant
6. `src/lib/constants/operations.ts` - Complete BOBBLEHEADS.UPDATE constant
7. `src/lib/services/cache-revalidation.service.ts` - Add onUpdate method

**Frontend Layer:** 8. `src/components/feature/bobblehead/bobblehead-edit-dialog.tsx` - **CREATE** edit dialog 9. `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header.tsx` - Wire edit button 10. `src/app/(app)/bobbleheads/[bobbleheadId]/edit/page.tsx` - Edit page (placeholder, optional) 11. `src/app/(app)/bobbleheads/[bobbleheadId]/edit/loading.tsx` - Loading state

### HIGH Priority References (15 files)

**Form Pattern References:**

- `src/app/(app)/bobbleheads/add/components/add-item-form-client.tsx` - Complete form pattern
- `src/app/(app)/bobbleheads/add/components/*.tsx` - Reusable form sections
- `src/components/feature/collections/collection-edit-dialog.tsx` - Edit dialog pattern

**Implementation Patterns:**

- `src/lib/actions/collections/collections.actions.ts` - Update action pattern
- `src/lib/constants/schema-limits.ts` - Validation limits

---

## Implementation Plan

### Overview

**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Medium

### Quick Summary

Implement a comprehensive bobblehead editing feature following the existing collection edit pattern, enabling authenticated users to modify their bobblehead details through a modal dialog. The implementation follows the established layered architecture (Schema → Validation → Query → Facade → Action → UI) with proper authorization, photo management via Cloudinary, and cache invalidation.

### Prerequisites

- [ ] Verify Clerk authentication is properly configured
- [ ] Confirm Cloudinary service is accessible and working
- [ ] Ensure all existing bobblehead creation flows are stable
- [ ] Review collection edit dialog implementation for pattern reference
- [ ] Verify TanStack Form and React Query dependencies are installed

---

## Implementation Steps

### Step 1: Create Zod Validation Schemas for Update Operations

**What**: Define update validation schemas extending existing insert schemas with ID field
**Why**: Validation schemas are the foundation of type-safe updates and must be defined before query/action layers
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/bobbleheads.validation.ts` - Add update schemas

**Changes:**

- Add `updateBobbleheadSchema` extending `insertBobbleheadSchema` with required `id` field
- Add `updateBobbleheadWithPhotosSchema` combining update schema with photos array
- Ensure schema reuses existing field validations for consistency
- Export new schemas for use in actions and facades

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] `updateBobbleheadSchema` properly typed with id as required field
- [ ] `updateBobbleheadWithPhotosSchema` includes photos array validation
- [ ] All validation commands pass
- [ ] Schemas export correctly for downstream consumption

---

### Step 2: Implement Query Layer Update Method

**What**: Add `updateAsync` method to bobbleheads query layer
**Why**: Query layer handles direct database operations and must exist before facade layer
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Add update method

**Changes:**

- Add `updateAsync` method accepting bobblehead ID and update data
- Implement database update using Drizzle ORM with proper where clause
- Return updated bobblehead record with all fields
- Add proper error handling for non-existent bobbleheads
- Include transaction support for data integrity

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] `updateAsync` method properly typed with Drizzle schema types
- [ ] Method returns updated bobblehead or throws appropriate error
- [ ] Transaction handling implemented correctly
- [ ] All validation commands pass

---

### Step 3: Implement Facade Layer Business Logic

**What**: Add `updateAsync` method to bobbleheads facade with authorization checks
**Why**: Facade layer enforces business rules including ownership validation before database operations
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Add update business logic

**Changes:**

- Add `updateAsync` method accepting user ID, bobblehead ID, and update data
- Implement ownership verification by checking bobblehead.userId matches authenticated user
- Call query layer `updateAsync` only after authorization passes
- Handle photo updates through CloudinaryService if photos provided
- Manage photo folder transitions (temp to permanent) following existing patterns
- Return updated bobblehead with success status

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Ownership validation prevents unauthorized updates
- [ ] Photo management integrates with CloudinaryService correctly
- [ ] Method properly orchestrates query layer and external services
- [ ] All validation commands pass

---

### Step 4: Create Server Action for Update Operations

**What**: Implement `updateBobbleheadWithPhotosAction` using Next-Safe-Action
**Why**: Server actions provide the authenticated entry point for client-side update requests
**Confidence**: High

**Files to Modify:**

- `src/lib/actions/bobbleheads/bobbleheads.actions.ts` - Add update action

**Changes:**

- Create `updateBobbleheadWithPhotosAction` using `authActionClient`
- Bind action to `updateBobbleheadWithPhotosSchema` for automatic validation
- Extract authenticated user ID from Clerk context
- Call facade layer `updateAsync` with user ID and validated input
- Trigger cache revalidation via `CacheRevalidationService.bobbleheads.onUpdate`
- Return action result with proper error handling

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Action properly authenticated with authActionClient
- [ ] Schema validation applied automatically
- [ ] Cache invalidation triggered on successful update
- [ ] Error states handled and returned to client
- [ ] All validation commands pass

---

### Step 5: Complete Action Name and Operation Constants

**What**: Define UPDATE operation constants in centralized constant files
**Why**: Constants ensure consistency across action names, cache keys, and operation tracking
**Confidence**: High

**Files to Modify:**

- `src/lib/constants/action-names.ts` - Complete BOBBLEHEADS.UPDATE placeholder
- `src/lib/constants/operations.ts` - Complete BOBBLEHEADS.UPDATE placeholder

**Changes:**

- Define `BOBBLEHEADS.UPDATE` action name constant
- Define `BOBBLEHEADS.UPDATE` operation constant for cache invalidation
- Ensure naming follows existing patterns in both files
- Verify constants are exported for use in actions and services

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] UPDATE constants defined in both files
- [ ] Constants follow existing naming conventions
- [ ] TypeScript types resolve correctly
- [ ] All validation commands pass

---

### Step 6: Extend Cache Revalidation Service

**What**: Add `onUpdate` method to bobbleheads cache revalidation service
**Why**: Proper cache invalidation ensures UI reflects updated data across all views
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Add onUpdate method

**Changes:**

- Add `onUpdate` method to bobbleheads section of CacheRevalidationService
- Invalidate bobblehead detail page cache using bobblehead ID
- Invalidate user's collection list cache
- Invalidate any browse/search caches that may include this bobblehead
- Follow existing revalidation patterns from onCreate method

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] `onUpdate` method properly invalidates all relevant cache paths
- [ ] Method signature matches other revalidation methods
- [ ] TypeScript types resolve correctly
- [ ] All validation commands pass

---

### Step 7: Create Bobblehead Edit Dialog Component

**What**: Build reusable edit dialog component following collection edit dialog pattern
**Why**: Dialog component encapsulates edit form UI and logic for reuse across multiple entry points
**Confidence**: Medium

**Files to Create:**

- `src/components/feature/bobblehead/bobblehead-edit-dialog.tsx` - Edit dialog component

**Changes:**

- Create dialog component accepting bobblehead data and open/close handlers as props
- Implement TanStack Form with `useAppForm` hook for form state management
- Configure form options with `updateBobbleheadWithPhotosAction` server action
- Pre-populate form fields with current bobblehead data
- Integrate CloudinaryService for photo upload functionality
- Reuse existing form section components from add flow where applicable
- Add real-time validation feedback using Zod schema
- Implement loading states during submission
- Display success/error notifications using project toast patterns
- Follow Radix UI Dialog component structure
- Style with Tailwind CSS matching existing design system

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Dialog opens/closes with proper animation
- [ ] Form pre-populates with current bobblehead data
- [ ] Real-time validation displays field errors
- [ ] Photo upload integrates with Cloudinary
- [ ] Loading states display during submission
- [ ] Success/error notifications appear appropriately
- [ ] All validation commands pass

---

### Step 8: Add Edit Button to Bobblehead Header

**What**: Wire edit button in bobblehead header component with ownership conditional rendering
**Why**: Primary entry point for users to access edit functionality from detail page
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header.tsx` - Add edit button

**Changes:**

- Add edit button to header toolbar
- Implement `isOwner` check comparing authenticated user ID with bobblehead.userId
- Conditionally render edit button only when user owns bobblehead
- Add state management for edit dialog open/close
- Import and render BobbleheadEditDialog component
- Pass bobblehead data and dialog handlers to edit dialog
- Style button with Lucide Edit icon matching design system
- Position button appropriately in header layout

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Edit button only visible to bobblehead owner
- [ ] Button click opens edit dialog with pre-populated data
- [ ] Dialog closes properly after cancel or successful submit
- [ ] Button styling matches existing header buttons
- [ ] All validation commands pass

---

### Step 9: Add Success Callback and Optimistic Updates

**What**: Implement post-update UI refresh and optimistic updates for better UX
**Why**: Ensures UI reflects changes immediately and refetches data after successful update
**Confidence**: Medium

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-edit-dialog.tsx` - Add success handling
- `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header.tsx` - Coordinate refetch

**Changes:**

- Add success callback in edit dialog to trigger TanStack Query cache invalidation
- Implement optimistic update to show changes before server confirmation
- Coordinate query refetch in parent component on dialog close
- Ensure loading states reflect ongoing updates
- Handle race conditions between optimistic and server updates

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Optimistic updates display immediately in UI
- [ ] Query refetch triggered on successful submit
- [ ] Cache invalidation refreshes related queries
- [ ] Loading states accurately reflect update progress
- [ ] All validation commands pass

---

### Step 10: Add Error Handling and Edge Cases

**What**: Implement comprehensive error handling for network failures, validation errors, and authorization failures
**Why**: Robust error handling ensures graceful degradation and clear user feedback
**Confidence**: High

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-edit-dialog.tsx` - Add error handling
- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Add error cases
- `src/lib/actions/bobbleheads/bobbleheads.actions.ts` - Add error responses

**Changes:**

- Handle unauthorized edit attempts with clear error messages
- Catch network failures during photo upload
- Display validation errors for each form field
- Handle non-existent bobblehead scenarios
- Add retry logic for transient failures
- Implement proper error logging for debugging
- Show user-friendly error messages in toast notifications

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Unauthorized edits blocked with appropriate message
- [ ] Network failures display retry options
- [ ] Field validation errors shown inline
- [ ] Non-existent bobblehead returns 404-equivalent response
- [ ] All error paths logged for monitoring
- [ ] All validation commands pass

---

### Step 11: Implement Photo Update Flow

**What**: Handle photo additions, deletions, and reordering during bobblehead updates
**Why**: Photo management is critical feature requiring proper temp-to-permanent transitions and cleanup
**Confidence**: Medium

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-edit-dialog.tsx` - Add photo management UI
- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Handle photo transitions

**Changes:**

- Add photo gallery component within edit dialog
- Support photo reordering with drag-and-drop
- Implement photo deletion with Cloudinary cleanup
- Handle new photo uploads to temp folder
- Transition temp photos to permanent on successful update
- Delete orphaned temp photos on cancel
- Maintain existing photos unless explicitly removed
- Update photo metadata in database

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Users can add new photos during edit
- [ ] Users can delete existing photos
- [ ] Users can reorder photos
- [ ] Temp photos transition correctly on save
- [ ] Orphaned photos cleaned up on cancel
- [ ] All validation commands pass

---

### Step 12: Add Secondary Edit Entry Points

**What**: Add edit buttons in user's collection management views
**Why**: Provides multiple convenient access points for editing bobbleheads
**Confidence**: Low

**Files to Modify:**

- Collection list view components - Add edit action
- Bobblehead card components - Add edit button

**Changes:**

- Identify collection management view components
- Add edit button to bobblehead cards in user's collections
- Wire buttons to open edit dialog with appropriate bobblehead data
- Ensure edit dialog component is accessible from multiple contexts
- Maintain consistent authorization checks across all entry points

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Edit accessible from collection management views
- [ ] Dialog behavior consistent across entry points
- [ ] Authorization checks applied uniformly
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Update validation schemas properly extend insert schemas
- [ ] Authorization prevents unauthorized edits at facade layer
- [ ] Photo management properly transitions temp to permanent folders
- [ ] Cache invalidation refreshes all affected views
- [ ] Edit dialog matches collection edit dialog patterns
- [ ] Success/error notifications display appropriately
- [ ] Optimistic updates provide responsive UX
- [ ] All error cases handled gracefully

---

## Notes

### Critical Assumptions Requiring Confirmation

- Photo update flow assumptions match actual Cloudinary service implementation
- Collection list view file paths need verification during implementation
- Toast notification service usage matches existing patterns

### High-Risk Areas

- **Photo Management**: Requires careful testing of temp-to-permanent transitions and cleanup
- **Cache Invalidation**: Must cover all views displaying bobblehead data
- **Authorization**: Checks must be consistently applied across all layers

### Performance Considerations

- Large photo uploads may require progress indicators
- Optimistic updates should handle slow network gracefully
- Query refetch strategy should minimize unnecessary network calls

### Testing Strategy

**Manual Testing:**

- Edit owned vs non-owned bobbleheads
- Photo flow: Add, delete, reorder photos during edit
- Error scenarios: Network failures, validation errors, unauthorized attempts
- Cache: Verify updates appear across detail page, collections, search results

---

## Architecture Reference

### Layered Architecture Pattern

```
Database Schema (Drizzle)
    ↓
Validation Layer (Zod/Drizzle-Zod)
    ↓
Query Layer (BobbleheadsQuery)
    ↓
Facade Layer (BobbleheadsFacade)
    ↓
Server Actions (Next-Safe-Action)
    ↓
UI Components (React/TanStack Form)
```

### Update Pattern (from Collections)

1. **Validation**: Extend insert schema with ID field
2. **Query**: `updateAsync(data, userId)` with ownership check
3. **Facade**: Wrap query with error handling and photo management
4. **Action**: `authActionClient` with transaction support and cache invalidation
5. **UI**: Pre-populate form, submit with `useServerAction`, handle success/error

---

## Related Documentation

- **Orchestration Logs**: `docs/2025_10_25/orchestration/edit-bobblehead-details/`
  - `00-orchestration-index.md` - Workflow overview
  - `01-feature-refinement.md` - Feature context and refinement
  - `02-file-discovery.md` - Comprehensive file analysis
  - `03-implementation-planning.md` - Planning process details

- **Existing Plans**: `docs/2025_09_19/plans/bobblehead-edit-button-implementation-plan.md`
