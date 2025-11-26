# Step 2: File Discovery

## Step Metadata

- **Step**: 2 - File Discovery
- **Start Time**: 2025-01-26T00:00:30.000Z
- **End Time**: 2025-01-26T00:01:30.000Z
- **Duration**: ~60 seconds
- **Status**: Completed

## Input: Refined Feature Request

The delete collection dialogs in the Head Shakers bobblehead collection platform should be enhanced to require users to type in the exact name of the collection or subcollection before deletion can proceed, implementing a confirmation pattern similar to GitHub's repository deletion flow. The current ConfirmDeleteAlertDialog component should be extended to accept an optional confirmationText prop that, when provided, renders a TextField component using TanStack React Form's useAppForm hook with real-time validation through Zod schema matching.

## Agent Prompt Sent

```
Find all files relevant to implementing a feature that requires users to type the exact collection name before deleting a collection or subcollection.

Feature Context:
[Full refined feature request provided]

Search for:
1. The ConfirmDeleteAlertDialog component and any related alert dialog components
2. Collection and Subcollection delete components (CollectionDelete, SubcollectionDelete)
3. Form components (TextField, form hooks, validation patterns)
4. Zod validation schemas for collections
5. Server actions for deleting collections
6. Any existing name confirmation patterns in the codebase

Categorize discovered files by priority:
- Critical: Files that MUST be modified
- High: Files that will likely need changes
- Medium: Files for reference/patterns
- Low: Context/related files
```

## Discovered Files Summary

### Critical Priority (6 files)

| File | Path | Required Changes |
|------|------|-----------------|
| ConfirmDeleteAlertDialog | `src/components/ui/alert-dialogs/confirm-delete-alert-dialog.tsx` | Add confirmationText prop, integrate TextField with validation |
| CollectionDelete | `src/components/feature/collections/collection-delete.tsx` | Pass collection name to dialog |
| SubcollectionDelete | `src/components/feature/subcollections/subcollection-delete.tsx` | Pass subcollection name to dialog |
| SubcollectionDeleteDialog | `src/components/feature/subcollections/subcollection-delete-dialog.tsx` | Pass subcollection name to dialog |
| CollectionActions | `src/app/(app)/dashboard/collection/(collection)/components/collection-actions.tsx` | Pass collection.name to dialog |
| SubcollectionActions | `src/components/feature/subcollections/subcollection-actions.tsx` | Pass subcollection.name to dialog |

### High Priority (8 files)

| File | Path | Purpose |
|------|------|---------|
| TextField | `src/components/ui/form/field-components/text-field.tsx` | Form field component for name input |
| Form Index | `src/components/ui/form/index.tsx` | useAppForm hook export |
| Collections Validation | `src/lib/validations/collections.validation.ts` | May add confirmation schema |
| Subcollections Validation | `src/lib/validations/subcollections.validation.ts` | May add confirmation schema |
| Zod Utils | `src/lib/utils/zod.utils.ts` | Reference for refine patterns |
| Input | `src/components/ui/input.tsx` | Base input component |
| Label | `src/components/ui/label.tsx` | Label component |
| AlertDialog | `src/components/ui/alert-dialog.tsx` | Base Radix primitives |

### Medium Priority (4 files)

| File | Path | Purpose |
|------|------|---------|
| SubcollectionEditDialog | `src/components/feature/subcollections/subcollection-edit-dialog.tsx` | Pattern reference for form validation |
| CollectionEditDialog | `src/components/feature/collections/collection-edit-dialog.tsx` | Pattern reference for dialog forms |
| Collections Actions | `src/lib/actions/collections/collections.actions.ts` | Server action (no changes needed) |
| Subcollections Actions | `src/lib/actions/collections/subcollections.actions.ts` | Server action (no changes needed) |

### Low Priority (5 files)

| File | Path | Purpose |
|------|------|---------|
| Collections Schema | `src/lib/db/schema/collections.schema.ts` | Database schema reference |
| BobbleheadDelete | `src/components/feature/bobblehead/bobblehead-delete.tsx` | Similar pattern reference |
| BobbleheadDeleteDialog | `src/components/feature/bobblehead/bobblehead-delete-dialog.tsx` | Similar pattern reference |
| Collections Facade | `src/lib/facades/collections/collections.facade.ts` | Backend context |
| Subcollections Facade | `src/lib/facades/collections/subcollections.facade.ts` | Backend context |

## Discovery Statistics

- **Total Files Discovered**: 23
- **Critical Files**: 6
- **High Priority Files**: 8
- **Medium Priority Files**: 4
- **Low Priority Files**: 5
- **Directories Explored**: 15+

## Key Architecture Insights

### Existing Patterns

1. **Form Validation Pattern**: TanStack React Form with useAppForm hook and Zod schemas
2. **Real-time Validation**: `revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' })`
3. **Dialog Composition**: All delete operations use shared `ConfirmDeleteAlertDialog`
4. **Action Pattern**: Server actions use next-safe-action with sanitized input validation

### Integration Points

1. ConfirmDeleteAlertDialog Enhancement: Add optional `confirmationText` prop (non-breaking)
2. Form Integration: Use existing TextField with useAppForm for inline validation
3. Validation Strategy: Zod's `refine` method for case-sensitive exact string matching
4. Button State: AlertDialogAction disabled state controlled by form validation

### Challenges Identified

- CollectionDelete and SubcollectionDelete components currently only receive IDs, not names
- May need to pass name from parent or fetch it

## File Path Validation

All discovered file paths validated against codebase structure - all files exist and are accessible.
