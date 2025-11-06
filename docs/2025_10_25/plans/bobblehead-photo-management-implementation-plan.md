# Bobblehead Photo Management - Implementation Plan

**Generated**: 2025-10-25T10:34:15Z

**Original Request**: as a user I would like to be able to delete/re-order/etc the photos on the bobblehead when I edit the bobblehead

**Refined Request**: As a user editing a bobblehead, I need the ability to manage the photo gallery by deleting unwanted images and reordering them to control which photo appears as the primary image and the sequence in which photos are displayed in the gallery. This feature should be implemented within the existing bobblehead edit form, which currently uses TanStack React Form for form state management and Next.js server actions for data mutations. The photo management interface should integrate with the existing Cloudinary-based image storage system, allowing users to remove photos both from the database (removing references from the bobblehead_photos table via Drizzle ORM) and optionally from Cloudinary storage to prevent orphaned assets. For reordering functionality, the UI should leverage the @dnd-kit/core and @dnd-kit/sortable libraries already present in the project to provide an intuitive drag-and-drop experience where users can click and drag photo thumbnails into their desired order, with the first position representing the primary/featured image. The reordering should update the display_order or position field in the bobblehead_photos table to persist the user's preferred sequence. When a user deletes a photo, the system should show a confirmation dialog using Radix UI components to prevent accidental deletions, and upon confirmation, trigger a server action in src/lib/actions/bobblehead/ that validates the deletion request using a Zod schema from src/lib/validations/, removes the database record via a Drizzle transaction, and optionally calls the Cloudinary API to delete the asset. The reordering operation should also use a server action that accepts an array of photo IDs in their new order and updates the display_order values atomically within a database transaction to maintain data consistency. Both operations should include optimistic UI updates to provide immediate visual feedback while the server processes the request, with proper error handling and rollback mechanisms if the server action fails. The photo management controls should be clearly visible in the edit form, with delete buttons on individual photo thumbnails and visual affordances (such as grab handles or cursor changes) indicating that photos are draggable, ensuring the interface remains accessible and user-friendly while maintaining consistency with the existing design system using Tailwind CSS and Radix UI components.

---

## Analysis Summary

- **Feature Request Refined**: Enhanced with project context and technical details
- **Files Discovered**: 17 files across 4 priority levels
- **Implementation Steps Generated**: 10 detailed steps
- **Estimated Duration**: 2-3 days
- **Complexity**: Medium
- **Risk Level**: Medium

---

## File Discovery Results

### Critical Priority Files (Must Modify)

1. **src/components/feature/bobblehead/bobblehead-edit-dialog.tsx**
   - Main edit dialog component where photo management UI will be integrated
   - Needs to load existing photos when dialog opens

2. **src/components/ui/cloudinary-photo-upload.tsx**
   - Photo upload/management component - core UI for photo operations
   - Needs drag-drop implementation and server-side deletion integration

3. **src/lib/actions/bobbleheads/bobbleheads.actions.ts**
   - Server actions for bobblehead mutations
   - Needs new `deletePhotoAction` and `reorderPhotosAction`

4. **src/lib/db/schema/bobbleheads.schema.ts**
   - Database schema (no changes needed - already supports required fields)

### High Priority Files (Supporting Implementation)

5. **src/lib/facades/bobbleheads/bobbleheads.facade.ts**
   - Add `deletePhotoAsync`, `reorderPhotosAsync` methods

6. **src/lib/queries/bobbleheads/bobbleheads-query.ts**
   - Add query methods for photo deletion and reordering

7. **src/lib/services/cloudinary.service.ts**
   - Already has deletion logic (no changes needed)

8. **src/components/ui/sortable.tsx**
   - Production-ready sortable component (no changes needed)

9. **src/lib/validations/bobbleheads.validation.ts**
   - Add validation schemas for delete and reorder operations

10. **src/lib/validations/photo-upload.validation.ts**
    - Already comprehensive (no changes needed)

---

## Implementation Plan

### Overview

**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Medium

### Quick Summary

Implement photo deletion and drag-and-drop reordering functionality in the bobblehead edit form. Users will be able to delete individual photos with confirmation dialogs and reorder photos using @dnd-kit sortable components. Deletions will remove photos from both the database and Cloudinary storage, while reordering will update the sortOrder field to control display sequence and primary image designation.

### Prerequisites

- [ ] Database schema supports required fields (sortOrder, isPrimary already exist)
- [ ] @dnd-kit/core and @dnd-kit/sortable libraries installed
- [ ] Cloudinary service has deletion methods available
- [ ] Radix UI alert dialog components available

---

## Implementation Steps

### Step 1: Add Photo Deletion and Reordering Validation Schemas

**What**: Create Zod validation schemas for deleting and reordering bobblehead photos
**Why**: Ensure type safety and input validation for the new server actions
**Confidence**: High

**Files to Create:** None

**Files to Modify:**

- `src/lib/validations/bobbleheads.validation.ts` - Add new validation schemas

**Changes:**

- Add `deleteBobbleheadPhotoSchema` with `bobbleheadId` and `photoId` UUID fields
- Add `reorderBobbleheadPhotosSchema` with `bobbleheadId` UUID and `photoOrder` array containing id and sortOrder
- Export `DeleteBobbleheadPhoto` and `ReorderBobbleheadPhotos` type aliases

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] `deleteBobbleheadPhotoSchema` validates bobbleheadId and photoId as UUIDs
- [ ] `reorderBobbleheadPhotosSchema` validates bobbleheadId and array of photo order objects
- [ ] All validation commands pass

---

### Step 2: Add Query Methods for Photo Operations

**What**: Implement database query methods for deleting and reordering photos
**Why**: Provide data layer functions that follow existing facade-query-database pattern
**Confidence**: High

**Files to Create:** None

**Files to Modify:**

- `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Add photo operation methods

**Changes:**

- Add `deletePhotoAsync` method that deletes from bobbleheadPhotos table by id and bobbleheadId with userId check
- Add `updatePhotoSortOrderAsync` method that updates sortOrder for a single photo
- Add `batchUpdatePhotoSortOrderAsync` method that updates multiple photos in a transaction
- Add `getPhotoByIdAsync` method that retrieves a single photo with ownership validation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] `deletePhotoAsync` returns deleted photo record or null
- [ ] `batchUpdatePhotoSortOrderAsync` updates all photos atomically
- [ ] Proper error handling and ownership validation included
- [ ] All validation commands pass

---

### Step 3: Add Facade Methods for Photo Management

**What**: Create facade layer methods that orchestrate photo deletion and reordering with Cloudinary cleanup
**Why**: Encapsulate business logic including Cloudinary deletion and cache invalidation
**Confidence**: High

**Files to Create:** None

**Files to Modify:**

- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Add photo management methods

**Changes:**

- Add `deletePhotoAsync` method that deletes photo from database and calls `CloudinaryService.deletePhotosByUrls` with error handling
- Add `reorderPhotosAsync` method that validates ownership and calls `batchUpdatePhotoSortOrderAsync`
- Include proper error context and Sentry logging for both operations
- Add cache invalidation calls after successful operations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] `deletePhotoAsync` deletes from database and Cloudinary with non-blocking cleanup
- [ ] `reorderPhotosAsync` updates all photo sortOrder values in transaction
- [ ] Proper error handling with `createFacadeError` pattern
- [ ] All validation commands pass

---

### Step 4: Create Server Actions for Photo Operations

**What**: Implement authenticated server actions for deleting and reordering photos
**Why**: Provide secure, validated endpoints for client-side photo management operations
**Confidence**: High

**Files to Create:** None

**Files to Modify:**

- `src/lib/actions/bobbleheads/bobbleheads.actions.ts` - Add new server actions
- `src/lib/constants/action-names.ts` - Add action name constants
- `src/lib/constants/operations.ts` - Add operation name constants

**Changes:**

- Add `deleteBobbleheadPhotoAction` with `authActionClient`, rate limiting, and transaction support
- Add `reorderBobbleheadPhotosAction` with `authActionClient` and transaction support
- Use `ctx.sanitizedInput` parsed through validation schemas
- Include Sentry breadcrumbs and cache revalidation after successful operations
- Add `DELETE_PHOTO` and `REORDER_PHOTOS` to `ACTION_NAMES.BOBBLEHEADS`
- Add `DELETE_PHOTO` and `REORDER_PHOTOS` to `OPERATIONS.BOBBLEHEADS`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] `deleteBobbleheadPhotoAction` deletes photo and returns success response
- [ ] `reorderBobbleheadPhotosAction` updates photo order and returns success response
- [ ] Proper error handling with `handleActionError` pattern
- [ ] All validation commands pass

---

### Step 5: Update Photo Upload Component with Deletion Support

**What**: Add delete button functionality with confirmation dialog to CloudinaryPhotoUpload component
**Why**: Enable users to remove unwanted photos from the gallery during editing
**Confidence**: High

**Files to Create:** None

**Files to Modify:**

- `src/components/ui/cloudinary-photo-upload.tsx` - Add delete functionality

**Changes:**

- Add state for tracking photo to delete and confirmation dialog visibility
- Modify `removePhoto` callback to open confirmation dialog instead of immediate deletion
- Add `ConfirmDeleteAlertDialog` component rendered conditionally
- Add `handleConfirmDelete` callback that calls `deleteBobbleheadPhotoAction` for persisted photos
- Distinguish between newly uploaded photos (delete locally) and persisted photos (call server action)
- Add loading state during deletion with optimistic UI updates

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Clicking delete button shows confirmation dialog
- [ ] Confirmation triggers appropriate deletion logic (local vs server)
- [ ] Optimistic UI update removes photo immediately with rollback on error
- [ ] All validation commands pass

---

### Step 6: Add Drag-and-Drop Reordering to Photo Upload Component

**What**: Implement sortable photo grid using @dnd-kit components
**Why**: Allow users to reorder photos and set primary image through drag-and-drop
**Confidence**: Medium

**Files to Create:** None

**Files to Modify:**

- `src/components/ui/cloudinary-photo-upload.tsx` - Add sortable functionality

**Changes:**

- Import Sortable components from `sortable.tsx` (Root, Content, Item, ItemHandle, Overlay)
- Wrap photo grid with `Sortable.Root` passing photos array and `onValueChange` callback
- Wrap grid container with `Sortable.Content` component
- Replace `Card` wrapping each photo with `Sortable.Item` using `photo.id` as value prop
- Update `onValueChange` callback to update local state and debounce server action call
- Add `handleReorderComplete` that calls `reorderBobbleheadPhotosAction` with new order
- Add visual drag handle indicator and update cursor styles
- Update sortOrder values when photos array changes

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Photos can be reordered via drag-and-drop with visual feedback
- [ ] Reordering updates sortOrder in database after debounced delay
- [ ] First photo in order automatically becomes primary photo
- [ ] Drag handle provides clear affordance for draggable items
- [ ] All validation commands pass

---

### Step 7: Load Existing Photos in Edit Dialog

**What**: Fetch and display existing bobblehead photos when opening edit dialog
**Why**: Users need to see current photos to manage them during editing
**Confidence**: High

**Files to Create:** None

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-edit-dialog.tsx` - Add photo loading

**Changes:**

- Update `BobbleheadForEdit` interface to include photos array
- Call `getBobbleheadPhotosAction` when dialog opens to fetch existing photos
- Transform fetched photos to `CloudinaryPhoto` format for photo upload component
- Pass existing photos to `ItemPhotos` component via form default values
- Handle loading state while fetching photos
- Merge existing photos with newly uploaded photos in form state

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Existing photos load when edit dialog opens
- [ ] Photos display in correct sortOrder with primary indicator
- [ ] Newly uploaded photos append to existing photos
- [ ] Form state correctly manages both existing and new photos
- [ ] All validation commands pass

---

### Step 8: Integrate Photo Management with Edit Form Submission

**What**: Update form submission to handle photo deletions and reorderings
**Why**: Ensure photo changes persist when user saves bobblehead edits
**Confidence**: Medium

**Files to Create:** None

**Files to Modify:**

- `src/components/feature/bobblehead/bobblehead-edit-dialog.tsx` - Update form submission
- `src/lib/actions/bobbleheads/bobbleheads.actions.ts` - Update `updateBobbleheadWithPhotosAction`

**Changes:**

- Track deleted photo IDs in component state during editing session
- Track reordered photos in component state during editing session
- Execute photo deletions before updating bobblehead in `updateBobbleheadWithPhotosAction`
- Execute photo reorderings after updating bobblehead in `updateBobbleheadWithPhotosAction`
- Handle partial failures gracefully with user feedback
- Clear deleted and reordered tracking after successful submission

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Photo deletions persist when form is submitted
- [ ] Photo reorderings persist when form is submitted
- [ ] Errors during photo operations provide clear user feedback
- [ ] Form submission handles all photo changes atomically
- [ ] All validation commands pass

---

### Step 9: Add Optimistic Updates and Error Handling

**What**: Implement optimistic UI updates with rollback for photo operations
**Why**: Provide responsive user experience while maintaining data consistency on errors
**Confidence**: Medium

**Files to Create:** None

**Files to Modify:**

- `src/components/ui/cloudinary-photo-upload.tsx` - Add optimistic updates

**Changes:**

- Store previous photo state before delete or reorder operations
- Update UI immediately when user initiates delete or reorder
- On server action success, clear previous state
- On server action failure, restore previous state and show error toast
- Add loading indicators during server operations
- Disable drag-and-drop during pending server operations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] UI updates immediately when user deletes or reorders photos
- [ ] Failed operations rollback to previous state with error message
- [ ] Loading states prevent conflicting operations
- [ ] User receives clear feedback for all operation outcomes
- [ ] All validation commands pass

---

### Step 10: Add Cache Invalidation for Photo Operations

**What**: Invalidate relevant caches when photos are deleted or reordered
**Why**: Ensure users see updated photo data after management operations
**Confidence**: High

**Files to Create:** None

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Add photo cache methods
- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Call cache invalidation

**Changes:**

- Add `onPhotoDelete` method to `CacheRevalidationService.bobbleheads` that invalidates bobblehead photos cache
- Add `onPhotoReorder` method to `CacheRevalidationService.bobbleheads` that invalidates bobblehead photos cache
- Call cache invalidation methods after successful photo operations in facade
- Include bobbleheadId, userId, and collectionId in cache keys for targeted invalidation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Photo deletions invalidate bobblehead photos cache
- [ ] Photo reorderings invalidate bobblehead photos cache
- [ ] Cache invalidation targets correct cache keys
- [ ] Other related caches remain unaffected
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Photo deletion removes from database and Cloudinary
- [ ] Photo reordering updates sortOrder correctly
- [ ] First photo in order is marked as primary
- [ ] Confirmation dialog prevents accidental deletions
- [ ] Drag-and-drop provides visual feedback
- [ ] Optimistic updates with error rollback work correctly
- [ ] Cache invalidation updates all relevant data
- [ ] Error handling provides clear user feedback

---

## Notes

### Assumptions Requiring Confirmation

- **Assumption**: Photos should be deleted from Cloudinary when deleted from bobblehead (configurable behavior may be desired)
- **Assumption**: First photo in sortOrder always becomes primary photo automatically
- **Assumption**: Reordering should persist immediately via debounced server action rather than only on form submission

### Risk Mitigation

- **Medium Risk**: Cloudinary deletion failures should not block database deletion (already handled with non-blocking cleanup pattern)
- **Medium Risk**: Concurrent photo operations could cause race conditions (mitigate with optimistic locking or operation queuing)
- **Low Risk**: Large photo galleries may have performance issues with drag-and-drop (acceptable for MVP with note for future optimization)

### Architecture Decisions

- **High Confidence**: Use existing @dnd-kit sortable component pattern from `src/components/ui/sortable.tsx`
- **High Confidence**: Follow facade-query-database layer pattern for new photo operations
- **High Confidence**: Use `ConfirmDeleteAlertDialog` component for deletion confirmation
- **Medium Confidence**: Immediate persistence of reordering via debounced action (alternative: persist only on form save)

### Important Implementation Details

- Photo deletion must distinguish between newly uploaded (temp) photos and persisted photos
- Newly uploaded photos can be removed from local state without server action
- Persisted photos require server action to remove from database and Cloudinary
- SortOrder updates must be atomic to prevent inconsistent state
- Primary photo designation should automatically update based on first position
- Cache invalidation is critical for showing updated photo data across the application

---

## Related Documentation

- **Orchestration Logs**: `docs/2025_10_25/orchestration/bobblehead-photo-management/`
  - `00-orchestration-index.md` - Workflow overview
  - `01-feature-refinement.md` - Feature refinement details
  - `02-file-discovery.md` - File discovery analysis
  - `03-implementation-planning.md` - Planning process details
