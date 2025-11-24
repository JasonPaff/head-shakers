# Setup and Step-Type Detection

**Setup Start**: 2025-11-24
**Duration**: <1 minute

## Extracted Implementation Steps

Total steps identified: 10

### Step 1: Extend Route Types and Search Parameters

- **Files**: route-type.ts
- **Primary Domain**: TypeScript types (general-purpose)
- **Detected Specialist**: general-purpose

### Step 2: Update Query Layer for Subcollection Filtering

- **Files**: collections.query.ts
- **Primary Domain**: Database queries (src/lib/queries/)
- **Detected Specialist**: database-specialist
- **Skills to Load**: database-schema, drizzle-orm, validation-schemas

### Step 3: Extend Facade Layer with Subcollection Filtering Support

- **Files**: collections.facade.ts
- **Primary Domain**: Business logic (src/lib/facades/)
- **Detected Specialist**: facade-specialist
- **Skills to Load**: facade-layer, caching, sentry-monitoring, drizzle-orm

### Step 4: Create Subcollection Selector Component

- **Files**: collection-subcollection-filter.tsx (new .tsx file)
- **Primary Domain**: React components
- **Detected Specialist**: react-component-specialist
- **Skills to Load**: react-coding-conventions, ui-components

### Step 5: Integrate Nuqs State Management in Controls Component

- **Files**: collection-bobblehead-controls.tsx (form/state management)
- **Primary Domain**: Form state management
- **Detected Specialist**: form-specialist
- **Skills to Load**: form-system, react-coding-conventions, validation-schemas, server-actions

### Step 6: Update Server Component Data Fetching

- **Files**: collection-bobbleheads.tsx (server component)
- **Primary Domain**: React components
- **Detected Specialist**: react-component-specialist
- **Skills to Load**: react-coding-conventions, ui-components

### Step 7: Pass Subcollection Data to Client Components

- **Files**: page.tsx, collection-bobblehead-controls.tsx
- **Primary Domain**: React components
- **Detected Specialist**: react-component-specialist
- **Skills to Load**: react-coding-conventions, ui-components
- **Note**: Multi-domain (also involves data fetching)

### Step 8: Update Validation Schemas

- **Files**: collections.validation.ts
- **Primary Domain**: Validation (src/lib/validations/)
- **Detected Specialist**: validation-specialist
- **Skills to Load**: validation-schemas

### Step 9: Handle Filter State Coordination Logic

- **Files**: collection-bobblehead-controls.tsx (state coordination)
- **Primary Domain**: Form state management
- **Detected Specialist**: form-specialist
- **Skills to Load**: form-system, react-coding-conventions, validation-schemas, server-actions

### Step 10: Add Visual Feedback and Empty States

- **Files**: collection-subcollection-filter.tsx, collection-bobbleheads.tsx
- **Primary Domain**: React components
- **Detected Specialist**: react-component-specialist
- **Skills to Load**: react-coding-conventions, ui-components

## Specialist Routing Summary

| Specialist                 | Steps Assigned    | Count |
| -------------------------- | ----------------- | ----- |
| general-purpose            | Step 1            | 1     |
| database-specialist        | Step 2            | 1     |
| facade-specialist          | Step 3            | 1     |
| react-component-specialist | Steps 4, 6, 7, 10 | 4     |
| form-specialist            | Steps 5, 9        | 2     |
| validation-specialist      | Step 8            | 1     |

## Todo List Created

✓ Created 14 todos:

- 1 for Phase 1 (completed)
- 1 for Phase 2 (in progress)
- 10 for implementation steps (pending)
- 1 for Phase 4 Quality Gates (pending)
- 1 for Phase 5 Summary (pending)

## Step Dependency Analysis

- **Independent Steps**: 1, 2, 8 (can run in any order)
- **Sequential Dependencies**:
  - Step 3 depends on Step 2 (facade needs query layer changes)
  - Step 4 depends on Step 1 (component needs type definitions)
  - Step 5 depends on Steps 1, 4 (state management needs types and component)
  - Step 6 depends on Steps 2, 3 (server component needs query/facade changes)
  - Step 7 depends on Steps 4, 5, 6 (needs all previous components ready)
  - Step 9 depends on Steps 5, 7 (coordination needs state management in place)
  - Step 10 depends on Steps 4, 6, 9 (visual feedback needs all components)

## Files Summary

**To Modify**: 7 files

- src/app/(app)/collections/[collectionSlug]/(collection)/route-type.ts
- src/lib/queries/collections/collections.query.ts
- src/lib/facades/collections/collections.facade.ts
- src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobblehead-controls.tsx
- src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads.tsx
- src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx
- src/lib/validations/collections.validation.ts

**To Create**: 1 file

- src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-subcollection-filter.tsx

## Context Management Strategy

- **Orchestrator**: Maintains routing table, step summaries, and progress tracking
- **Specialists**: Each receives only the files needed for their step
- **Result**: Scalable to 10+ step plans without context overflow

## Checkpoint

✓ Setup complete
✓ Step types detected and specialists assigned
✓ Routing table created
✓ Ready to begin step-by-step implementation
