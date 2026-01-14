# Add/Edit Bobblehead Form Implementation Plan

**Generated**: 2026-01-13
**Original Request**: Add/Edit Bobblehead Form with TanStack Form and Next-Safe-Action
**Refined Request**: The Add/Edit Bobblehead Form is a dual-mode form component built with TanStack React Form and integrated with Next-Safe-Action server actions, located within the user dashboard collection management interface at the appropriate route under src/app/(app)/. The form supports both creation of new bobbleheads and modification of existing entries, with the edit mode pre-populating all fields from the existing record.

---

## Analysis Summary

- Feature request refined with project context
- Discovered 25+ files across 15 directories
- Generated 9-step implementation plan
- Key finding: Server actions, validation schemas, and facades already exist

---

## File Discovery Results

### Files to CREATE:
1. `src/components/feature/bobblehead/bobblehead-upsert-form.types.ts` - Type definitions
2. `src/components/feature/bobblehead/hooks/use-bobblehead-upsert-form.ts` - Form state hook
3. `src/components/feature/bobblehead/bobblehead-form-fields.tsx` - Form fields component
4. `src/components/feature/bobblehead/custom-fields-section.tsx` - Dynamic key-value fields
5. `src/components/feature/bobblehead/bobblehead-upsert-form.tsx` - Main form component

### Files to MODIFY:
1. `src/app/(app)/user/[username]/dashboard/collection/components/async/add-bobblehead-form-async.tsx`
2. `src/app/(app)/user/[username]/dashboard/collection/components/async/edit-bobblehead-form-async.tsx`

### Existing Infrastructure (NO changes):
- Validation schemas, server actions, facades are complete

---

## Implementation Plan

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

Implement a dual-mode Add/Edit Bobblehead form component using TanStack React Form with the existing useAppForm hook, integrated with the already-implemented server actions (createBobbleheadWithPhotosAction, updateBobbleheadWithPhotosAction). The form will support both creation and editing modes, with comprehensive field validation, photo management via the existing CloudinaryPhotoUpload component, and proper integration with the form system's focus management for accessibility.

## Prerequisites

- [ ] Existing server actions (createBobbleheadWithPhotosAction, updateBobbleheadWithPhotosAction) are functional and tested
- [ ] Existing validation schemas (createBobbleheadWithPhotosSchema, updateBobbleheadWithPhotosSchema) are complete
- [ ] BobbleheadsDashboardFacade methods (getUserCollectionSelectorsAsync, getBobbleheadForEditAsync) are working
- [ ] CloudinaryPhotoUpload component is operational
- [ ] Form system components (useAppForm, TextField, TextareaField, SelectField, SwitchField, ComboboxField) are available

## Implementation Steps

### Step 1: Create the Bobblehead Upsert Form Types

**What**: Create a dedicated types file to define the form's data structures and interfaces.
**Why**: Establishes type safety for form state, props, and the bobblehead data shapes used across form components.
**Confidence**: High

**Files to Create:**

- `src/components/feature/bobblehead/bobblehead-upsert-form.types.ts` - Type definitions for form props, bobblehead data, and collection selectors

**Changes:**

- Define BobbleheadForUpsert type for edit mode data (existing bobblehead with tags and photos)
- Define CollectionSelectorItem interface matching existing CollectionSelectorRecord
- Define form value types for create and update modes
- Export type for custom field key-value pairs

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Types file compiles without errors
- [ ] Types properly extend/reference existing validation schema types
- [ ] All validation commands pass

---

### Step 2: Create the Custom Hook for Form State Management

**What**: Create useBobbleheadUpsertForm hook following the pattern from useCollectionUpsertForm.
**Why**: Centralizes form state management, action selection based on mode, photo state handling, and UI labels in a reusable hook.
**Confidence**: High

**Files to Create:**

- `src/components/feature/bobblehead/hooks/use-bobblehead-upsert-form.ts` - Custom hook managing dual-mode form logic

**Changes:**

- Implement mode detection (isEditMode) based on bobblehead prop presence
- Set up useServerAction hook with appropriate action (create or update) based on mode
- Build default values from existing bobblehead data or DEFAULTS constants
- Manage photo array state separately (useState for photos array)
- Integrate with useFocusContext for error focus management
- Implement useAppForm with proper validation schema selection
- Handle form submission with photo data merge
- Provide UI labels object based on mode
- Return form instance, photo handlers, mode flags, and labels

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Hook compiles and exports correctly
- [ ] Follows useCollectionUpsertForm pattern
- [ ] Properly switches between create/update actions based on mode
- [ ] All validation commands pass

---

### Step 3: Create the Form Fields Component

**What**: Create BobbleheadFormFields component that renders all form field groups using the form system's field components.
**Why**: Separates field rendering logic from form container, making the component more maintainable and testable.
**Confidence**: High

**Files to Create:**

- `src/components/feature/bobblehead/bobblehead-form-fields.tsx` - Client component with organized form field groups

**Changes:**

- Accept form instance, photos state, and handlers as props
- Render Basic Information section (Name TextField, Collection ComboboxField with create new capability, Character Name, Description TextareaField, Category, Series, Year)
- Render Photos section using CloudinaryPhotoUpload component with photos and onPhotosChange props
- Render Acquisition Details section (Acquisition Date, Method, Purchase Location, Purchase Price)
- Render Physical Attributes section (Height, Weight, Material, Manufacturer, Condition SelectField)
- Render Custom Fields section with dynamic key-value pair management (add/remove buttons)
- Render Item Settings section (Status SelectField, Is Public SwitchField, Is Featured SwitchField)
- Apply proper styling and grouping with Card components for visual organization
- Generate test IDs using testIdPrefix prop

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All field groups render correctly
- [ ] Field components properly integrate with form instance via form.AppField
- [ ] Custom fields array supports dynamic add/remove operations
- [ ] CloudinaryPhotoUpload receives correct props
- [ ] All validation commands pass

---

### Step 4: Create the Custom Fields Subcomponent

**What**: Create a dedicated component for managing the dynamic custom fields array (key-value pairs).
**Why**: Custom fields logic is complex enough to warrant isolation, and this pattern makes the form fields component cleaner.
**Confidence**: High

**Files to Create:**

- `src/components/feature/bobblehead/custom-fields-section.tsx` - Client component for dynamic key-value pair management

**Changes:**

- Accept form instance for accessing the customFields field
- Render existing key-value pairs with TextField inputs for key and value
- Implement add new pair button functionality
- Implement remove pair button functionality with confirmation for pairs with data
- Apply proper styling with Button, Input components
- Handle empty state with helpful message
- Generate test IDs for each dynamic field

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Add/remove functionality works correctly
- [ ] Key-value pairs sync with form state
- [ ] Proper accessibility with labels and aria attributes
- [ ] All validation commands pass

---

### Step 5: Create the Main Bobblehead Upsert Form Component

**What**: Create the main BobbleheadUpsertForm client component that orchestrates the form UI.
**Why**: Provides the unified form interface that integrates hook, fields, and submission handling with proper layout.
**Confidence**: High

**Files to Create:**

- `src/components/feature/bobblehead/bobblehead-upsert-form.tsx` - Main client component wrapping form with focus management

**Changes:**

- Accept bobblehead prop for edit mode, collections prop for selector data, and callback props (onSuccess, onCancel)
- Use withFocusManagement HOC to wrap component
- Initialize useBobbleheadUpsertForm hook with appropriate options
- Render form wrapper with onSubmit calling form.handleSubmit
- Render form.AppForm provider context
- Include header section with dynamic title/description from labels
- Render BobbleheadFormFields within the form
- Render footer with Cancel button and form.SubmitButton
- Conditionally render delete button in edit mode (if needed in future)
- Apply Card/section styling consistent with project patterns
- Generate test IDs with mode-aware prefixes

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Form renders in both create and edit modes
- [ ] Form submission triggers appropriate action
- [ ] Cancel button calls onCancel callback
- [ ] Focus management works for validation errors
- [ ] All validation commands pass

---

### Step 6: Update Add Bobblehead Form Async Server Component

**What**: Complete the stub implementation in add-bobblehead-form-async.tsx to render the form.
**Why**: Connects the server-side data fetching with the client-side form component for the add bobblehead flow.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/user/[username]/dashboard/collection/components/async/add-bobblehead-form-async.tsx` - Server component that provides data to the form

**Changes:**

- Keep existing userId and userCollections data fetching
- Import BobbleheadUpsertForm component
- Render BobbleheadUpsertForm with collections prop passing userCollections
- Pass optional preselected collectionId based on collectionSlug URL parameter
- Handle empty collections case with helpful message and link to create collection

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Server component properly fetches user collections
- [ ] Client form component receives collections data
- [ ] Preselection works when collectionSlug is present
- [ ] Empty collections state handled gracefully
- [ ] All validation commands pass

---

### Step 7: Update Edit Bobblehead Form Async Server Component

**What**: Complete the stub implementation in edit-bobblehead-form-async.tsx to render the form in edit mode.
**Why**: Connects the server-side bobblehead data fetching with the client-side form for the edit flow.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/user/[username]/dashboard/collection/components/async/edit-bobblehead-form-async.tsx` - Server component for edit mode

**Changes:**

- Keep existing userId, bobbleheadId fetching and error handling
- Keep existing parallel data fetch for bobblehead and userCollections
- Import BobbleheadUpsertForm component
- Render BobbleheadUpsertForm with bobblehead prop (for edit mode) and collections prop
- Ensure proper type transformation from BobbleheadForEdit to form-compatible type

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Edit mode properly pre-fills all form fields
- [ ] Existing photos are loaded and displayed
- [ ] Tags are properly loaded
- [ ] Collection selector shows current collection as selected
- [ ] All validation commands pass

---

### Step 8: Add Form Integration Tests Foundation

**What**: Create test utilities and a basic integration test setup for the bobblehead upsert form.
**Why**: Ensures form behavior is testable and establishes patterns for future test expansion.
**Confidence**: Medium

**Files to Create:**

- `tests/components/feature/bobblehead/bobblehead-upsert-form.test.tsx` - Integration tests for form component

**Changes:**

- Set up test file with proper imports and mocks for Clerk auth
- Create mock data for collections, bobblehead (edit mode)
- Mock the server actions (createBobbleheadWithPhotosAction, updateBobbleheadWithPhotosAction)
- Test form renders in create mode with empty fields
- Test form renders in edit mode with pre-filled fields
- Test required field validation (Name field)
- Test form submission calls correct action based on mode

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Test file compiles without errors
- [ ] Basic render tests pass
- [ ] Validation test patterns established
- [ ] All validation commands pass

---

### Step 9: Verify End-to-End Integration

**What**: Manual verification of the complete form flow in both modes.
**Why**: Ensures all components work together correctly in the actual application context.
**Confidence**: High

**Files to Modify:**

- No file modifications - verification step

**Changes:**

- Navigate to dashboard collection page
- Test add bobblehead form flow (all field groups, photo upload, submission)
- Test edit bobblehead form flow (pre-population, modification, submission)
- Verify form validation errors display correctly and focus management works
- Verify toast notifications appear on success/error
- Verify URL state and navigation after successful operations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**

- [ ] Add form submits successfully and creates bobblehead
- [ ] Edit form loads existing data and updates correctly
- [ ] Photo upload and management works in both modes
- [ ] Custom fields add/remove functions properly
- [ ] Validation errors display correctly
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] All existing tests continue to pass
- [ ] Form renders without console errors in browser
- [ ] Form is accessible (keyboard navigation, screen reader compatible)
- [ ] Photo upload component integrates correctly with form submission

## Notes

**Architectural Decisions:**

- **Separate custom fields component**: Custom fields management is isolated to reduce complexity in the main form fields component
- **Photo state managed in hook**: Photos are managed separately from form state (via useState) because CloudinaryPhotoUpload handles its own complex upload states and the photos only need to be merged at submission time
- **withFocusManagement HOC**: Applied at the form component level following the collection form pattern to enable automatic focus on first validation error

**Key Integration Points:**

- The form integrates with existing server actions - no backend changes needed
- Uses existing validation schemas - no schema changes needed
- Uses existing CloudinaryPhotoUpload component - no upload component changes needed
- Uses existing useServerAction hook for action execution with toast handling

**Assumptions Requiring Confirmation:**

- Collection creation from within the form will use the existing CollectionUpsertDialog as a modal
- The form layout will be a full-page form (not a dialog) since there are many fields
- Tags will use the existing TagField component (not covered in detail but available in the form system)
