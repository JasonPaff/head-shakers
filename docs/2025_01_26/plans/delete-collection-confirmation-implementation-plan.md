# Implementation Plan: Enhanced Delete Confirmation with Name Typing

Generated: 2025-01-26
Original Request: The delete collection dialogs in the app should force the user to type in the name of the collection, matching it exactly, before they can delete the collection.

## Analysis Summary

- Feature request refined with project context
- Discovered 23 files across 4 priority levels
- Generated 11-step implementation plan

## Overview

**Estimated Duration**: 4-6 hours
**Complexity**: Medium
**Risk Level**: Medium

## Quick Summary

Enhance the delete collection and subcollection dialogs to require users to type the exact name of the item before deletion can proceed, implementing a GitHub-style confirmation pattern. This adds an extra safety layer to prevent accidental deletions by requiring explicit name confirmation through real-time validated text input.

## Prerequisites

- [ ] Verify Node.js and npm are properly configured
- [ ] Ensure development environment is running
- [ ] Confirm TanStack React Form and Zod are available in the project

## Implementation Steps

### Step 1: Create Confirmation Validation Schema

**What**: Add a reusable Zod validation schema creator for name confirmation validation
**Why**: Centralize the exact string matching logic for reusability across collections and subcollections
**Confidence**: High

**Files to Create:**

- `src/lib/validations/confirmation.validation.ts` - Validation schema for name confirmation

**Changes:**

- Create a `createConfirmationSchema` function that accepts a target string and returns a Zod schema
- Use Zod's refine method for case-sensitive exact string matching
- Include clear error messages indicating the exact name must be typed
- Export TypeScript type inference for the schema

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Schema file created with proper TypeScript types
- [ ] Validation function accepts target string parameter
- [ ] Exact case-sensitive matching logic implemented
- [ ] All validation commands pass

---

### Step 2: Extend ConfirmDeleteAlertDialog Component

**What**: Add optional confirmationText prop and integrate TextField with real-time validation
**Why**: Enable the base alert dialog to support name confirmation when needed while maintaining backward compatibility
**Confidence**: High

**Files to Modify:**

- `src/components/ui/alert-dialogs/confirm-delete-alert-dialog.tsx` - Add confirmation text input functionality

**Changes:**

- Add optional `confirmationText` prop to `ConfirmDeleteAlertDialogProps` type
- Import useAppForm hook and TextField component
- Create conditional form setup when confirmationText is provided
- Add confirmation schema using the validation from Step 1
- Integrate TextField with proper styling above the existing description
- Add instructional text displaying the exact name to type
- Update AlertDialogAction button to remain disabled until confirmation matches
- Maintain existing behavior when confirmationText is not provided

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Optional confirmationText prop added to component interface
- [ ] Form integration with useAppForm when confirmation required
- [ ] TextField renders with clear instructional text
- [ ] Delete button disabled state controlled by validation
- [ ] Backward compatibility maintained for existing usage
- [ ] All validation commands pass

---

### Step 3: Update CollectionDelete Component

**What**: Pass collection name to ConfirmDeleteAlertDialog
**Why**: Enable name confirmation for collection deletions
**Confidence**: Medium

**Files to Modify:**

- `src/components/feature/collections/collection-delete.tsx` - Add collectionName prop and pass to dialog

**Changes:**

- Add `collectionName` prop to `CollectionDeleteProps` type
- Pass confirmationText prop to ConfirmDeleteAlertDialog with collection name
- Update component documentation if present

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] CollectionDelete accepts collectionName prop
- [ ] confirmationText correctly passed to dialog
- [ ] Component compiles without errors
- [ ] All validation commands pass

---

### Step 4: Update CollectionDelete Usage in Collection Sticky Header

**What**: Pass collection name to CollectionDelete component
**Why**: Provide the required collection name for confirmation validation
**Confidence**: High

**Files to Modify:**

- `src/components/feature/collection/collection-sticky-header.tsx` - Add collectionName prop to CollectionDelete

**Changes:**

- Add collectionName prop to CollectionDelete component usage
- Use title prop value as the collection name

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] collectionName prop added to CollectionDelete usage
- [ ] Correct name value passed from available props
- [ ] All validation commands pass

---

### Step 5: Update CollectionDelete Usage in Collection Header

**What**: Pass collection name to CollectionDelete component
**Why**: Provide the required collection name for confirmation validation
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-header.tsx` - Add collectionName prop to CollectionDelete

**Changes:**

- Add collectionName prop to CollectionDelete component usage
- Use collection.name as the value

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] collectionName prop added to CollectionDelete usage
- [ ] Correct name value passed from collection object
- [ ] All validation commands pass

---

### Step 6: Update CollectionActions Component

**What**: Pass collection name to ConfirmDeleteAlertDialog
**Why**: Enable name confirmation for collection deletions from the actions menu
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/dashboard/collection/(collection)/components/collection-actions.tsx` - Add confirmationText prop to dialog

**Changes:**

- Add confirmationText prop to ConfirmDeleteAlertDialog component usage
- Pass collection.name as the confirmation text value

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] confirmationText prop added to ConfirmDeleteAlertDialog usage
- [ ] Correct collection name passed from collection object
- [ ] All validation commands pass

---

### Step 7: Update SubcollectionDelete Component

**What**: Pass subcollection name to ConfirmDeleteAlertDialog
**Why**: Enable name confirmation for subcollection deletions
**Confidence**: Medium

**Files to Modify:**

- `src/components/feature/subcollections/subcollection-delete.tsx` - Add subcollectionName prop and pass to dialog

**Changes:**

- Add `subcollectionName` prop to `SubcollectionDeleteProps` type
- Pass confirmationText prop to ConfirmDeleteAlertDialog with subcollection name

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] SubcollectionDelete accepts subcollectionName prop
- [ ] confirmationText correctly passed to dialog
- [ ] All validation commands pass

---

### Step 8: Update SubcollectionDeleteDialog Component

**What**: Pass subcollection name to ConfirmDeleteAlertDialog
**Why**: Enable name confirmation for subcollection deletions from standalone dialog
**Confidence**: Medium

**Files to Modify:**

- `src/components/feature/subcollections/subcollection-delete-dialog.tsx` - Add subcollectionName prop and pass to dialog

**Changes:**

- Add `subcollectionName` prop to `SubcollectionDeleteDialogProps` interface
- Pass confirmationText prop to ConfirmDeleteAlertDialog with subcollection name

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] SubcollectionDeleteDialog accepts subcollectionName prop
- [ ] confirmationText correctly passed to dialog
- [ ] All validation commands pass

---

### Step 9: Update SubcollectionActions Component

**What**: Pass subcollection name to SubcollectionDeleteDialog
**Why**: Provide the required subcollection name for confirmation validation
**Confidence**: High

**Files to Modify:**

- `src/components/feature/subcollections/subcollection-actions.tsx` - Add subcollectionName prop to dialog

**Changes:**

- Add subcollectionName prop to SubcollectionDeleteDialog component usage
- Use subcollection.name as the value

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] subcollectionName prop added to SubcollectionDeleteDialog usage
- [ ] Correct name value passed from subcollection object
- [ ] All validation commands pass

---

### Step 10: Find and Update All SubcollectionDelete Usages

**What**: Locate all usages of SubcollectionDelete component and add subcollectionName prop
**Why**: Ensure all subcollection deletion points include name confirmation
**Confidence**: Medium

**Files to Modify:**

- All files that use SubcollectionDelete component identified through grep search

**Changes:**

- Search codebase for SubcollectionDelete component usage
- Add subcollectionName prop to each usage
- Ensure correct subcollection name is available in context

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All SubcollectionDelete usages identified
- [ ] subcollectionName prop added to each usage
- [ ] All validation commands pass

---

### Step 11: Comprehensive Testing and Validation

**What**: Test all delete dialogs with name confirmation in both collections and subcollections
**Why**: Ensure the feature works correctly across all use cases and handles edge cases
**Confidence**: High

**Files to Modify:**

- None - manual testing step

**Changes:**

- Test collection deletion from dashboard with name confirmation
- Test collection deletion from collection page with name confirmation
- Test subcollection deletion from various contexts with name confirmation
- Test that mistyped names prevent deletion
- Test that exact names enable deletion
- Verify case sensitivity works correctly
- Test that clearing input disables delete button
- Verify form resets properly on dialog close

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run build
```

**Success Criteria:**

- [ ] Collection delete requires exact name typing
- [ ] Subcollection delete requires exact name typing
- [ ] Delete button stays disabled until exact match
- [ ] Case-sensitive validation works correctly
- [ ] Form validation provides clear feedback
- [ ] All validation commands pass
- [ ] Build succeeds without errors

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Application builds successfully with `npm run build`
- [ ] All delete dialogs require name confirmation
- [ ] Backward compatibility maintained for non-collection/subcollection delete dialogs
- [ ] Real-time validation working correctly
- [ ] Delete button disabled state controlled by validation

## Notes

**Architecture Decisions:**

- Created a reusable confirmation validation schema rather than duplicating validation logic across components
- Made confirmationText prop optional to maintain backward compatibility with other delete dialogs in the codebase
- Used exact case-sensitive matching for maximum safety
- Leveraged existing TanStack React Form infrastructure for consistent form handling

**Edge Cases Considered:**

- Collections or subcollections with special characters in names
- Very long collection names and how they display in the confirmation UI
- What happens if collection name is null or undefined
- Form state management when dialog is closed without deletion
- Handling of leading/trailing whitespace in user input (trim handled by Zod)

**Risk Mitigation:**

- Optional prop ensures existing delete dialogs remain functional
- TypeScript compilation will catch any missing prop updates
- Real-time validation prevents accidental deletions
- Clear instructional text reduces user confusion

**Assumptions Requiring Verification:**

- Collection and subcollection names are always available at delete dialog invocation points
- Collection names cannot be empty strings
- Maximum collection name length is reasonable for dialog display

**Future Enhancements:**

- Consider adding copy-to-clipboard button for collection name
- Could add character count indicator for very long names
- May want to add tests for the confirmation validation schema
- Consider i18n support for instructional text

## File Discovery Results

### Critical Priority (Must Modify)

| File                                                                                | Purpose                                           |
| ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| `src/components/ui/alert-dialogs/confirm-delete-alert-dialog.tsx`                   | Core dialog component - add confirmationText prop |
| `src/components/feature/collections/collection-delete.tsx`                          | Collection delete - pass name to dialog           |
| `src/components/feature/subcollections/subcollection-delete.tsx`                    | Subcollection delete - pass name to dialog        |
| `src/components/feature/subcollections/subcollection-delete-dialog.tsx`             | Subcollection dialog - pass name                  |
| `src/app/(app)/dashboard/collection/(collection)/components/collection-actions.tsx` | Dashboard actions - pass collection.name          |
| `src/components/feature/subcollections/subcollection-actions.tsx`                   | Subcollection actions - pass subcollection.name   |

### High Priority (Integration)

| File                                                     | Purpose                       |
| -------------------------------------------------------- | ----------------------------- |
| `src/components/ui/form/field-components/text-field.tsx` | TextField component for input |
| `src/components/ui/form/index.tsx`                       | useAppForm hook               |
| `src/lib/validations/collections.validation.ts`          | Validation patterns reference |
| `src/lib/utils/zod.utils.ts`                             | Zod refine patterns           |

### Pattern Reference

| File                                                                  | Purpose                           |
| --------------------------------------------------------------------- | --------------------------------- |
| `src/components/feature/subcollections/subcollection-edit-dialog.tsx` | Form validation in dialog example |
| `src/components/feature/collections/collection-edit-dialog.tsx`       | Dialog form patterns              |
