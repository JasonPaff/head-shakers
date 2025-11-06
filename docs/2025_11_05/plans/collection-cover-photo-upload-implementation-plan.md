# Collection Cover Photo Upload - Implementation Plan

**Generated**: 2025-11-05T00:08:00Z
**Original Request**: as a user I would like to be able to upload a cover photo for my collections/subcollections
**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Low

---

## Analysis Summary

- Feature request refined with project context (Cloudinary, Server Actions, TanStack Form, Zod validation)
- Discovered 42 files across all architectural layers
- Database field `coverImageUrl` already exists in collections and subcollections tables
- Validation schemas already include `coverImageUrl: z.url().optional()`
- Complete Cloudinary infrastructure exists (upload, delete, optimize)
- Search functionality already supports cover photos (no changes needed)

---

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Low

Implement cover photo upload functionality for collections and subcollections by leveraging existing Cloudinary infrastructure. The database field and validation schemas already exist, so implementation focuses on creating UI components for upload/management, integrating with existing forms, displaying cover photos across the application, and ensuring proper cleanup on deletion.

---

## Quick Summary

Implement cover photo upload functionality for collections and subcollections by leveraging existing Cloudinary infrastructure. The database field and validation schemas already exist, so implementation focuses on creating UI components for upload/management, integrating with existing forms, displaying cover photos across the application, and ensuring proper cleanup on deletion.

---

## Prerequisites

- [x] Database field `coverImageUrl` exists in collections schema
- [x] Validation schemas support `coverImageUrl` field
- [x] Cloudinary integration with upload/delete services exists
- [ ] Verify Cloudinary folder structure accommodates cover photos
- [ ] Confirm Neon database connection for testing schema validation

---

## Implementation Steps

### Step 1: Add Cloudinary Folder Constants for Cover Photos

**What**: Define folder path constants for collection and subcollection cover photos in Cloudinary
**Why**: Establishes organized storage structure separate from bobblehead photos, following existing pattern
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\cloudinary-paths.ts` - Add cover photo folder constants

**Changes:**
- Add `COLLECTION_COVER_PHOTOS` constant with folder path pattern
- Add `SUBCOLLECTION_COVER_PHOTOS` constant with folder path pattern
- Ensure naming convention aligns with existing `BOBBLEHEAD_PHOTOS` pattern

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Cover photo folder constants added to cloudinary-paths.ts
- [ ] Constants follow existing naming and structure patterns
- [ ] All validation commands pass

---

### Step 2: Create Cover Photo Upload Component

**What**: Build reusable component for uploading single cover photo with preview and remove functionality
**Why**: Provides consistent upload experience across collection/subcollection forms, separate from multi-photo gallery component
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\cloudinary-cover-upload.tsx` - Single image upload component

**Changes:**
- Create component accepting `onUploadComplete`, `onRemove`, `currentImageUrl`, `uploaderKey` props
- Implement CldUploadWidget integration for single image upload
- Add image preview with CldImage when cover photo exists
- Add remove button with confirmation dialog
- Include loading states during upload
- Enforce image validation for file type and size
- Style consistently with existing cloudinary-photo-upload component

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component created with proper TypeScript types
- [ ] Handles single image upload with preview
- [ ] Includes remove functionality with confirmation
- [ ] Loading states implemented
- [ ] All validation commands pass

---

### Step 3: Integrate Cover Upload in Collection Create Dialog

**What**: Add cover photo upload field to collection creation form
**Why**: Enables users to set cover photo during initial collection creation
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\collections\collection-create-dialog.tsx` - Add cover upload field

**Changes:**
- Import CloudinaryCoverUpload component
- Add cover photo upload field to form layout after name/description fields
- Wire up form state for coverImageUrl field
- Handle upload completion to update form field value
- Ensure form validation respects optional nature of cover photo
- Maintain existing form submission flow with createCollectionAction

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Cover photo field added to creation form
- [ ] Upload updates form state correctly
- [ ] Form submission includes coverImageUrl when provided
- [ ] Optional field validation works correctly
- [ ] All validation commands pass

---

### Step 4: Integrate Cover Upload in Collection Edit Dialog

**What**: Add cover photo upload/replace/remove functionality to collection editing form
**Why**: Allows users to manage cover photos for existing collections
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\collections\collection-edit-dialog.tsx` - Add cover management

**Changes:**
- Import CloudinaryCoverUpload component
- Add cover photo section to edit form
- Display current cover photo if exists using CldImage
- Enable upload for new cover or replacement
- Wire up remove functionality to clear coverImageUrl field
- Handle old image deletion via Cloudinary service when replacing
- Ensure updateCollectionAction receives coverImageUrl updates

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Current cover photo displayed when exists
- [ ] Upload replaces existing cover photo
- [ ] Remove functionality clears cover photo
- [ ] Old images deleted from Cloudinary on replacement
- [ ] All validation commands pass

---

### Step 5: Integrate Cover Upload in Subcollection Create Dialog

**What**: Add cover photo upload field to subcollection creation form
**Why**: Enables users to set cover photo during subcollection creation
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\subcollections\subcollection-create-dialog.tsx` - Add cover upload

**Changes:**
- Import CloudinaryCoverUpload component
- Add cover photo upload field to form layout
- Wire up form state for coverImageUrl field
- Handle upload completion to update form value
- Ensure createSubcollectionAction receives coverImageUrl
- Maintain existing parent collection context

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Cover photo field added to subcollection creation
- [ ] Upload updates form state correctly
- [ ] Form submission includes coverImageUrl
- [ ] Parent collection relationship maintained
- [ ] All validation commands pass

---

### Step 6: Integrate Cover Upload in Subcollection Edit Dialog

**What**: Add cover photo management to subcollection editing form
**Why**: Allows users to manage cover photos for existing subcollections
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\subcollections\subcollection-edit-dialog.tsx` - Add cover management

**Changes:**
- Import CloudinaryCoverUpload component
- Add cover photo section to edit form
- Display current cover photo if exists
- Enable upload/replace functionality
- Wire up remove functionality to clear field
- Handle old image deletion from Cloudinary on replacement
- Ensure updateSubcollectionAction receives updates

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Current cover photo displayed when exists
- [ ] Upload/replace functionality works
- [ ] Remove clears cover photo
- [ ] Cloudinary cleanup on replacement
- [ ] All validation commands pass

---

### Step 7: Add Cover Photo Cleanup to Collections Facade

**What**: Implement Cloudinary image deletion when collection is deleted
**Why**: Prevents orphaned images in Cloudinary storage and maintains data consistency
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\collections\collections.facade.ts` - Add cleanup logic

**Changes:**
- Locate deleteCollection method in collections facade
- Add cover photo deletion logic using cloudinary.service deleteImage
- Extract public ID from coverImageUrl before deletion
- Handle deletion within existing transaction context
- Ensure cleanup happens before database record deletion
- Add error handling for Cloudinary deletion failures

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Cover photo deleted from Cloudinary on collection deletion
- [ ] Deletion integrated into existing transaction flow
- [ ] Error handling prevents deletion blocking
- [ ] Public ID extraction works correctly
- [ ] All validation commands pass

---

### Step 8: Add Cover Photo Cleanup to Subcollections Facade

**What**: Implement Cloudinary image deletion when subcollection is deleted
**Why**: Prevents orphaned subcollection cover images in Cloudinary storage
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\collections\subcollections.facade.ts` - Add cleanup logic

**Changes:**
- Locate deleteSubcollection method in subcollections facade
- Add cover photo deletion using cloudinary.service deleteImage
- Extract public ID from coverImageUrl before deletion
- Integrate with existing transaction context
- Ensure cleanup before database deletion
- Add error handling for Cloudinary failures

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Cover photo deleted from Cloudinary on subcollection deletion
- [ ] Integrated into transaction flow
- [ ] Error handling implemented
- [ ] Public ID extraction works
- [ ] All validation commands pass

---

### Step 9: Display Cover Photo in Collection Header Component

**What**: Show collection cover photo prominently in collection detail page header
**Why**: Provides visual identity for collections and enhances user experience on detail pages
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collections\[collectionId]\(collection)\components\collection-header.tsx` - Add cover display

**Changes:**
- Import CldImage from next-cloudinary
- Add cover photo section at top of header component
- Display cover photo using CldImage with optimization when coverImageUrl exists
- Implement responsive sizing for different viewports
- Add fallback placeholder image when no cover photo set
- Apply consistent aspect ratio and styling
- Ensure cover photo doesn't interfere with existing header elements

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Cover photo displayed prominently in collection header
- [ ] CldImage optimization applied
- [ ] Responsive sizing works across viewports
- [ ] Fallback placeholder shows when no cover
- [ ] All validation commands pass

---

### Step 10: Display Cover Photo in Collection Card Component

**What**: Show collection cover photo in dashboard collection cards
**Why**: Provides visual distinction in collection lists and improves browsing experience
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\dashboard\collection\(collection)\components\collection-card.tsx` - Add cover display

**Changes:**
- Import CldImage from next-cloudinary
- Add cover photo section to card layout
- Display cover using CldImage with thumbnail optimization
- Implement card aspect ratio for consistent grid layout
- Add fallback placeholder for collections without covers
- Ensure cover photo doesn't disrupt card information layout
- Maintain existing card hover and interaction states

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Cover photo displayed in collection cards
- [ ] Thumbnail optimization applied
- [ ] Consistent card layout maintained
- [ ] Fallback placeholder implemented
- [ ] All validation commands pass

---

### Step 11: Display Cover Photo in Subcollection Header Component

**What**: Show subcollection cover photo in subcollection detail page header
**Why**: Provides visual identity for subcollections matching collection header experience
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collections\[collectionId]\subcollection\[subcollectionId]\components\subcollection-header.tsx` - Add cover display

**Changes:**
- Import CldImage from next-cloudinary
- Add cover photo section to subcollection header
- Display cover using CldImage with optimization
- Implement responsive sizing consistent with collection headers
- Add fallback placeholder when no cover set
- Apply matching aspect ratio and styling to collection header
- Ensure header hierarchy remains clear

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Cover photo displayed in subcollection header
- [ ] Styling consistent with collection headers
- [ ] Responsive sizing implemented
- [ ] Fallback placeholder works
- [ ] All validation commands pass

---

### Step 12: Display Cover Photos in Subcollections List Component

**What**: Show subcollection cover photos in parent collection's subcollections list
**Why**: Improves visual browsing of subcollections within collection detail pages
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\collections\[collectionId]\(collection)\components\collection-subcollections-list.tsx` - Add cover displays

**Changes:**
- Import CldImage from next-cloudinary
- Add cover photo to each subcollection list item
- Display covers using CldImage with small thumbnail optimization
- Implement consistent sizing for list view
- Add fallback placeholder for subcollections without covers
- Ensure list item layout remains clear and scannable
- Maintain existing subcollection metadata display

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Cover photos shown in subcollections list
- [ ] Thumbnail optimization applied
- [ ] Consistent list item layout
- [ ] Fallback placeholders implemented
- [ ] All validation commands pass

---

### Step 13: Display Cover Photos in Featured Collections Display

**What**: Show collection cover photos in home page featured collections section
**Why**: Enhances visual appeal of featured content and improves content discovery
**Confidence**: Medium

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\(home)\components\display\featured-collections-display.tsx` - Add cover displays

**Changes:**
- Import CldImage from next-cloudinary
- Add cover photo display to featured collection cards
- Implement optimized image loading for hero section
- Apply appropriate sizing for featured content prominence
- Add fallback placeholder for collections without covers
- Ensure featured section visual hierarchy maintained
- Test performance impact of multiple cover images

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Cover photos displayed in featured collections
- [ ] Image optimization maintains page performance
- [ ] Visual hierarchy preserved
- [ ] Fallback placeholders work
- [ ] All validation commands pass

---

### Step 14: Create Default Placeholder Cover Images

**What**: Add default placeholder images for collections and subcollections without covers
**Why**: Ensures consistent visual experience when users haven't uploaded cover photos
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\public\images\collection-cover-placeholder.png` - Collection default
- `C:\Users\JasonPaff\dev\head-shakers\public\images\subcollection-cover-placeholder.png` - Subcollection default

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\cloudinary-paths.ts` - Add placeholder constants

**Changes:**
- Create or obtain collection placeholder image with appropriate branding
- Create or obtain subcollection placeholder image
- Add placeholder image paths as constants in cloudinary-paths
- Ensure placeholders match application theme and color scheme
- Optimize placeholder file sizes for web delivery
- Export placeholder constants for use across components

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Placeholder images added to public folder
- [ ] Placeholder constants defined
- [ ] Images optimized for web
- [ ] Consistent branding applied
- [ ] All validation commands pass

---

### Step 15: Add Cloudinary Upload Preset Configuration

**What**: Verify or create Cloudinary upload preset for cover photos with size and format constraints
**Why**: Ensures uploaded cover photos meet quality and performance requirements
**Confidence**: Medium

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\services\cloudinary.service.ts` - Add cover photo preset config

**Changes:**
- Document required Cloudinary upload preset settings for cover photos
- Add preset name constant for cover photo uploads
- Define acceptable image formats (JPEG, PNG, WebP)
- Set maximum file size limits (suggested 5MB)
- Configure automatic format optimization
- Add width/height constraints for optimal display
- Update CloudinaryCoverUpload component to use preset

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Upload preset configuration documented
- [ ] Preset constant added to service
- [ ] Format and size constraints defined
- [ ] Upload component uses correct preset
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Cover photo uploads successfully for collections and subcollections
- [ ] Cover photos display correctly across all pages (headers, cards, lists, featured)
- [ ] Cover photos properly deleted from Cloudinary on collection/subcollection deletion
- [ ] Cover photos properly replaced and old images cleaned up on update
- [ ] Fallback placeholders display when no cover photo exists
- [ ] Image optimization working (responsive sizing, format conversion)
- [ ] Forms validate correctly with optional coverImageUrl field
- [ ] Manual testing of upload/replace/remove workflows completed
- [ ] Manual testing of display responsiveness across viewports completed

---

## Notes

### Key Advantages

- Database field and validation schemas already exist, reducing implementation scope
- Existing Cloudinary infrastructure (upload, delete, optimize) can be leveraged directly
- Pattern established by bobblehead photo gallery provides clear implementation reference
- Search functionality already supports cover photos (no modifications needed)

### Important Considerations

- Cover photos are optional - all display components must handle missing covers gracefully
- Cloudinary cleanup is critical for storage management - must happen on deletion and replacement
- Upload preset configuration may require Cloudinary dashboard access for creation/verification
- Consider rate limiting on uploads if not already handled by existing Cloudinary integration
- Placeholder images should maintain consistent aspect ratios with actual cover photos

### Assumptions Requiring Validation

- Cloudinary upload signatures support cover photo folder paths (High confidence based on existing code)
- Current Cloudinary plan supports required storage and transformations (Assumed but verify)
- Existing form submission flows can handle coverImageUrl updates without additional backend changes (High confidence - field already in schema)

### Testing Recommendations

- Test upload with various image formats and sizes
- Test replacement flow to ensure old images deleted
- Test deletion flow for both collections and subcollections
- Verify responsive display across mobile, tablet, desktop viewports
- Test fallback placeholder display in all contexts
- Verify Cloudinary storage cleanup after operations

---

## File Discovery Results

### Critical Priority (2 files)
- src/lib/db/schema/collections.schema.ts - Database schema with coverImageUrl field
- src/lib/constants/schema-limits.ts - Field constraints and validation limits

### High Priority (15 files)
- src/lib/validations/collections.validation.ts - Zod validation
- src/lib/validations/subcollections.validation.ts - Zod validation
- src/lib/validations/photo-upload.validation.ts - Reference pattern
- src/lib/actions/collections/collections.actions.ts - Server actions
- src/lib/actions/collections/subcollections.actions.ts - Server actions
- src/lib/facades/collections/collections.facade.ts - Business logic
- src/lib/facades/collections/subcollections.facade.ts - Business logic
- src/lib/queries/collections/collections.query.ts - Database queries
- src/lib/queries/collections/subcollections.query.ts - Database queries
- src/lib/services/cloudinary.service.ts - Cloudinary service
- src/components/ui/cloudinary-photo-upload.tsx - Reference component
- src/lib/utils/cloudinary.utils.ts - Cloudinary utilities
- src/app/api/upload/sign/route.ts - Upload signature endpoint
- src/types/cloudinary.types.ts - TypeScript types
- src/lib/constants/cloudinary-paths.ts - Cloudinary folder paths

### Medium Priority (19 files)
- Form components (collection/subcollection create/edit dialogs)
- Display components (headers, cards, lists, featured collections)
- Reference components (bobblehead gallery, photo upload)
- Supporting components (search, admin)

### Low Priority (6 files)
- Cache services, configuration, defaults

**Total Files Discovered**: 42 highly relevant files across all architectural layers
