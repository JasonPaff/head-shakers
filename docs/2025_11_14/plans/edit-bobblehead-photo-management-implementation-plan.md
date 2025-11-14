# Edit Bobblehead Photo Management - Implementation Plan

**Generated**: 2025-11-14T00:02:30Z
**Original Request**: I want update the edit bobblehead feature to better handle changing/updating/adding photos to the bobbleheads

**Refined Request**: Enhance the edit bobblehead feature to provide a more seamless and intuitive experience for managing bobblehead photos, leveraging the existing Next.js 15.5.3 App Router with React 19.1.0 and the TanStack React Form framework. Currently, the photo management workflow in the edit dialog requires improvements in how photos are fetched, transformed between database and client-side CloudinaryPhoto formats, and persisted during updates. The enhancement should streamline the photo lifecycle by optimizing how the CloudinaryPhotoUpload component handles adding new photos via the Cloudinary widget, modifying existing photo metadata (alt text, captions), deleting photos with optimistic updates and rollback handling, and reordering photos with debounced server-side persistence to the bobbleheadPhotos table. Integration with Next-Safe-Action server actions (updateBobbleheadWithPhotosAction and getBobbleheadPhotosAction) should be improved to ensure smooth data synchronization with the PostgreSQL/Neon database while maintaining consistency with the photo sort order and primary photo designation. The goal is to make photo management in the edit dialog more responsive, reliable, and user-friendly by reducing friction in the upload-modify-delete-reorder workflow, including better feedback during operations, clearer visual states during processing, and more efficient handling of the 8-photo maximum limit per bobblehead.

---

## Analysis Summary

- **Feature request refined** with project context (Next.js 15.5.3, React 19.1.0, Cloudinary, TanStack React Form)
- **Discovered 28 files** across 4 priority levels (4 critical, 6 high, 7 medium, 11 low)
- **Generated 12-step implementation plan** with estimated 2-3 day duration
- **Identified key patterns**: Photo transformation, two-phase storage, optimistic UI, dual photo handling
- **Mapped integration points**: Server actions flow, cache management, photo lifecycle

---

## File Discovery Results

### Critical Priority Files (4)

1. **src/components/feature/bobblehead/bobblehead-edit-dialog.tsx**
   - Central orchestration for edit workflow
   - Fetches photos, transforms formats, handles form submission

2. **src/components/ui/cloudinary-photo-upload.tsx**
   - Core photo management component
   - Implements upload, modify, delete, reorder operations
   - Handles optimistic updates and debouncing

3. **src/lib/actions/bobbleheads/bobbleheads.actions.ts**
   - Server-side photo operations
   - Actions: update, get, delete, reorder photos

4. **src/lib/validations/bobbleheads.validation.ts**
   - Type safety and validation schemas
   - Validates all photo operations

### High Priority Files (6)

5. **src/lib/db/schema/bobbleheads.schema.ts** - Database schema for bobbleheadPhotos
6. **src/lib/facades/bobbleheads/bobbleheads.facade.ts** - Business logic with caching
7. **src/lib/queries/bobbleheads/bobbleheads-query.ts** - Database operations
8. **src/types/cloudinary.types.ts** - Type definitions for photos
9. **src/lib/validations/photo-upload.validation.ts** - Photo validation schemas
10. **src/lib/utils/cloudinary.utils.ts** - URL transformation utilities

### Architecture Patterns

**Photo Transformation Pattern**:
- Database: `BobbleheadPhoto` (UUID-based)
- Client: `CloudinaryPhoto` (supports temp IDs)
- Temp photos: `temp-${timestamp}-${random}`
- Persisted photos: UUIDs from database

**Two-Phase Storage**:
- Upload → Cloudinary temp folder (`users/${userId}/temp`)
- Submit → Move to permanent (`users/${userId}/collections/${collectionId}/bobbleheads/${bobbleheadId}`)

**Optimistic UI with Rollback**:
- Delete: Immediate UI update → server action → rollback if fails
- Reorder: Debounced (500ms) to reduce server calls

**Photo Lifecycle**:
```
Upload → Cloudinary widget → temp folder → client state
Modify → Update CloudinaryPhoto in form state
Delete → Optimistic update → server action → rollback on error
Reorder → Immediate UI update → debounced server sync
Submit → Move all new photos → update metadata → persist to DB
```

---

## Implementation Plan

### Overview

**Estimated Duration**: 2-3 days
**Complexity**: High
**Risk Level**: Medium

### Quick Summary

Enhance the edit bobblehead feature to provide a seamless photo management experience by improving photo fetching and transformation, streamlining the upload-modify-delete-reorder workflow, adding better visual feedback during operations, and optimizing the integration between CloudinaryPhotoUpload component and Next-Safe-Action server actions with the PostgreSQL database.

### Prerequisites

- [ ] Database is accessible and migrations are up to date
- [ ] Cloudinary credentials are properly configured
- [ ] Next-Safe-Action middleware is functioning correctly
- [ ] TanStack React Form is installed and configured

---

### Step 1: Enhance Photo Metadata Update Handling

**What**: Implement real-time metadata persistence for alt text and caption updates in existing photos

**Why**: Currently metadata changes are only saved on form submission, causing potential data loss if dialog is closed

**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\cloudinary-photo-upload.tsx`
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\bobbleheads\bobbleheads.actions.ts`
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\bobbleheads.validation.ts`

**Changes:**
- Add new `updateBobbleheadPhotoMetadataSchema` with fields for photoId, bobbleheadId, altText, and caption
- Create `updateBobbleheadPhotoMetadataAction` using authActionClient with rate limiting
- Add useRef for debounce timers (one per photo) in CloudinaryPhotoUpload
- Modify `updatePhoto` callback to trigger debounced server action for persisted photos (not temp photos)
- Add visual indicator (subtle icon or color change) when metadata is being saved
- Implement cleanup for all debounce timers in useEffect cleanup

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] New validation schema passes type checking
- [ ] Server action properly validates input and updates database
- [ ] Metadata updates are debounced to prevent excessive server calls
- [ ] Visual feedback appears during save operations
- [ ] All validation commands pass

---

### Step 2: Improve Photo Transformation and State Management

**What**: Create dedicated utility functions for transforming between database BobbleheadPhoto and client CloudinaryPhoto formats

**Why**: Current transformation logic in the dialog is verbose and error-prone, centralization improves maintainability

**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\utils\photo-transform.utils.ts`

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\bobblehead\bobblehead-edit-dialog.tsx`
- `C:\Users\JasonPaff\dev\head-shakers\src\types\cloudinary.types.ts`

**Changes:**
- Create `transformDatabasePhotoToCloudinary` function accepting BobbleheadPhoto and returning CloudinaryPhoto
- Create `transformCloudinaryPhotoToDatabase` function accepting CloudinaryPhoto and returning InsertBobbleheadPhoto
- Create `isPersistedPhoto` type guard checking if photo.id is UUID vs temp-prefixed
- Add `isTempPhoto` type guard as inverse of isPersistedPhoto
- Replace inline transformation in bobblehead-edit-dialog.tsx with utility function
- Add comprehensive JSDoc comments explaining format expectations
- Export type guards from cloudinary.types.ts for reuse

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Transformation utilities handle all edge cases (null values, missing fields)
- [ ] Type guards correctly identify persisted vs temporary photos
- [ ] Edit dialog uses new utilities without breaking existing functionality
- [ ] All validation commands pass

---

### Step 3: Enhance Photo Fetch with Loading States and Error Handling

**What**: Add comprehensive loading states, error handling, and retry logic to photo fetching in edit dialog

**Why**: Current implementation has minimal feedback during photo loading, causing poor UX

**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\bobblehead\bobblehead-edit-dialog.tsx`
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\cloudinary-photo-upload.tsx`

**Changes:**
- Change setIsLoadingPhotos from unused state to actively displayed loading indicator
- Add error state management for photo fetch failures with retry capability
- Display skeleton loaders for photos while fetching (8 placeholder cards)
- Add error alert with retry button if photo fetch fails
- Implement exponential backoff retry logic (max 3 attempts, 1s/2s/4s delays)
- Show photo count during loading ("Loading X photos...")
- Add timeout handling (30 second timeout for photo fetch)
- Log all fetch attempts and outcomes to Sentry with proper context

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Loading skeleton appears immediately when dialog opens
- [ ] Error states display with actionable retry button
- [ ] Retry logic properly handles transient failures
- [ ] Timeout prevents indefinite hanging
- [ ] All validation commands pass

---

### Step 4: Optimize Photo Deletion with Enhanced Rollback

**What**: Improve optimistic delete with better rollback handling and photo reindexing

**Why**: Current rollback doesn't maintain isPrimary state and sortOrder correctly

**Confidence**: Medium

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\cloudinary-photo-upload.tsx`
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\bobbleheads\bobbleheads.actions.ts`

**Changes:**
- Store complete previous state including each photo's isPrimary and sortOrder values
- Modify deleteBobbleheadPhotoAction to automatically set next photo as primary if deleting primary photo
- Add transaction handling to ensure atomic deletion and reindexing in database
- Update optimistic delete to properly reassign isPrimary to first photo if needed
- Improve rollback to restore exact previous state including all metadata
- Add visual "Deleting..." state on the specific photo being removed
- Show toast notification on successful delete with undo option (5 second window)
- Implement undo functionality that restores photo from previousPhotosState

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Deleting primary photo automatically promotes next photo to primary
- [ ] Rollback restores exact previous state including isPrimary flags
- [ ] Database transaction ensures consistency between deletion and reindexing
- [ ] Visual feedback clearly indicates which photo is being deleted
- [ ] Undo functionality works within 5 second window
- [ ] All validation commands pass

---

### Step 5: Enhance Photo Reordering with Visual Feedback

**What**: Add visual feedback during photo reordering operations and optimize debounce behavior

**Why**: Users lack feedback when dragging photos and don't know if reorder was persisted

**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\cloudinary-photo-upload.tsx`
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\config.ts`

**Changes:**
- Add subtle pulsing border animation to photos while reorder server action is pending
- Display small "Saving order..." indicator in photo grid header during debounce period
- Show success checkmark briefly when reorder completes successfully
- Add error indicator if reorder fails with retry button
- Reduce debounce from 1000ms to 800ms for more responsive feel
- Cancel pending reorder on dialog close to prevent stale updates
- Add visual drag preview showing photo being moved with semi-transparent overlay
- Implement haptic feedback (CSS transform scale) when photo is picked up for dragging

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Visual feedback appears immediately when dragging begins
- [ ] "Saving order..." indicator shows during debounce window
- [ ] Success/error states are clearly communicated
- [ ] Debounce timing feels responsive without excessive server calls
- [ ] Pending reorders are cancelled on dialog close
- [ ] All validation commands pass

---

### Step 6: Implement 8-Photo Limit Enforcement and Feedback

**What**: Add comprehensive UI feedback for the 8-photo maximum limit

**Why**: Current implementation hides upload button but doesn't clearly communicate why

**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\cloudinary-photo-upload.tsx`
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\bobblehead\bobblehead-edit-dialog.tsx`

**Changes:**
- Replace conditional hide of upload button with disabled state showing "Maximum 8 photos reached"
- Add info callout when at 7 photos: "You can add 1 more photo"
- Add warning callout when at 8 photos: "Maximum photo limit reached. Delete a photo to add another."
- Update AnimatedMotivationalMessage to show limit-specific messages
- Add progress indicator showing "X/8 photos" with visual progress bar
- Prevent Cloudinary widget from accepting more than remaining allowed photos
- Show error toast if upload widget somehow allows overflow photos
- Add FAQ-style expandable section explaining why limit exists

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Upload button clearly communicates limit state when disabled
- [ ] Progressive warnings appear at 7 and 8 photos
- [ ] Visual progress bar accurately reflects photo count
- [ ] Cloudinary widget respects remaining photo slots
- [ ] All validation commands pass

---

### Step 7: Improve Photo Upload Flow with Better State Management

**What**: Enhance upload progress tracking and error handling for multiple simultaneous uploads

**Why**: Current implementation shows basic progress but doesn't handle individual file errors well

**Confidence**: Medium

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\cloudinary-photo-upload.tsx`
- `C:\Users\JasonPaff\dev\head-shakers\src\types\cloudinary.types.ts`

**Changes:**
- Extend PhotoUploadState to track individual file progress with Map<filename, progress>
- Display individual progress bars for each uploading file (max 3 visible, rest collapsed)
- Add per-file error states with specific error messages
- Show which files succeeded vs failed after batch upload completes
- Add "Cancel upload" button that stops in-progress uploads
- Implement automatic retry for failed uploads (max 2 retries per file)
- Show estimated time remaining based on upload speed
- Add upload speed indicator (KB/s or MB/s)
- Prevent form submission while uploads are in progress with clear message

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Individual file progress is accurately tracked and displayed
- [ ] Failed uploads show specific error messages
- [ ] Retry logic handles transient upload failures
- [ ] Cancel functionality cleanly stops uploads
- [ ] Form submission is blocked during active uploads
- [ ] All validation commands pass

---

### Step 8: Optimize Form State Cleanup and Memory Management

**What**: Improve cleanup of photo preview URLs and form state when dialog closes

**Why**: Current implementation may leak memory with blob URLs and doesn't properly clean up debounce timers

**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\bobblehead\bobblehead-edit-dialog.tsx`
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\cloudinary-photo-upload.tsx`

**Changes:**
- Create cleanup function that revokes all blob URLs for photo previews
- Move form.reset() to immediate execution instead of setTimeout
- Add cleanup for all pending debounce timers (metadata updates, reorder)
- Cancel any in-progress server actions on dialog close
- Clear photosFetchedRef.current and previousPhotosState on cleanup
- Add useEffect cleanup in CloudinaryPhotoUpload for all timers
- Implement proper disposal of Cloudinary widget instance
- Add memory usage monitoring in development mode with console warnings

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] No blob URLs are leaked when dialog closes
- [ ] All debounce timers are properly cleared
- [ ] Form state resets immediately on close
- [ ] No pending server actions fire after dialog closes
- [ ] Memory usage doesn't grow with repeated dialog open/close cycles
- [ ] All validation commands pass

---

### Step 9: Add Comprehensive Error Boundaries and Fallbacks

**What**: Implement error boundaries around photo management components with graceful degradation

**Why**: Photo operations can fail in various ways, need graceful handling without breaking entire form

**Confidence**: Medium

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\bobblehead\photo-management-error-boundary.tsx`

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\bobblehead\bobblehead-edit-dialog.tsx`
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\cloudinary-photo-upload.tsx`

**Changes:**
- Create PhotoManagementErrorBoundary with photo-specific error recovery
- Add fallback UI showing error message with "Retry" and "Continue without photos" options
- Log all caught errors to Sentry with component stack traces
- Provide option to continue editing bobblehead without photo management if photos fail
- Add error boundary reset when dialog reopens
- Display user-friendly error messages based on error type (network, validation, permission)
- Implement automatic error reporting with sanitized data
- Add recovery suggestions based on error context

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Error boundary catches photo-related errors without crashing form
- [ ] Fallback UI provides clear recovery options
- [ ] Errors are properly logged to Sentry with context
- [ ] Users can continue editing other fields if photos fail
- [ ] All validation commands pass

---

### Step 10: Enhance Primary Photo Selection Experience

**What**: Improve UX for setting primary photo with visual hierarchy and quick actions

**Why**: Current star icon in overlay is not immediately obvious for primary photo designation

**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\cloudinary-photo-upload.tsx`

**Changes:**
- Add prominent "Primary Photo" label with distinct styling on primary photo card
- Show gold/yellow border on primary photo card (not just badge)
- Add tooltip on star button explaining "Set as primary photo / Cover image"
- Make entire primary badge clickable to remove primary status (requires selecting different primary)
- Add quick action in photo context menu: "Set as primary"
- Show confirmation when changing primary: "This will replace your current cover photo"
- Add visual transition animation when primary photo changes
- Ensure first photo is automatically set as primary when all photos are deleted and new one added

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Primary photo is visually distinct with border and label
- [ ] Tooltips clearly explain primary photo functionality
- [ ] Smooth animations accompany primary photo changes
- [ ] Auto-primary selection works correctly for first photo
- [ ] All validation commands pass

---

### Step 11: Implement Optimistic Updates for New Photo Uploads

**What**: Show newly uploaded photos immediately while they process in background

**Why**: Current implementation waits for Cloudinary response before showing photo, feels slow

**Confidence**: Medium

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\cloudinary-photo-upload.tsx`
- `C:\Users\JasonPaff\dev\head-shakers\src\types\cloudinary.types.ts`

**Changes:**
- Add optional `isUploading` and `uploadProgress` fields to CloudinaryPhoto type
- Create local blob URL for preview immediately when file is selected
- Add photo to state with temp ID and isUploading=true before Cloudinary upload completes
- Show upload progress overlay on photo card (spinner + percentage)
- Replace temp photo with real photo data when Cloudinary responds
- Handle upload failure by showing error state on photo card with retry button
- Add pulsing border animation to uploading photos
- Show "Processing..." state after upload completes but before photo is fully ready
- Remove blob URL and cleanup after real photo data arrives

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Photos appear immediately when selected for upload
- [ ] Upload progress is accurately displayed on each photo
- [ ] Failed uploads show clear error states with retry options
- [ ] No memory leaks from blob URLs
- [ ] Smooth transition from temp to real photo data
- [ ] All validation commands pass

---

### Step 12: Add Bulk Photo Actions and Management

**What**: Implement bulk selection and actions (delete multiple, reorder multiple) for efficiency

**Why**: Managing photos one-by-one is tedious when reorganizing multiple photos

**Confidence**: Low

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\cloudinary-photo-upload.tsx`

**Changes:**
- Add "Select Multiple" toggle button above photo grid
- Show checkboxes on each photo card when in selection mode
- Add bulk action toolbar when photos are selected: "Delete Selected (X)", "Clear Selection"
- Implement multi-select logic with Set<photoId> state
- Add confirmation dialog for bulk delete showing count and thumbnails
- Implement optimistic bulk delete with collective rollback on failure
- Add keyboard shortcuts: Cmd/Ctrl+A to select all, Escape to clear selection
- Show selected count in toolbar: "X photos selected"
- Disable bulk actions for temporary (not-yet-saved) photos
- Add accessibility labels for all bulk action controls

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Selection mode clearly toggles photo cards to show checkboxes
- [ ] Bulk delete confirms action and handles rollback properly
- [ ] Keyboard shortcuts work as expected
- [ ] Accessibility labels are comprehensive
- [ ] Temp photos are excluded from bulk operations
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Photo upload workflow completes successfully with visual feedback
- [ ] Photo deletion with rollback works correctly
- [ ] Photo reordering persists to database with debouncing
- [ ] Metadata updates (alt text, caption) save with debouncing
- [ ] 8-photo limit is enforced with clear user feedback
- [ ] Form cleanup prevents memory leaks
- [ ] Error boundaries gracefully handle photo operation failures
- [ ] Primary photo selection works intuitively
- [ ] All Sentry error logging includes proper context

---

## Notes

### Critical Considerations

- The debounce timing for photo reordering (800ms) balances responsiveness with server load - monitor rate limit hits in production
- Photo transformation utilities must handle edge cases where database photos have null values for optional fields (altText, caption, dimensions)
- Memory management is crucial due to blob URL creation for previews - ensure proper cleanup in all code paths
- The updateBobbleheadWithPhotosAction currently only handles NEW photos being added, not updates to existing photo metadata - this is a significant gap addressed in Step 1
- Consider implementing photo compression client-side before Cloudinary upload to reduce bandwidth and improve UX for users on slow connections
- The current architecture separates temp (users/userId/temp) from permanent (users/userId/collectionId/bobbleheadId) Cloudinary folders - this two-phase approach must be maintained

### Architecture Decisions

- Using debounced server actions for metadata and reorder to balance UX responsiveness with server efficiency
- Optimistic updates for all operations (delete, reorder, metadata) to provide immediate feedback while maintaining data consistency through rollback mechanisms
- Error boundaries isolate photo management failures from rest of form to prevent catastrophic UX failures
- Type guards (isPersistedPhoto, isTempPhoto) centralize photo identification logic for consistency across components

### Testing Recommendations

- Test photo operations with slow network throttling to verify loading states
- Test concurrent operations (uploading while reordering) to ensure state consistency
- Test error scenarios: network failures, Cloudinary outages, invalid file types
- Test memory usage with repeated dialog open/close cycles
- Test accessibility with keyboard-only navigation and screen readers

---

## Orchestration Links

For detailed orchestration logs, see:
- [Orchestration Index](../orchestration/edit-bobblehead-photo-management/00-orchestration-index.md)
- [Step 1: Feature Refinement](../orchestration/edit-bobblehead-photo-management/01-feature-refinement.md)
- [Step 2: File Discovery](../orchestration/edit-bobblehead-photo-management/02-file-discovery.md)
- [Step 3: Implementation Planning](../orchestration/edit-bobblehead-photo-management/03-implementation-planning.md)
