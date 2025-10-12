# Implementation Plan: Implementation Plan Display & Management System

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

Transform the feature planner's third step from a basic display into a comprehensive implementation plan management system. This involves building a rich UI for displaying, editing, reordering, and managing implementation plan steps with full CRUD operations, template management, versioning, and markdown export capabilities. The backend infrastructure (schema, queries, validations) is already complete; this plan focuses on surfacing that data through an interactive UI.

## Prerequisites

- [ ] Verify all database schema tables exist (planSteps, planStepTemplates)
- [ ] Confirm existing queries and actions in `src/lib/queries/feature-planner/` work correctly
- [ ] Test current plan generation endpoint returns structured plan steps
- [ ] Verify TanStack Query and React Form are properly configured in project

## Implementation Steps

### Step 1: Create Core Plan Display Component Architecture

**What**: Build the foundational component structure for displaying implementation plans with collapsible sections and step cards
**Why**: Establishes the visual hierarchy and layout foundation before adding interactivity
**Confidence**: High

**Files to Create:**
- `src/app/(app)/feature-planner/components/plan-display/plan-header.tsx` - Plan overview section with metadata, duration, complexity, risk level
- `src/app/(app)/feature-planner/components/plan-display/plan-step-card.tsx` - Individual step card component with expandable details
- `src/app/(app)/feature-planner/components/plan-display/plan-section.tsx` - Wrapper for plan sections (Overview, Prerequisites, Steps, Quality Gates)
- `src/app/(app)/feature-planner/components/plan-display/plan-step-list.tsx` - Container for sortable step list

**Files to Modify:**
- `src/app/(app)/feature-planner/components/implementation-plan-results.tsx` - Replace entire component to use new plan display architecture, integrate TanStack Query for data fetching

**Changes:**
- Add PlanHeader component rendering plan metadata fields from database
- Add PlanStepCard component with Radix Collapsible for expandable step details
- Add PlanSection component for consistent section styling using Tailwind
- Add PlanStepList component as container for step cards with drag-drop preparation
- Modify implementation-plan-results.tsx to compose these components and fetch plan data via TanStack Query

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Plan displays with all metadata fields from database schema
- [ ] Steps render as expandable cards showing What/Why/Confidence/Files/Changes
- [ ] All validation commands pass
- [ ] Component structure follows project conventions

---

### Step 2: Implement TanStack Query Hooks for Plan Data Management

**What**: Create custom hooks for fetching, caching, and mutating implementation plan data
**Why**: Provides reactive data layer with automatic cache invalidation and optimistic updates
**Confidence**: High

**Files to Create:**
- `src/lib/hooks/use-implementation-plan.ts` - Main hook for fetching complete plan with steps
- `src/lib/hooks/use-plan-step-mutations.ts` - Mutations for creating, updating, deleting, reordering steps
- `src/lib/hooks/use-plan-templates.ts` - Hook for fetching and managing step templates
- `src/lib/hooks/use-plan-export.ts` - Hook for generating markdown exports

**Files to Modify:**
- None

**Changes:**
- Add useImplementationPlan hook using useQuery with plan ID parameter
- Add usePlanStepMutations hook with useMutation for create/update/delete/reorder operations
- Add usePlanTemplates hook for fetching available step templates from database
- Add usePlanExport hook with custom mutation for markdown generation
- Configure proper cache invalidation strategies between related queries
- Add optimistic updates for step reordering and inline edits

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All hooks properly typed with Drizzle schema types
- [ ] Cache invalidation triggers on mutations
- [ ] Optimistic updates work for reordering operations
- [ ] All validation commands pass

---

### Step 3: Add Server Actions for Step CRUD Operations

**What**: Create Next-Safe-Action server actions for all plan step management operations
**Why**: Provides type-safe server-side logic with Zod validation and Drizzle transactions
**Confidence**: High

**Files to Modify:**
- `src/lib/actions/feature-planner/feature-planner.actions.ts` - Add new server actions for step management

**Changes:**
- Add createPlanStepAction using insertPlanStepSchema validation and Drizzle insert
- Add updatePlanStepAction using updatePlanStepSchema validation and Drizzle update
- Add deletePlanStepAction with plan ownership verification
- Add reorderPlanStepsAction using reorderPlanStepsSchema for batch position updates
- Add duplicatePlanStepAction for copying existing steps
- Add applyTemplateAction for inserting template-based steps
- Wrap all database operations in Drizzle transactions for atomicity
- Add proper error handling and success response types

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All actions properly validated with Zod schemas from validations file
- [ ] Database operations wrapped in transactions
- [ ] Actions return typed success/error responses
- [ ] All validation commands pass

---

### Step 4: Build Inline Step Editing with TanStack React Form

**What**: Implement inline editing functionality for plan steps using TanStack React Form with Zod validation
**Why**: Enables users to modify step details without leaving the plan view
**Confidence**: High

**Files to Create:**
- `src/app/(app)/feature-planner/components/plan-display/plan-step-edit-form.tsx` - Inline edit form component with all step fields
- `src/app/(app)/feature-planner/components/plan-display/plan-step-view.tsx` - Read-only view of step details

**Files to Modify:**
- `src/app/(app)/feature-planner/components/plan-display/plan-step-card.tsx` - Add edit mode toggle between view and edit states

**Changes:**
- Add PlanStepEditForm component using TanStack React Form with updatePlanStepSchema
- Add form fields for title, description, confidence, files, changes, validationCommands, successCriteria
- Add PlanStepView component rendering read-only step details with formatting
- Modify PlanStepCard to toggle between view and edit modes
- Add form submission handling with usePlanStepMutations hook
- Add cancel/save/delete actions with confirmation dialogs
- Add validation error display using form utilities

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Edit mode activates on step card click or edit button
- [ ] Form validates using Zod schema from validations file
- [ ] Changes save with optimistic updates via TanStack Query
- [ ] Cancel restores original values
- [ ] All validation commands pass

---

### Step 5: Implement Drag-and-Drop Step Reordering

**What**: Add drag-and-drop functionality for reordering plan steps using existing sortable component
**Why**: Provides intuitive UX for organizing step order without manual position editing
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/feature-planner/components/plan-display/plan-step-list.tsx` - Integrate sortable component and reordering logic

**Changes:**
- Import and configure Sortable component from `src/components/ui/sortable.tsx`
- Add drag handle indicators to each step card
- Implement onReorder callback updating step positions locally
- Add debounced mutation call to reorderPlanStepsAction after drag completes
- Add optimistic updates showing new order immediately
- Add visual feedback during drag operations using Tailwind classes
- Handle reorder failures with rollback to previous order

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Steps reorder smoothly with drag-and-drop
- [ ] Position changes persist to database via server action
- [ ] Optimistic updates prevent UI lag
- [ ] Failed reorders rollback gracefully
- [ ] All validation commands pass

---

### Step 6: Create Step Template Management System

**What**: Build UI for browsing, selecting, and applying predefined step templates using Command component
**Why**: Accelerates plan creation by providing common step patterns (ESLint, TypeScript, tests, migrations)
**Confidence**: High

**Files to Create:**
- `src/app/(app)/feature-planner/components/templates/template-command-palette.tsx` - Command palette for searching and selecting templates
- `src/app/(app)/feature-planner/components/templates/template-preview.tsx` - Preview panel showing template details before applying
- `src/app/(app)/feature-planner/components/templates/template-list-item.tsx` - Individual template list item with metadata

**Files to Modify:**
- `src/app/(app)/feature-planner/components/plan-display/plan-step-list.tsx` - Add button to open template palette between steps

**Changes:**
- Add TemplateCommandPalette using Command component from `src/components/ui/command.tsx`
- Add search and filter functionality for templates by category and name
- Add TemplatePreview showing template fields and example usage
- Add TemplateListItem rendering template name, description, category with icons
- Modify PlanStepList to show template insertion points between existing steps
- Add template application logic calling applyTemplateAction
- Add confirmation dialog before inserting template steps
- Configure keyboard shortcuts for opening palette

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Command palette opens with keyboard shortcut and button click
- [ ] Templates searchable and filterable by category
- [ ] Preview shows complete template details
- [ ] Template insertion works at any position
- [ ] All validation commands pass

---

### Step 7: Add Custom Step Creation and Deletion

**What**: Implement functionality for adding new custom steps and deleting existing steps
**Why**: Users need flexibility to add project-specific steps beyond templates
**Confidence**: High

**Files to Create:**
- `src/app/(app)/feature-planner/components/plan-display/plan-step-create-form.tsx` - Form for creating new custom steps from scratch
- `src/app/(app)/feature-planner/components/plan-display/plan-step-delete-dialog.tsx` - Confirmation dialog for step deletion

**Files to Modify:**
- `src/app/(app)/feature-planner/components/plan-display/plan-step-list.tsx` - Add create step button
- `src/app/(app)/feature-planner/components/plan-display/plan-step-card.tsx` - Add delete button with confirmation

**Changes:**
- Add PlanStepCreateForm using TanStack React Form with insertPlanStepSchema validation
- Add all required fields with sensible defaults for new steps
- Add PlanStepDeleteDialog using Radix Dialog component with destructive styling
- Modify PlanStepList to show add step button at end and between steps
- Modify PlanStepCard to add delete button in card actions menu
- Add step creation mutation calling createPlanStepAction
- Add step deletion mutation calling deletePlanStepAction
- Handle position recalculation after deletion

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] New steps can be added at any position with custom content
- [ ] Delete confirmation prevents accidental removals
- [ ] Positions auto-adjust after deletion
- [ ] Mutations update cache correctly
- [ ] All validation commands pass

---

### Step 8: Build Plan Metadata Editing Interface

**What**: Create editable interface for plan overview metadata (duration, complexity, risk, summary)
**Why**: Allows refinement of plan-level details after generation
**Confidence**: Medium

**Files to Create:**
- `src/app/(app)/feature-planner/components/plan-display/plan-metadata-form.tsx` - Inline form for editing plan-level metadata

**Files to Modify:**
- `src/app/(app)/feature-planner/components/plan-display/plan-header.tsx` - Toggle between view and edit modes for metadata
- `src/lib/actions/feature-planner/feature-planner.actions.ts` - Add updatePlanMetadataAction

**Changes:**
- Add PlanMetadataForm component with fields for estimatedDuration, complexity, riskLevel, quickSummary
- Add validation using Zod schema for plan metadata fields
- Modify PlanHeader to toggle between display and edit modes
- Add updatePlanMetadataAction server action with Drizzle update
- Add form submission with optimistic updates
- Add select dropdowns for complexity and riskLevel enums
- Add textarea for quickSummary with character count

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Metadata fields editable inline with proper validation
- [ ] Changes save and update plan display immediately
- [ ] Enum fields use proper select components
- [ ] All validation commands pass

---

### Step 9: Implement Markdown Export Functionality

**What**: Create markdown export system generating formatted implementation plans following `docs/` folder conventions
**Why**: Provides shareable, version-controlled documentation following project standards
**Confidence**: High

**Files to Create:**
- `src/lib/utils/markdown-export.ts` - Utility functions for converting plan data to markdown format
- `src/app/(app)/feature-planner/components/export/export-dialog.tsx` - Dialog for configuring and triggering export

**Files to Modify:**
- `src/app/(app)/feature-planner/components/plan-display/plan-header.tsx` - Add export button

**Changes:**
- Add markdown export utility functions formatting plan sections according to template structure
- Add proper markdown formatting for lists, code blocks, headings, checkboxes
- Add ExportDialog component with Radix Dialog for export options
- Add export path configuration following `docs/{YYYY_MM_DD}/` convention
- Add file naming based on plan title and timestamp
- Modify PlanHeader to add export button opening dialog
- Add server action for writing markdown file to filesystem
- Add download option for client-side file download
- Add success notification with file path

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Exported markdown matches implementation plan template structure
- [ ] Files save to correct `docs/{YYYY_MM_DD}/` location
- [ ] Markdown properly formatted with all plan sections
- [ ] Export succeeds with user feedback
- [ ] All validation commands pass

---

### Step 10: Add Prerequisites and Quality Gates Management

**What**: Build dedicated UI sections for managing plan prerequisites and quality gates
**Why**: These critical sections need dedicated management beyond generic steps
**Confidence**: Medium

**Files to Create:**
- `src/app/(app)/feature-planner/components/plan-display/prerequisites-section.tsx` - Editable checklist for prerequisites
- `src/app/(app)/feature-planner/components/plan-display/quality-gates-section.tsx` - Editable checklist for quality gates

**Files to Modify:**
- `src/app/(app)/feature-planner/components/implementation-plan-results.tsx` - Integrate new sections into plan layout

**Changes:**
- Add PrerequisitesSection component rendering checkbox list from database
- Add inline add/edit/delete for prerequisite items
- Add QualityGatesSection component with similar checkbox list structure
- Add server actions for updating prerequisites and qualityGates arrays
- Modify implementation-plan-results.tsx to render dedicated sections
- Add drag-and-drop reordering for prerequisite and quality gate items
- Add validation ensuring critical items not deleted

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Prerequisites and quality gates render as editable checklists
- [ ] Items can be added, edited, deleted, and reordered
- [ ] Changes persist to database arrays
- [ ] Critical validations remain protected
- [ ] All validation commands pass

---

### Step 11: Integrate with Refinement and Discovery Results

**What**: Add contextual links and data integration between plan display and previous workflow steps
**Why**: Creates cohesive workflow where users can reference refinement and file discovery results while editing plans
**Confidence**: Medium

**Files to Create:**
- `src/app/(app)/feature-planner/components/context/context-panel.tsx` - Collapsible side panel showing refinement and discovery data
- `src/app/(app)/feature-planner/components/context/refinement-summary.tsx` - Display component for refined feature details
- `src/app/(app)/feature-planner/components/context/file-list.tsx` - Display component for discovered files

**Files to Modify:**
- `src/app/(app)/feature-planner/components/implementation-plan-results.tsx` - Add context panel integration
- `src/app/(app)/feature-planner/components/steps/step-three.tsx` - Pass refinement and discovery data as props

**Changes:**
- Add ContextPanel component using Radix Collapsible or Sheet for side panel
- Add RefinementSummary displaying refined feature request text
- Add FileList displaying discovered files with priority tags and descriptions
- Modify implementation-plan-results.tsx to render context panel alongside plan display
- Modify step-three.tsx to fetch and pass related data from previous steps
- Add quick copy buttons for file paths into step file lists
- Add visual indicators linking steps to discovered files

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Context panel displays alongside plan with refinement and file data
- [ ] Users can reference previous step results while editing
- [ ] File paths easily copied into step configurations
- [ ] Panel collapsible to maximize plan editing space
- [ ] All validation commands pass

---

### Step 12: Implement Plan Version History Tracking

**What**: Create versioning system tracking plan modifications with snapshot capability
**Why**: Allows users to revert changes and compare plan evolution over time
**Confidence**: Low

**Files to Create:**
- `src/app/(app)/feature-planner/components/history/version-history-panel.tsx` - Panel displaying plan version timeline
- `src/app/(app)/feature-planner/components/history/version-diff-view.tsx` - Component showing differences between versions
- `src/lib/utils/plan-diff.ts` - Utility for computing plan differences

**Files to Modify:**
- `src/lib/actions/feature-planner/feature-planner.actions.ts` - Add version snapshot logic to update actions
- `src/app/(app)/feature-planner/components/plan-display/plan-header.tsx` - Add history button

**Changes:**
- Add version snapshot creation on significant plan modifications
- Add VersionHistoryPanel displaying chronological version list with timestamps
- Add version comparison logic showing added/modified/deleted steps
- Add VersionDiffView rendering side-by-side or unified diff display
- Add version restoration functionality with confirmation
- Modify relevant actions to create snapshots before mutations
- Add plan-diff utility computing structural differences between versions
- Modify PlanHeader to add history button opening panel

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Versions automatically captured on significant changes
- [ ] Version history displays with timestamps and change summaries
- [ ] Diff view clearly shows modifications between versions
- [ ] Version restoration works with confirmation dialog
- [ ] All validation commands pass

---

### Step 13: Add Search and Filter Capabilities

**What**: Implement search and filtering UI for plan steps using Command component
**Why**: Enables quick navigation in long plans with many steps
**Confidence**: High

**Files to Create:**
- `src/app/(app)/feature-planner/components/search/plan-search-command.tsx` - Command palette for searching steps
- `src/app/(app)/feature-planner/components/search/step-filter-menu.tsx` - Filter menu for confidence, status, file types

**Files to Modify:**
- `src/app/(app)/feature-planner/components/plan-display/plan-step-list.tsx` - Apply search and filter to displayed steps
- `src/app/(app)/feature-planner/components/plan-display/plan-header.tsx` - Add search button

**Changes:**
- Add PlanSearchCommand using Command component for fuzzy searching step titles and descriptions
- Add search highlighting in matching steps
- Add StepFilterMenu with Radix Popover for filtering by confidence level
- Add filter badges showing active filters with clear buttons
- Modify PlanStepList to filter displayed steps based on active search and filters
- Modify PlanHeader to add search button opening command palette
- Add keyboard shortcut for opening search
- Add empty states when no steps match filters

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Search finds steps by title, description, file paths
- [ ] Filter menu allows filtering by confidence level
- [ ] Active filters display as badges
- [ ] Filtered view updates reactively
- [ ] All validation commands pass

---

### Step 14: Add API Routes for Step Operations

**What**: Create complementary API routes for client-side operations needing REST endpoints
**Why**: Provides alternative endpoints for operations better suited to REST than server actions
**Confidence**: Medium

**Files to Create:**
- `src/app/api/feature-planner/plans/[planId]/steps/route.ts` - GET list steps, POST create step endpoints
- `src/app/api/feature-planner/plans/[planId]/steps/[stepId]/route.ts` - PATCH update step, DELETE remove step endpoints
- `src/app/api/feature-planner/plans/[planId]/reorder/route.ts` - POST batch reorder endpoint
- `src/app/api/feature-planner/plans/[planId]/export/route.ts` - GET markdown export endpoint

**Changes:**
- Add GET endpoint returning all steps for a plan with proper pagination
- Add POST endpoint creating new steps with Zod validation
- Add PATCH endpoint updating individual steps
- Add DELETE endpoint removing steps with ownership checks
- Add reorder endpoint handling batch position updates
- Add export endpoint generating and returning markdown file
- Add proper error handling and status codes
- Add rate limiting middleware

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All endpoints properly authenticated with Clerk
- [ ] Request/response bodies validated with Zod
- [ ] Endpoints return consistent error formats
- [ ] Rate limiting prevents abuse
- [ ] All validation commands pass

---

### Step 15: Build Step Duplication and Batch Operations

**What**: Add functionality for duplicating steps and performing batch operations on multiple steps
**Why**: Improves productivity when managing similar steps or making bulk changes
**Confidence**: Medium

**Files to Create:**
- `src/app/(app)/feature-planner/components/batch/batch-action-toolbar.tsx` - Toolbar for batch operations when steps selected
- `src/app/(app)/feature-planner/components/batch/step-selection-checkbox.tsx` - Checkbox for multi-select

**Files to Modify:**
- `src/app/(app)/feature-planner/components/plan-display/plan-step-card.tsx` - Add selection checkbox and duplicate button
- `src/app/(app)/feature-planner/components/plan-display/plan-step-list.tsx` - Track selected steps state
- `src/lib/actions/feature-planner/feature-planner.actions.ts` - Add batch operations actions

**Changes:**
- Add step selection state management in PlanStepList
- Add StepSelectionCheckbox component for multi-select UI
- Add BatchActionToolbar appearing when steps selected
- Add batch delete, batch update confidence, batch duplicate operations
- Add duplicatePlanStepAction creating copy with new position
- Add batch operations server actions with transaction wrapping
- Modify PlanStepCard to show checkbox and duplicate button
- Add select all/none functionality
- Add confirmation dialogs for destructive batch operations

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Steps can be selected individually or in bulk
- [ ] Batch operations work on all selected steps atomically
- [ ] Duplicate creates exact copy at next position
- [ ] Batch toolbar shows only when steps selected
- [ ] All validation commands pass

---

### Step 16: Add Loading States and Error Boundaries

**What**: Implement comprehensive loading states, skeletons, and error boundaries throughout plan display
**Why**: Provides polished UX during async operations and graceful error handling
**Confidence**: High

**Files to Create:**
- `src/app/(app)/feature-planner/components/loading/plan-skeleton.tsx` - Skeleton loader for plan display
- `src/app/(app)/feature-planner/components/loading/step-card-skeleton.tsx` - Skeleton for individual step cards
- `src/app/(app)/feature-planner/components/error/plan-error-boundary.tsx` - Error boundary for plan display

**Files to Modify:**
- `src/app/(app)/feature-planner/components/implementation-plan-results.tsx` - Add loading and error states
- `src/app/(app)/feature-planner/components/plan-display/plan-step-list.tsx` - Add loading states during mutations

**Changes:**
- Add PlanSkeleton component matching plan layout structure
- Add StepCardSkeleton with animated shimmer effect using Tailwind
- Add PlanErrorBoundary with retry and fallback UI
- Modify implementation-plan-results.tsx to show skeleton during initial load
- Modify PlanStepList to show loading indicators during reorder operations
- Add inline loading states for step edit form submissions
- Add toast notifications for successful operations
- Add error toasts with actionable retry buttons
- Add suspense boundaries around data-fetching components

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Skeleton loaders display during data fetching
- [ ] Error boundaries catch and display errors gracefully
- [ ] Loading states prevent multiple submissions
- [ ] Toast notifications provide operation feedback
- [ ] All validation commands pass

---

### Step 17: Final Integration and Polish

**What**: Complete integration of all features, add final polish, accessibility improvements, and mobile responsiveness
**Why**: Ensures cohesive user experience across all features and devices
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/feature-planner/components/implementation-plan-results.tsx` - Final integration of all subcomponents
- `src/app/(app)/feature-planner/components/steps/step-three.tsx` - Final workflow integration
- `src/app/(app)/feature-planner/page.tsx` - Ensure proper data flow between steps

**Changes:**
- Verify all components integrated correctly into implementation-plan-results.tsx
- Add responsive breakpoints for mobile and tablet views
- Add proper ARIA labels and keyboard navigation throughout
- Add focus management for dialogs and command palettes
- Add proper color contrast for accessibility
- Verify all interactive elements have hover and focus states
- Add comprehensive component documentation comments
- Verify all mutations properly invalidate caches
- Add analytics tracking for key user interactions
- Test complete workflow from plan generation through export

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All features work together seamlessly
- [ ] Mobile experience functional and polished
- [ ] Accessibility audit passes with no critical issues
- [ ] Keyboard navigation works throughout
- [ ] All validation commands pass
- [ ] No console errors or warnings

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] All code formatted with `npm run format`
- [ ] TanStack Query cache invalidation verified working correctly
- [ ] All server actions properly wrapped in transactions
- [ ] All forms validate with Zod schemas from validations file
- [ ] All components use existing Radix UI and Tailwind patterns
- [ ] No barrel file imports (direct imports only)
- [ ] No `any` types, `forwardRef`, or lint disable comments
- [ ] Drag-and-drop reordering works smoothly without glitches
- [ ] Template system successfully inserts predefined steps
- [ ] Markdown export generates properly formatted files in `docs/` folder
- [ ] Version history tracks and restores previous plan states
- [ ] All async operations have loading and error states
- [ ] Mobile responsiveness verified on common breakpoints
- [ ] Accessibility verified with keyboard navigation and screen readers

## Notes

**Critical Assumptions:**
- Database schema in `src/lib/db/schema/feature-planner.schema.ts` is complete and migrated
- Existing query functions in `src/lib/queries/feature-planner/` work correctly
- Validation schemas in `src/lib/validations/feature-planner.validation.ts` cover all operations
- Backend plan generation service already returns structured plan steps

**High-Risk Areas:**
- **Step Reordering**: Batch position updates must maintain referential integrity; test thoroughly with edge cases
- **Version History**: Storing complete plan snapshots could cause storage growth; consider retention policy
- **Markdown Export**: File system writes from server actions need proper path validation and error handling
- **Cache Management**: Complex relationships between plans, steps, and templates require careful invalidation strategy

**Performance Considerations:**
- Lazy load version history panel to avoid loading all versions upfront
- Debounce search input to prevent excessive filtering operations
- Use virtual scrolling if plans regularly exceed 50+ steps
- Consider pagination for template list if template count grows large

**Simplified Alternatives if Needed:**
- Version history can be deferred to later phase if complexity too high (Low confidence)
- Batch operations can start with duplicate-only before adding full batch editing
- Export can initially support download-only before adding server-side file writes

**Integration Points:**
- Context panel must coordinate with step 1 and step 2 data fetching
- Export functionality should align with existing documentation conventions in `docs/` folder
- Template system should seed initial templates covering common operations (ESLint, TypeScript, Prettier, migrations, tests)
