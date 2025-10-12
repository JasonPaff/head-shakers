Implementation Plan: Feature Planner Step 3 UI Implementation

Overview

Estimated Duration: 3-4 days
Complexity: High
Risk Level: Medium

Quick Summary

Implement a complete UI for Step 3 of the feature planner workflow that displays generated implementation plans from the PostgreSQL database, provides interactive
editing capabilities for plan steps (add/remove/reorder/modify), and includes a template management system for inserting predefined plan step templates, all while
maintaining type safety through existing Zod validation schemas and leveraging Drizzle ORM queries.

Prerequisites

- Verify database schema includes implementationPlanGenerations, planSteps, and planStepTemplates tables
- Confirm existing Zod validation schemas in feature-planner.validation.ts cover all CRUD operations
- Review feature-planner.schema.ts for complete type definitions
- Ensure TanStack Query and Radix UI dependencies are installed

Implementation Steps

Step 1: Create Plan Viewer Foundation Component

What: Build the base plan-viewer.tsx component that fetches and displays generated implementation plans
Why: This component serves as the read-only foundation for viewing plans before editing
Confidence: High

Files to Create:
- src/components/feature/feature-planner/plan-viewer.tsx - Main component for displaying generated implementation plans with metadata and steps

Files to Modify:
- None

Changes:
- Create TypeScript component accepting planId as prop
- Implement TanStack Query hook using existing query method from feature-planner.query.ts
- Display plan metadata (title, description, estimated duration, complexity, risk level)
- Render ordered list of plan steps with their properties
- Include loading and error states with Radix UI components
- Add collapsible sections for step details using pattern from file-discovery-results.tsx
- Use Lucide React icons for visual indicators

Validation Commands:
npm run lint:fix && npm run typecheck

Success Criteria:
- Component successfully fetches plan data using TanStack Query
- Plan metadata displays correctly with proper formatting
- All plan steps render in correct order with complete information
- Loading and error states function properly
- All validation commands pass

  ---
Step 2: Create Plan Step Card Component

What: Build reusable plan-step-card.tsx component for individual step display and inline editing
Why: Encapsulates step rendering logic and provides consistent UI for step manipulation
Confidence: High

Files to Create:
- src/components/feature/feature-planner/plan-step-card.tsx - Reusable card component for displaying and editing individual plan steps

Files to Modify:
- None

Changes:
- Create component accepting step data, edit mode flag, and callback handlers as props
- Display step number, title, description, confidence level, and file operations
- Include validation commands and success criteria sections
- Implement expand/collapse functionality for step details
- Add inline edit mode with form fields using Radix UI form components
- Include drag handle for reordering (visual only, no functionality yet)
- Add delete and duplicate action buttons
- Apply conditional styling for different confidence levels

Validation Commands:
npm run lint:fix && npm run typecheck

Success Criteria:
- Card displays all step properties correctly
- Expand/collapse functionality works smoothly
- Edit mode toggles properly with appropriate UI changes
- Action buttons render with proper icons and hover states
- All validation commands pass

  ---
Step 3: Implement Plan Editor Core Logic

What: Create plan-editor.tsx component with full CRUD operations for plan steps
Why: Provides interactive editing capabilities while maintaining data integrity through validation
Confidence: High

Files to Create:
- src/components/feature/feature-planner/plan-editor.tsx - Interactive editor component with state management and CRUD operations

Files to Modify:
- src/lib/actions/feature-planner/feature-planner.actions.ts - Add server actions for step CRUD operations
- src/lib/facades/feature-planner/feature-planner.facade.ts - Add facade methods for plan step management
- src/lib/queries/feature-planner/feature-planner.query.ts - Verify step query methods exist

Changes:
- Create editor component that wraps plan-viewer with edit capabilities
- Implement local state management for step modifications using React useState
- Add server actions in feature-planner.actions.ts for createPlanStep, updatePlanStep, deletePlanStep, reorderPlanSteps
- Create facade methods in feature-planner.facade.ts that handle business logic and validation
- Integrate TanStack Query mutations for optimistic updates
- Add step operations: add new step, delete step, duplicate step, modify step fields
- Implement dirty state tracking to detect unsaved changes
- Add save/cancel buttons with confirmation dialogs using Radix UI Dialog

Validation Commands:
npm run lint:fix && npm run typecheck

Success Criteria:
- Server actions created with proper Zod validation from feature-planner.validation.ts
- Facade methods implement correct business logic with database transactions
- TanStack Query mutations update cache optimistically
- All CRUD operations persist correctly to database
- Dirty state tracking prevents accidental navigation away
- All validation commands pass

  ---
Step 4: Implement Drag-and-Drop Reordering

What: Add drag-and-drop functionality for reordering plan steps using dnd-kit library
Why: Provides intuitive UX for reorganizing implementation plan steps
Confidence: Medium

Files to Create:
- None

Files to Modify:
- src/components/feature/feature-planner/plan-editor.tsx - Add drag-and-drop context and handlers
- src/components/feature/feature-planner/plan-step-card.tsx - Make cards draggable with dnd-kit hooks

Changes:
- Install @dnd-kit/core, @dnd-kit/sortable, and @dnd-kit/utilities if not present
- Wrap step list in DndContext from dnd-kit
- Implement SortableContext with vertical list strategy
- Add useSortable hook to plan-step-card component
- Create handleDragEnd function that updates step order state
- Update step order property in database after drag completes
- Add visual feedback during drag operation with transform styles
- Ensure accessibility with keyboard navigation support

Validation Commands:
npm run lint:fix && npm run typecheck

Success Criteria:
- Steps can be dragged and reordered smoothly
- Visual feedback indicates drag state clearly
- Order persists to database after drag completion
- Keyboard navigation works for accessibility
- All validation commands pass

  ---
Step 5: Create Template Selector Component

What: Build template-selector.tsx component for browsing and inserting predefined plan step templates
Why: Accelerates plan creation by providing reusable step templates
Confidence: High

Files to Create:
- src/components/feature/feature-planner/template-selector.tsx - Component for displaying and selecting step templates

Files to Modify:
- src/lib/queries/feature-planner/feature-planner.query.ts - Add query method for fetching plan step templates
- src/lib/actions/feature-planner/feature-planner.actions.ts - Add action for inserting template as new step

Changes:
- Create component with search and filter capabilities
- Add query method getPlanStepTemplates to feature-planner.query.ts
- Display templates in categorized grid using Radix UI Card components
- Implement template preview on hover using Radix UI Tooltip
- Add insert button that creates new step from template data
- Create server action insertTemplateAsStep in feature-planner.actions.ts
- Include template metadata (category, description, usage count)
- Add keyboard shortcuts for quick template insertion

Validation Commands:
npm run lint:fix && npm run typecheck

Success Criteria:
- Templates fetch and display correctly by category
- Search and filter functionality works accurately
- Template preview shows complete step structure
- Insert action creates properly formatted step in plan
- Server action validates template data with Zod schemas
- All validation commands pass

  ---
Step 6: Implement Template Management System

What: Add CRUD operations for managing plan step templates
Why: Allows users to create, edit, and organize reusable templates for future plans
Confidence: Medium

Files to Create:
- src/components/feature/feature-planner/template-manager.tsx - Management interface for templates

Files to Modify:
- src/lib/actions/feature-planner/feature-planner.actions.ts - Add template CRUD actions
- src/lib/facades/feature-planner/feature-planner.facade.ts - Add template management facade methods
- src/lib/queries/feature-planner/feature-planner.query.ts - Add template query methods

Changes:
- Create template manager component with list and form views
- Add server actions: createTemplate, updateTemplate, deleteTemplate, duplicateTemplate
- Implement facade methods for template operations with validation
- Add query methods: getTemplateById, getTemplatesByCategory, searchTemplates
- Create template form with all required fields from planStepTemplates schema
- Add category management dropdown with predefined categories
- Implement template versioning tracking in metadata
- Include usage analytics (how many times template has been used)

Validation Commands:
npm run lint:fix && npm run typecheck

Success Criteria:
- All template CRUD operations work correctly
- Templates validate against Zod schemas before saving
- Category filtering and search perform efficiently
- Usage analytics track correctly in database
- Form validation prevents invalid template creation
- All validation commands pass

  ---
Step 7: Integrate Step 3 into Main Orchestrator

What: Replace placeholder step-three.tsx and integrate new components into page.tsx
Why: Completes the 3-step workflow by connecting generated plans to the UI
Confidence: High

Files to Create:
- None

Files to Modify:
- src/app/(app)/feature-planner/components/steps/step-three.tsx - Replace placeholder with plan viewer/editor integration
- src/app/(app)/feature-planner/page.tsx - Update orchestration state and handlers
- src/app/(app)/feature-planner/components/steps/step-orchestrator.tsx - Update props interface for step 3

Changes:
- Replace step-three.tsx content with conditional rendering of plan-viewer or plan-editor
- Add state management in page.tsx for tracking current plan ID and edit mode
- Create handler functions for plan selection, edit toggle, and save operations
- Update step-orchestrator.tsx to pass plan data and handlers to step 3
- Add navigation controls for moving between view and edit modes
- Implement plan version history tracking when saving edits
- Add export functionality for downloading plan as markdown file
- Include success toast notifications using existing toast patterns

Validation Commands:
npm run lint:fix && npm run typecheck

Success Criteria:
- Step 3 displays after successful plan generation in step 2
- Plan viewer shows generated plan with all details
- Edit mode toggle works correctly with proper permissions
- Plan modifications save and update database records
- Export functionality generates valid markdown file
- Navigation between steps maintains state correctly
- All validation commands pass

  ---
Step 8: Add Plan Comparison and Version Control

What: Implement UI for comparing plan versions and reverting to previous states
Why: Provides safety net for plan editing and allows users to track plan evolution
Confidence: Medium

Files to Create:
- src/components/feature/feature-planner/plan-version-history.tsx - Component for viewing plan version history

Files to Modify:
- src/lib/queries/feature-planner/feature-planner.query.ts - Add query for plan version history
- src/lib/actions/feature-planner/feature-planner.actions.ts - Add action for reverting to previous version
- src/lib/facades/feature-planner/feature-planner.facade.ts - Add version management facade methods

Changes:
- Create version history component displaying timeline of plan changes
- Add query method getPlanVersionHistory to feature-planner.query.ts
- Implement side-by-side diff view for comparing plan versions
- Create revertToPlanVersion action in feature-planner.actions.ts
- Add facade method that creates new version from historical state
- Include metadata for each version (timestamp, user, change summary)
- Add confirmation dialog before reverting using Radix UI AlertDialog
- Implement automatic version creation on significant plan modifications

Validation Commands:
npm run lint:fix && npm run typecheck

Success Criteria:
- Version history displays chronologically with complete metadata
- Diff view clearly shows changes between versions
- Revert operation creates new version preserving history
- Automatic versioning triggers on appropriate changes
- User receives clear feedback during revert process
- All validation commands pass

  ---
Step 9: Implement Real-time Collaboration Indicators

What: Add presence indicators and conflict resolution for concurrent plan editing
Why: Prevents conflicting edits when multiple users work on the same plan
Confidence: Low

Files to Create:
- src/components/feature/feature-planner/collaboration-banner.tsx - Component showing active editors

Files to Modify:
- src/lib/actions/feature-planner/feature-planner.actions.ts - Add actions for acquiring/releasing edit locks
- src/lib/facades/feature-planner/feature-planner.facade.ts - Add edit lock management facade methods
- src/components/feature/feature-planner/plan-editor.tsx - Integrate collaboration banner

Changes:
- Create collaboration banner showing who is currently viewing/editing plan
- Implement Ably real-time integration for presence tracking
- Add acquireEditLock and releaseEditLock server actions
- Create facade methods managing edit lock state in Redis using Upstash
- Display warning banner when another user has edit lock
- Implement automatic lock release after timeout or user navigation
- Add conflict resolution modal when concurrent edits detected
- Include force-take-lock option for admin users only

Validation Commands:
npm run lint:fix && npm run typecheck

Success Criteria:
- Presence indicators show accurate real-time information
- Edit locks prevent concurrent modifications effectively
- Lock timeout mechanism works reliably
- Conflict resolution provides clear user feedback
- Admin override functionality works with proper authorization
- All validation commands pass

  ---
Step 10: Add Plan Analytics and Insights

What: Create analytics dashboard showing plan usage metrics and completion rates
Why: Provides valuable insights into plan effectiveness and user behavior
Confidence: Medium

Files to Create:
- src/components/feature/feature-planner/plan-analytics.tsx - Analytics dashboard component

Files to Modify:
- src/lib/queries/feature-planner/feature-planner.query.ts - Add analytics query methods
- src/app/(app)/feature-planner/page.tsx - Add analytics view toggle

Changes:
- Create analytics component with chart visualizations
- Add query methods: getPlanCompletionStats, getMostUsedTemplates, getAverageStepCounts
- Display metrics using Recharts or similar charting library
- Show plan generation trends over time
- Include template usage frequency analysis
- Add step completion rate tracking
- Implement filters for date range and user segments
- Export analytics data as CSV functionality

Validation Commands:
npm run lint:fix && npm run typecheck

Success Criteria:
- Analytics queries aggregate data correctly from database
- Charts render with accurate data and proper formatting
- Filters update visualizations dynamically
- Export functionality generates valid CSV files
- Performance remains acceptable with large datasets
- All validation commands pass

  ---
Step 11: Implement Comprehensive Error Handling

What: Add error boundaries, retry logic, and user-friendly error messages throughout plan UI
Why: Ensures robust user experience even when operations fail
Confidence: High

Files to Create:
- src/components/feature/feature-planner/plan-error-boundary.tsx - Error boundary for plan components

Files to Modify:
- All created components - Add error handling and recovery mechanisms
- src/lib/actions/feature-planner/feature-planner.actions.ts - Add comprehensive error responses
- src/lib/facades/feature-planner/feature-planner.facade.ts - Implement error recovery patterns

Changes:
- Create error boundary component wrapping plan viewer and editor
- Add try-catch blocks in all server actions with descriptive error messages
- Implement retry logic for transient failures using TanStack Query retry options
- Add user-friendly error messages mapped from technical errors
- Include fallback UI states for component errors
- Add error logging to Sentry for monitoring
- Implement graceful degradation when features unavailable
- Add network status detection and offline mode indicators

Validation Commands:
npm run lint:fix && npm run typecheck

Success Criteria:
- Error boundary catches component errors without crashing page
- Server actions return structured error responses
- Retry logic activates appropriately for recoverable failures
- Error messages provide clear guidance to users
- Errors log to Sentry with appropriate context
- All validation commands pass

  ---
Step 12: Add Comprehensive Testing Coverage

What: Write unit, integration, and E2E tests for all new plan UI components
Why: Ensures reliability and prevents regressions in critical workflow functionality
Confidence: High

Files to Create:
- tests/components/feature/feature-planner/plan-viewer.test.tsx - Unit tests for plan viewer
- tests/components/feature/feature-planner/plan-editor.test.tsx - Unit tests for plan editor
- tests/components/feature/feature-planner/plan-step-card.test.tsx - Unit tests for step card
- tests/components/feature/feature-planner/template-selector.test.tsx - Unit tests for template selector
- tests/integration/feature-planner-step-three.test.tsx - Integration tests for complete workflow
- tests/e2e/feature-planner-plan-editing.spec.ts - E2E tests for user workflows

Files to Modify:
- None

Changes:
- Write unit tests for plan-viewer covering data fetching and rendering
- Write unit tests for plan-editor covering CRUD operations and state management
- Write unit tests for plan-step-card covering display modes and interactions
- Write unit tests for template-selector covering search and insertion
- Create integration tests verifying component interaction and data flow
- Write E2E tests for complete user journey from generation to editing
- Mock TanStack Query hooks and server actions using MSW
- Use Testing Library for component testing with user event simulation
- Add Testcontainers tests for database operations
- Achieve minimum 80 percent code coverage for new components

Validation Commands:
npm run lint:fix && npm run typecheck && npm run test

Success Criteria:
- All unit tests pass with appropriate assertions
- Integration tests verify correct component communication
- E2E tests cover critical user workflows successfully
- Code coverage meets 80 percent threshold
- Tests run reliably without flakiness
- All validation commands pass including test suite

  ---
Quality Gates

- All TypeScript files pass npm run typecheck with zero errors
- All files pass npm run lint:fix with zero warnings
- All tests pass with npm run test achieving 80 percent coverage minimum
- Manual verification: Complete workflow from plan generation through editing works end-to-end
- Manual verification: All CRUD operations persist correctly to PostgreSQL database
- Manual verification: Template system functions correctly with insert and management
- Manual verification: Drag-and-drop reordering works smoothly without bugs
- Manual verification: Error states display appropriate messages and recovery options
- Performance verification: Plan viewer loads within 2 seconds for plans with 20 steps
- Accessibility verification: All interactive elements keyboard navigable and screen reader compatible

Notes

Assumptions Requiring Confirmation:
- Database schema for implementationPlanGenerations, planSteps, and planStepTemplates is complete and matches feature-planner.schema.ts
- Existing Zod validation schemas cover all required CRUD operation validations
- User permissions system exists for determining edit access to plans
- Ably configuration is available for real-time collaboration features
- Upstash Redis is configured for edit lock management

High-Risk Areas:
- Drag-and-drop implementation may require careful state synchronization between UI and database
- Real-time collaboration features add complexity and potential race conditions
- Version control system must handle concurrent edits without data loss
- Performance may degrade with very large plans containing 50 plus steps

Technical Debt Considerations:
- Consider implementing optimistic locking pattern for concurrent edit prevention
- May need to add pagination for plan version history if plans have many versions
- Template search might require full-text search indexing for large template libraries
- Analytics queries may need caching layer for performance with large datasets

Dependencies:
- Verify @dnd-kit packages are compatible with React 19.1.0
- Confirm Ably SDK version supports current Next.js version
- Check Recharts or chosen charting library React 19 compatibility
