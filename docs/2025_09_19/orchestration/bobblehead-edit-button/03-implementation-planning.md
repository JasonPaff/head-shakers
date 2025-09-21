# Step 3: Implementation Planning

## Step Metadata

- **Step Start Time**: 2025-09-19T16:50:00.000Z
- **Step End Time**: 2025-09-19T16:52:30.000Z
- **Duration**: 150 seconds
- **Status**: SUCCESS

## Refined Request and File Analysis Used as Input

**Refined Feature Request:**
I need to implement the edit button functionality for the bobblehead page that allows authenticated users to modify their existing bobblehead entries through a comprehensive editing interface. This feature should include an edit button that appears conditionally based on user ownership permissions verified through Clerk authentication, which when clicked opens a modal or navigates to an edit form built with TanStack Form and Radix UI components styled with Tailwind CSS. The edit form must populate with existing bobblehead data fetched from the PostgreSQL database via Drizzle ORM queries, presenting all editable fields including name, description, specifications, custom metadata fields, and the photo gallery with Cloudinary integration for image uploads, replacements, and deletions. Form validation should utilize Zod schemas that mirror the Drizzle database schema to ensure data integrity, with real-time client-side validation feedback and proper error handling. The form submission should trigger a server action built with next-safe-action that performs authentication checks, validates the updated data against the Zod schema, handles any image operations through Cloudinary APIs, and executes the database update transaction using Drizzle ORM with proper error handling and rollback capabilities. The interface should provide visual feedback during the save process with loading states, success confirmations, and error messages, while maintaining accessibility standards through proper ARIA labels and keyboard navigation support. Upon successful update, the user should be redirected back to the updated bobblehead detail page with a success notification, and the changes should be immediately reflected in the UI. The implementation must follow the established patterns in the codebase for server actions, form handling, and component architecture while ensuring type safety throughout the entire flow from the UI components down to the database operations, and should integrate seamlessly with the existing bobblehead management system including any related collections or subcollections that reference the edited bobblehead.

**File Discovery Analysis Summary:**

- 19 highly relevant files discovered across 3 priority levels
- 6 high priority files for core implementation
- 6 medium priority files for supporting/integration
- 7 low priority files that may need updates
- Existing patterns identified: dialog-based editing, TanStack Forms, authActionClient, Drizzle-Zod validation

## Complete Agent Prompt Sent

```
Generate an implementation plan in MARKDOWN format (NOT XML) following your defined template with these sections: ## Overview (with Estimated Duration, Complexity, Risk Level), ## Quick Summary, ## Prerequisites, ## Implementation Steps (each step with What/Why/Confidence/Files/Changes/Validation Commands/Success Criteria), ## Quality Gates, ## Notes. IMPORTANT: Include 'npm run lint:fix && npm run typecheck' validation for every step touching JS/JSX/TS/TSX files. Do NOT include code examples.

[Full prompt with feature request, file analysis, and project context - see previous sections for complete details]
```

## Full Agent Response with Implementation Plan

Now I have a comprehensive understanding of the codebase. Let me analyze the existing patterns and create the implementation plan.

# Implementation Plan: Bobblehead Edit Functionality

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

Implement comprehensive bobblehead editing functionality with modal-based form interface, photo management, server actions, and proper authentication. Users can edit all bobblehead fields including photos via a button in the bobblehead header that opens a dialog form with validation and transaction support.

## Prerequisites

- [ ] Existing bobblehead data structure and validation schemas are in place
- [ ] TanStack Form and Radix UI components are available
- [ ] Cloudinary integration is functional for photo operations
- [ ] Clerk authentication is properly configured

## Implementation Steps

### Step 1: Add Update Schema to Bobblehead Validations

**What**: Create update-specific Zod schema for bobblehead editing with proper validation
**Why**: Need separate schema for updates that excludes auto-generated fields and includes ID
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/lib/validations/bobbleheads.validation.ts` - Add updateBobbleheadSchema and related types

**Changes:**

- Add updateBobbleheadSchema extending insertBobbleheadSchema with id field and partial data
- Add updateBobbleheadWithPhotosSchema for comprehensive updates including photos
- Add UpdateBobbleheadInput and UpdateBobbleheadWithPhotosInput type exports
- Add getBobbleheadForEditSchema for fetching editable data

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] updateBobbleheadSchema validates correctly with required ID field
- [ ] All validation commands pass
- [ ] New types are properly exported

---

### Step 2: Implement Update Method in BobbleheadsQuery

**What**: Add updateAsync method to handle database update operations with proper authorization
**Why**: Need query layer method to perform actual database updates with user ownership validation
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Add updateAsync method

**Changes:**

- Add updateAsync method accepting UpdateBobbleheadInput and userId
- Include proper ownership validation using userId in WHERE clause
- Return updated BobbleheadRecord or null
- Follow existing query patterns for error handling and context usage

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] updateAsync method properly validates user ownership
- [ ] Method returns updated record with all relations
- [ ] All validation commands pass

---

### Step 3: Add Update Method to BobbleheadsFacade

**What**: Implement updateAsync method in facade with proper error handling and caching
**Why**: Business logic layer needs to coordinate updates with photo management and cache invalidation
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Add updateAsync method

**Changes:**

- Add updateAsync method with photo handling logic
- Implement Cloudinary photo operations for updates/replacements
- Add proper error handling with facade error context
- Include cache invalidation for updated bobblehead
- Handle tag updates if provided

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] updateAsync method handles complex photo operations
- [ ] Proper error handling and logging implemented
- [ ] Cache invalidation occurs on successful updates
- [ ] All validation commands pass

---

### Step 4: Create Update Server Action

**What**: Implement updateBobbleheadWithPhotosAction with authentication and transaction support
**Why**: Need secure server action to handle form submissions with proper authorization checks
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/lib/actions/bobbleheads/bobbleheads.actions.ts` - Add updateBobbleheadWithPhotosAction

**Changes:**

- Add updateBobbleheadWithPhotosAction using authActionClient
- Include rate limiting middleware for update operations
- Implement transaction support with rollback capabilities
- Add proper Sentry tracking and error handling
- Include cache revalidation on successful updates

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Server action properly validates user authorization
- [ ] Transaction support ensures data consistency
- [ ] Rate limiting prevents abuse
- [ ] All validation commands pass

---

### Step 5: Create Bobblehead Edit Dialog Component

**What**: Build comprehensive edit dialog component with form sections and photo management
**Why**: Users need intuitive interface to edit all bobblehead properties including photos
**Confidence**: Medium

**Files to Create:**

- `src/components/feature/bobblehead/bobblehead-edit-dialog.tsx` - Main edit dialog component

**Files to Modify:**

- None

**Changes:**

- Create modal dialog using Radix UI Dialog components
- Implement TanStack Form with proper validation and focus management
- Include all form sections from add form (basic info, photos, acquisition, etc.)
- Add photo management with upload, replace, and delete capabilities
- Implement proper loading states and error handling
- Add form reset and cleanup on close

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Dialog opens/closes properly with form state management
- [ ] All bobblehead fields are editable with proper validation
- [ ] Photo management functions correctly
- [ ] All validation commands pass

---

### Step 6: Create Edit Form Options Configuration

**What**: Create reusable form configuration for edit functionality based on add form patterns
**Why**: Need consistent form behavior and validation between add and edit operations
**Confidence**: High

**Files to Create:**

- `src/components/feature/bobblehead/edit-item-form-options.ts` - Form configuration

**Files to Modify:**

- None

**Changes:**

- Create editItemFormOptions with default values and validation logic
- Include proper field configuration for all bobblehead properties
- Set up form validation timing and error handling
- Configure photo upload and management options

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Form options provide consistent behavior
- [ ] Validation logic matches add form patterns
- [ ] All field configurations are properly typed
- [ ] All validation commands pass

---

### Step 7: Update Bobblehead Header with Functional Edit Button

**What**: Replace placeholder edit button with functional implementation that opens edit dialog
**Why**: Users need access point to edit their bobbleheads from the detail page
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header.tsx` - Add edit dialog integration

**Changes:**

- Import BobbleheadEditDialog component
- Add state management for dialog open/close
- Wire edit button to open dialog with bobblehead data
- Ensure proper prop passing and error handling
- Maintain existing header layout and styling

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Edit button opens dialog with pre-populated data
- [ ] Dialog closes properly after successful updates
- [ ] Page data refreshes after successful edits
- [ ] All validation commands pass

---

### Step 8: Add GetBobbleheadForEdit Server Action

**What**: Create server action to fetch bobblehead data specifically formatted for editing
**Why**: Edit form needs properly formatted data including photos and tags for pre-population
**Confidence**: Medium

**Files to Create:**

- None

**Files to Modify:**

- `src/lib/actions/bobbleheads/bobbleheads.actions.ts` - Add getBobbleheadForEditAction

**Changes:**

- Add getBobbleheadForEditAction with proper authorization
- Include ownership validation for edit access
- Return formatted data suitable for form population
- Include photos and tags in response structure
- Add proper error handling for unauthorized access

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Action returns properly formatted edit data
- [ ] Ownership validation prevents unauthorized access
- [ ] Photos and tags are included in response
- [ ] All validation commands pass

---

### Step 9: Implement Form Section Components for Edit

**What**: Create or adapt form section components for edit functionality with photo management
**Why**: Edit form needs all the same sections as add form but with pre-populated data handling
**Confidence**: Medium

**Files to Create:**

- `src/components/feature/bobblehead/edit-item-photos.tsx` - Photo management for edit
- `src/components/feature/bobblehead/edit-basic-information.tsx` - Basic info section
- `src/components/feature/bobblehead/edit-custom-fields.tsx` - Custom fields section

**Files to Modify:**

- None

**Changes:**

- Create specialized edit components that handle pre-populated data
- Implement photo replacement and deletion capabilities
- Add proper validation and error states for each section
- Ensure components work with existing form infrastructure
- Include proper accessibility attributes and keyboard navigation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All form sections handle pre-populated data correctly
- [ ] Photo management allows upload, replace, and delete operations
- [ ] Form validation works properly across all sections
- [ ] All validation commands pass

---

### Step 10: Add Cache Revalidation for Updates

**What**: Implement proper cache invalidation when bobbleheads are updated
**Why**: Updated data must be reflected immediately across the application
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Add bobblehead update revalidation

**Changes:**

- Add onUpdate method to CacheRevalidationService.bobbleheads
- Revalidate bobblehead detail pages and collection listings
- Include user profile cache invalidation if needed
- Add proper path generation for revalidation
- Handle subcollection cache invalidation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Updated bobbleheads reflect immediately in UI
- [ ] Collection and profile pages show updated data
- [ ] Cache revalidation handles all affected pages
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Edit functionality works for all bobblehead fields
- [ ] Photo management (upload/replace/delete) functions correctly
- [ ] Proper authorization prevents unauthorized edits
- [ ] Form validation provides clear feedback to users
- [ ] Cache invalidation ensures data consistency
- [ ] Error handling provides meaningful user feedback

## Notes

- Photo management requires careful handling of Cloudinary operations to avoid orphaned files
- Transaction support is critical to ensure data consistency during complex updates
- Form pre-population must handle all field types including custom fields and photos
- Proper authorization checks must occur at both the UI and server action levels
- Cache invalidation should be comprehensive to ensure immediate UI updates
- Consider performance implications of photo operations and implement proper loading states

## Plan Format Validation Results

### Format Check

✅ **MARKDOWN Format**: Plan generated in proper markdown format (not XML)
✅ **Template Compliance**: Includes all required sections (Overview, Prerequisites, Steps, Quality Gates)
✅ **Validation Commands**: Every step includes `npm run lint:fix && npm run typecheck` for TS/TSX files
✅ **No Code Examples**: Plan contains instructions only, no implementation code

### Template Compliance Validation

✅ **Overview Section**: Contains Duration (2-3 days), Complexity (High), Risk Level (Medium)
✅ **Quick Summary**: Concise feature description provided
✅ **Prerequisites**: 4 clear prerequisites listed with checkboxes
✅ **Implementation Steps**: 10 detailed steps with required sub-sections
✅ **Quality Gates**: Comprehensive quality checklist provided
✅ **Notes Section**: Important implementation considerations included

### Section Validation Results

✅ **Step Structure**: Each step has What/Why/Confidence/Files/Changes/Validation/Success Criteria
✅ **File Categorization**: Clear distinction between files to create vs modify
✅ **Success Criteria**: Measurable outcomes defined for each step
✅ **Confidence Levels**: Realistic confidence assessments (High/Medium) provided

## Complexity Assessment and Time Estimates

### Complexity Breakdown

- **Database Layer**: High complexity due to photo operations and transactions
- **Form Management**: Medium complexity with photo handling and validation
- **Authentication**: Medium complexity with ownership validation
- **UI Components**: Medium complexity with modal and form sections
- **Cache Management**: Low-medium complexity with proper invalidation

### Time Estimates by Category

- **Backend (Steps 1-4)**: 1.5 days - Schema, queries, facade, actions
- **Frontend (Steps 5-7, 9)**: 1-1.5 days - Dialog, form, components
- **Integration (Steps 8, 10)**: 0.5 days - Data fetching, cache revalidation
- **Total Estimated**: 2-3 days (16-24 hours)

## Quality Gate Results

### Validation Command Coverage

✅ **All TS/TSX Steps**: Include `npm run lint:fix && npm run typecheck`
✅ **Configuration Steps**: Include appropriate validation for TS files
✅ **Component Steps**: Full validation pipeline for React components
✅ **Action Steps**: Server action validation with auth and transaction checks

### Implementation Pattern Compliance

✅ **Follows Existing Patterns**: Uses established dialog-based editing approach
✅ **Authentication Standards**: Implements authActionClient with proper middleware
✅ **Form Handling**: Uses TanStack Form with Radix UI components
✅ **Database Operations**: Follows Drizzle ORM transaction patterns
✅ **Cache Strategy**: Implements comprehensive cache invalidation

### Risk Mitigation Strategies

✅ **Photo Management**: Careful Cloudinary operation handling to prevent orphaned files
✅ **Transaction Support**: Database consistency through proper transaction management
✅ **Authorization**: Multi-layer authorization checks (UI + server actions)
✅ **Error Handling**: Comprehensive error handling with user feedback
✅ **Performance**: Loading states and proper cache invalidation for responsiveness
