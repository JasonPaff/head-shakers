# Step 1: Feature Refinement

## Step Metadata

- **Step**: 1 - Feature Refinement
- **Start Time**: 2025-01-26T00:00:00.000Z
- **End Time**: 2025-01-26T00:00:30.000Z
- **Duration**: ~30 seconds
- **Status**: Completed

## Original Request

The delete collection dialogs in the app should force the user to type in the name of the collection, matching it exactly, before they can delete the collection.

## Context Provided

- **Project**: Head Shakers - Bobblehead Collection Platform
- **Framework**: Next.js 16 with App Router, React 19, TypeScript
- **UI Library**: Radix UI dialogs
- **Validation**: Zod, drizzle-zod
- **Forms**: TanStack React Form
- **Server Actions**: next-safe-action

## Agent Prompt Sent

```
Refine this feature request into a SINGLE PARAGRAPH (no headers, bullet points, or sections): 'The delete collection dialogs in the app should force the user to type in the name of the collection, matching it exactly, before they can delete the collection.'

Using the project context from CLAUDE.md (Next.js 16 with App Router, React 19, TypeScript, Radix UI dialogs, Zod validation, next-safe-action server actions, TanStack React Form) and package.json dependencies, expand this request with relevant technical details while maintaining its core intent.

Project is a bobblehead collection platform called "Head Shakers" where users can organize collections and subcollections.

Output ONLY the refined paragraph (200-500 words), nothing else. Do not use headers, sections, or bullet points.
```

## Full Agent Response

The delete collection dialogs in the Head Shakers bobblehead collection platform should be enhanced to require users to type in the exact name of the collection or subcollection before deletion can proceed, implementing a confirmation pattern similar to GitHub's repository deletion flow. The current ConfirmDeleteAlertDialog component at C:\Users\JasonPaff\dev\head-shakers\src\components\ui\alert-dialogs\confirm-delete-alert-dialog.tsx, which is used by both CollectionDelete and SubcollectionDelete components, should be extended to accept an optional confirmationText prop that, when provided, renders a TextField component using TanStack React Form's useAppForm hook with real-time validation through Zod schema matching. The validation schema should use Zod's refine method to perform case-sensitive exact string matching against the provided collection or subcollection name (pulled from the collections.name or subCollections.name varchar fields defined in the Drizzle ORM schema at C:\Users\JasonPaff\dev\head-shakers\src\lib\db\schema\collections.schema.ts, which have maximum lengths defined by SCHEMA_LIMITS constants). The AlertDialogAction delete button should remain disabled until the input value exactly matches the collection name, with the validation state managed through the form's field-level validation that updates in real-time as the user types. The dialog should display clear instructional text above the input field informing users to "Type the collection name to confirm deletion" along with the actual collection name displayed in a monospace font or code block style for clarity, and the existing Alert component with variant error should remain to emphasize the irreversible nature of the action. Both CollectionDelete and SubcollectionDelete components should pass the respective collection or subcollection name to the enhanced ConfirmDeleteAlertDialog, and the TextField component should use the project's established focus management system with useFocusContext and withFocusManagement HOC to ensure keyboard accessibility. The implementation should follow the project's established patterns of using next-safe-action for the server-side deleteCollectionAction and deleteSubCollectionAction, maintaining the existing toast notification patterns through useServerAction hook, and ensuring type safety throughout with TypeScript and the validation schemas generated from Drizzle schemas using drizzle-zod. This confirmation mechanism should prevent accidental deletions of collections and subcollections which can contain multiple bobbleheads and represent significant user investment in cataloging their collections.

## Refined Feature Request

The delete collection dialogs in the Head Shakers bobblehead collection platform should be enhanced to require users to type in the exact name of the collection or subcollection before deletion can proceed, implementing a confirmation pattern similar to GitHub's repository deletion flow. The current ConfirmDeleteAlertDialog component at C:\Users\JasonPaff\dev\head-shakers\src\components\ui\alert-dialogs\confirm-delete-alert-dialog.tsx, which is used by both CollectionDelete and SubcollectionDelete components, should be extended to accept an optional confirmationText prop that, when provided, renders a TextField component using TanStack React Form's useAppForm hook with real-time validation through Zod schema matching. The validation schema should use Zod's refine method to perform case-sensitive exact string matching against the provided collection or subcollection name (pulled from the collections.name or subCollections.name varchar fields defined in the Drizzle ORM schema at C:\Users\JasonPaff\dev\head-shakers\src\lib\db\schema\collections.schema.ts, which have maximum lengths defined by SCHEMA_LIMITS constants). The AlertDialogAction delete button should remain disabled until the input value exactly matches the collection name, with the validation state managed through the form's field-level validation that updates in real-time as the user types. The dialog should display clear instructional text above the input field informing users to "Type the collection name to confirm deletion" along with the actual collection name displayed in a monospace font or code block style for clarity, and the existing Alert component with variant error should remain to emphasize the irreversible nature of the action. Both CollectionDelete and SubcollectionDelete components should pass the respective collection or subcollection name to the enhanced ConfirmDeleteAlertDialog, and the TextField component should use the project's established focus management system with useFocusContext and withFocusManagement HOC to ensure keyboard accessibility. The implementation should follow the project's established patterns of using next-safe-action for the server-side deleteCollectionAction and deleteSubCollectionAction, maintaining the existing toast notification patterns through useServerAction hook, and ensuring type safety throughout with TypeScript and the validation schemas generated from Drizzle schemas using drizzle-zod. This confirmation mechanism should prevent accidental deletions of collections and subcollections which can contain multiple bobbleheads and represent significant user investment in cataloging their collections.

## Length Analysis

- **Original Word Count**: 36
- **Refined Word Count**: ~430
- **Expansion Factor**: ~12x (exceeds 2-4x guideline but provides comprehensive technical context)

## Scope Analysis

- **Core Intent Preserved**: Yes - Requires exact name typing before deletion
- **Feature Scope**: Maintained - No additional features added beyond the confirmation mechanism
- **Technical Context Added**: Yes - Specific files, components, and patterns identified

## Validation Results

- Format Check: PASS (single paragraph)
- Length Check: PASS (within 200-500 words)
- Intent Preservation: PASS
- Technical Context: Comprehensive
