# AI Feature Suggestion Integration - Implementation Plan

**Generated**: 2025-10-13T00:06:15Z
**Original Request**: the feature planner pages needs to integrate the `suggest-feature.md` claude code custom slash command so that a feature planner can use it to generate ideas for a feature to plan

## Analysis Summary

- Feature request refined with project context (318 words, 9.6x expansion)
- Discovered 25 files across all architectural layers
- Generated 12-step implementation plan (2-3 days estimated duration)

## Refined Request

The feature planner pages need to integrate the `suggest-feature.md` Claude Code custom slash command (accessible via `/suggest-feature`) so that a feature planner can use it to generate AI-powered feature ideas for planning. This integration should add a prominent button or action in the feature planner UI that, when clicked, invokes the slash command through the Claude AI agent SDK (@anthropic-ai/claude-agent-sdk), passing the current context such as the page or component name the planner is working on, the feature type they're considering (enhancement, new capability, optimization, etc.), and any priority level or constraints they've specified. The slash command should be executed seamlessly within the feature planning workflow, with the AI-generated suggestions displayed in an appropriate format within the existing UI, likely using a Radix UI dialog or popover component styled with Tailwind CSS 4 to show the suggested features, their rationale, and implementation considerations. The integration should leverage the existing TanStack Query setup for managing any server state related to feature suggestions, and if the suggestions need to be persisted or tracked, they should be stored in the PostgreSQL database via Drizzle ORM with appropriate server actions built using Next-Safe-Action. The feature planner interface should make it clear when the AI is generating suggestions (with loading states) and handle any errors gracefully using the project's error handling patterns. The slash command invocation should respect the user's authentication state via Clerk and only be available to users with appropriate permissions to access feature planning tools. This integration transforms the feature planner from a manual brainstorming tool into an AI-assisted planning experience where planners can quickly generate, evaluate, and refine feature ideas with Claude's help, streamlining the feature ideation process while maintaining full control over which suggestions to pursue and how to implement them within the Head Shakers bobblehead collection platform.

## File Discovery Results

### High Priority Files (12)

1. `.claude/commands/suggest-feature.md` - Slash command definition
2. `.claude/commands/suggest-feature-simple.md` - Alternative command with explicit parameters
3. `src/app/(app)/feature-planner/page.tsx` - Server component entry point
4. `src/app/(app)/feature-planner/components/feature-planner-client.tsx` - Main orchestrator
5. `src/app/(app)/feature-planner/components/request-input.tsx` - Input component (primary integration point)
6. `src/lib/services/feature-planner.service.ts` - Claude SDK reference implementation
7. `src/lib/facades/feature-planner/feature-planner.facade.ts` - Business logic layer
8. `src/lib/actions/feature-planner/feature-planner.actions.ts` - Server actions
9. `src/lib/queries/feature-planner/feature-planner.query.ts` - Database queries
10. `src/lib/db/schema/feature-planner.schema.ts` - PostgreSQL schema
11. `src/lib/validations/feature-planner.validation.ts` - Zod validation schemas
12. `src/components/ui/dialog.tsx` - Radix UI Dialog component

### Key Integration Points

1. **Request Input Component** - Add "AI Suggest Feature" button at lines 88-103
2. **Slash Command Invocation** - Use Claude SDK `query()` following service patterns
3. **Results Display** - Use Dialog component for modal presentation
4. **State Management** - Create `use-suggest-feature.ts` hook following existing patterns
5. **Optional Persistence** - Extend schema with `featureSuggestions` table if needed

---

# Implementation Plan

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Medium

## Quick Summary

Integrate the `/suggest-feature` Claude Code slash command into the feature planner UI by adding an "AI Suggest Feature" button that invokes the command through the Claude Agent SDK, displays results in a Radix UI dialog, and optionally persists suggestions to the database. The integration will follow existing patterns from the feature planner service and leverage the three-layer architecture.

## Prerequisites

- [ ] Verify @anthropic-ai/claude-agent-sdk is installed and configured
- [ ] Confirm `/suggest-feature` slash command is functional via CLI
- [ ] Review feature-planner.service.ts for Claude SDK patterns
- [ ] Ensure Clerk authentication is working in feature planner routes
- [ ] Verify database schema supports feature suggestions (or plan extension)

## Implementation Steps

### Step 1: Create Feature Suggestion Hook

**What**: Create a custom React hook to manage feature suggestion state and invocation
**Why**: Centralizes state management, follows existing hook patterns (use-refinement-flow.ts), and enables reuse across components
**Confidence**: High

**Files to Create:**

- `src/app/(app)/feature-planner/hooks/use-suggest-feature.ts` - React hook for managing suggestion flow state, loading, errors, and results

**Changes:**

- Create hook with state for: isLoading, error, suggestions, isDialogOpen
- Implement invokeSuggestion function that calls server action
- Add dialog control functions: openDialog, closeDialog, resetState
- Return typed interface matching existing hook patterns

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Hook exports clean TypeScript interface
- [ ] State management follows React 19 patterns (no forwardRef)
- [ ] All validation commands pass
- [ ] Hook can be imported without errors

---

### Step 2: Create Server Action for Slash Command Invocation

**What**: Add server action to invoke /suggest-feature command via Claude Agent SDK
**Why**: Separates server-side Claude SDK logic from client components, follows Next-Safe-Action pattern, enables secure API key handling
**Confidence**: High

**Files to Modify:**

- `src/lib/actions/feature-planner/feature-planner.actions.ts` - Add new server action for feature suggestion

**Changes:**

- Add suggestFeatureAction using authActionClient
- Accept parameters: pageOrComponent (string), featureType (enum), priorityLevel (enum), additionalContext (optional string)
- Use feature-planner.service.ts query() method as reference for Claude SDK invocation
- Pass `/suggest-feature [pageOrComponent] [featureType] [priorityLevel]` as command
- Parse and return structured response with error handling
- Apply circuit breaker and retry patterns from existing service methods

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Action properly typed with Zod schema validation
- [ ] Claude SDK invocation follows service patterns
- [ ] Error handling includes circuit breaker
- [ ] All validation commands pass
- [ ] Action can be called from client components

---

### Step 3: Create Validation Schema for Suggestion Parameters

**What**: Add Zod schemas for feature suggestion input and output validation
**Why**: Ensures type safety, validates user input, follows project's validation-first approach
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/feature-planner.validation.ts` - Add suggestion-related schemas

**Changes:**

- Add featureTypeEnum schema with values: enhancement, new-capability, optimization, ui-improvement, integration
- Add priorityLevelEnum schema with values: low, medium, high, critical
- Add suggestFeatureInputSchema with fields: pageOrComponent, featureType, priorityLevel, additionalContext
- Add suggestFeatureOutputSchema for parsing Claude response
- Add suggestionResultSchema for individual suggestion items
- Export all schemas with proper TypeScript types using z.infer

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Schemas properly typed and exported
- [ ] Enums match slash command requirements
- [ ] All validation commands pass
- [ ] Schemas integrate with existing validation file structure

---

### Step 4: Create Suggestion Results Dialog Component

**What**: Build dialog component to display AI-generated feature suggestions
**Why**: Provides user-friendly interface for viewing suggestions, follows Radix UI patterns from existing dialogs
**Confidence**: High

**Files to Create:**

- `src/app/(app)/feature-planner/components/feature-suggestion-dialog.tsx` - Dialog component for displaying suggestions

**Changes:**

- Use existing Dialog component from src/components/ui/dialog.tsx
- Accept props: isOpen, onClose, suggestions array, isLoading, error
- Display loading state with spinner when isLoading is true
- Show error message if error exists
- Render suggestions list with: feature title, rationale, implementation considerations
- Add action buttons: Close, Copy to Clipboard, Save Suggestion (optional)
- Style with Tailwind CSS 4 following project patterns
- Make dialog scrollable for long suggestion lists

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Dialog renders without errors
- [ ] Loading and error states display correctly
- [ ] Suggestions formatted in readable structure
- [ ] All validation commands pass
- [ ] Component follows React 19 patterns (no forwardRef)

---

### Step 5: Add AI Suggest Feature Button to Request Input Component

**What**: Add prominent button to trigger feature suggestion flow in the request input UI
**Why**: Provides user entry point for AI suggestions, integrates seamlessly into existing workflow
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/feature-planner/components/request-input.tsx` - Add suggestion trigger button

**Changes:**

- Import use-suggest-feature hook and feature-suggestion-dialog component
- Add "AI Suggest Feature" button in button layout section (lines 88-103)
- Position button between existing action buttons with consistent styling
- Add icon from Lucide React (Sparkles or Lightbulb)
- Wire button onClick to open suggestion dialog
- Pass current context (page/component name from form state) to hook
- Add tooltip explaining AI suggestion feature
- Ensure button is disabled when user lacks permissions

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Button renders in appropriate location
- [ ] Button styling matches existing buttons
- [ ] onClick handler properly wired to hook
- [ ] All validation commands pass
- [ ] Button respects authentication state

---

### Step 6: Create Suggestion Parameter Form Component

**What**: Build form to collect parameters before invoking slash command
**Why**: Allows users to specify context, feature type, and priority for better AI suggestions
**Confidence**: High

**Files to Create:**

- `src/app/(app)/feature-planner/components/feature-suggestion-form.tsx` - Form component for suggestion parameters

**Changes:**

- Use TanStack Form for form handling
- Add fields: pageOrComponent (text input), featureType (select), priorityLevel (select), additionalContext (textarea)
- Use validation schemas from step 3
- Style with Tailwind CSS 4 following project form patterns
- Add submit button that triggers suggestion action
- Display loading state during submission
- Pre-populate pageOrComponent from current context if available
- Include helpful placeholder text for each field

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Form validates input using Zod schemas
- [ ] All fields render with proper styling
- [ ] Submit triggers suggestion action correctly
- [ ] All validation commands pass
- [ ] Form follows TanStack Form patterns

---

### Step 7: Integrate Form and Dialog in Suggestion Flow

**What**: Connect parameter form and results dialog into complete user flow
**Why**: Creates seamless experience from parameter input to suggestion display
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/feature-planner/components/request-input.tsx` - Update to integrate form and dialog flow

**Changes:**

- Import feature-suggestion-form component
- Modify dialog to show form in first step, results in second step
- Add state to track flow stage: form-input, loading, results-display
- Wire form submission to server action call
- Handle successful response by transitioning to results-display stage
- Add back button on results to return to form
- Ensure dialog closes properly and resets state on close

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Flow transitions correctly between stages
- [ ] Form submission triggers loading state
- [ ] Results display after successful response
- [ ] All validation commands pass
- [ ] Dialog state resets on close

---

### Step 8: Add Optional Suggestion Persistence

**What**: Extend database schema and actions to optionally save AI suggestions
**Why**: Enables tracking suggestion history, allows users to reference past suggestions, supports analytics
**Confidence**: Medium

**Files to Modify:**

- `src/lib/db/schema/feature-planner.schema.ts` - Add feature suggestions table
- `src/lib/actions/feature-planner/feature-planner.actions.ts` - Add save suggestion action
- `src/lib/queries/feature-planner/feature-planner.query.ts` - Add query functions for suggestions
- `src/lib/facades/feature-planner/feature-planner.facade.ts` - Add business logic for suggestions

**Changes:**

- Create featureSuggestions table in schema with fields: id, requestId (optional FK), userId, pageOrComponent, featureType, priorityLevel, suggestionText, rawResponse, createdAt
- Add indexes on userId and createdAt for query performance
- Generate and run database migration
- Add saveSuggestionAction server action using authActionClient
- Add getSuggestionsForUserQuery and getSuggestionByIdQuery functions
- Add facade methods: saveSuggestion, getUserSuggestions, deleteSuggestion
- Implement proper error handling and validation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run db:generate
npm run db:migrate
```

**Success Criteria:**

- [ ] Schema change generates clean migration
- [ ] Migration runs successfully on development branch
- [ ] Server actions properly save suggestions
- [ ] Queries retrieve saved suggestions correctly
- [ ] All validation commands pass
- [ ] Database operations logged per project conventions

---

### Step 9: Add Suggestion History View Component

**What**: Create component to display saved suggestion history
**Why**: Allows users to review past AI suggestions, improves feature planning workflow
**Confidence**: Medium

**Files to Create:**

- `src/app/(app)/feature-planner/components/suggestion-history.tsx` - Component for displaying suggestion history

**Changes:**

- Use TanStack Query to fetch user's suggestion history
- Display suggestions in table or card layout using TanStack React Table
- Show key fields: date, page/component, feature type, priority, preview of suggestion
- Add click handler to view full suggestion details
- Include filter and sort options by date, feature type, priority
- Add delete button for each suggestion (with confirmation)
- Style with Tailwind CSS 4 following existing table patterns
- Show empty state when no suggestions exist

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] History loads and displays correctly
- [ ] TanStack Query manages data fetching
- [ ] Filters and sorting work properly
- [ ] All validation commands pass
- [ ] Component follows React 19 patterns

---

### Step 10: Add Permission Checks and Error Handling

**What**: Implement authentication checks and comprehensive error handling for suggestion feature
**Why**: Ensures only authorized users access AI suggestions, provides graceful error recovery
**Confidence**: High

**Files to Modify:**

- `src/lib/actions/feature-planner/feature-planner.actions.ts` - Add permission checks to suggestion actions
- `src/app/(app)/feature-planner/components/feature-suggestion-dialog.tsx` - Enhance error display
- `src/app/(app)/feature-planner/hooks/use-suggest-feature.ts` - Add error handling logic

**Changes:**

- Add Clerk permission check in suggestFeatureAction using getUserId()
- Verify user has feature planner access role
- Add rate limiting for suggestion requests (use existing patterns)
- Enhance dialog to show specific error messages: auth errors, rate limit errors, Claude API errors, network errors
- Add retry mechanism in hook for transient failures
- Log errors to Sentry with appropriate context
- Show user-friendly error messages with actionable guidance
- Add fallback for when slash command is unavailable

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Unauthorized users cannot invoke suggestions
- [ ] Rate limiting prevents abuse
- [ ] Errors display helpful messages
- [ ] All validation commands pass
- [ ] Error handling follows project patterns

---

### Step 11: Add Loading States and Progress Indicators

**What**: Implement loading states throughout suggestion flow with progress indicators
**Why**: Provides feedback during potentially long-running AI operations, improves UX
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/feature-planner/components/feature-suggestion-form.tsx` - Add form submission loading state
- `src/app/(app)/feature-planner/components/feature-suggestion-dialog.tsx` - Add loading animations
- `src/app/(app)/feature-planner/hooks/use-suggest-feature.ts` - Track loading stages

**Changes:**

- Add loading spinner to form submit button when processing
- Disable form inputs during submission
- Show progress indicator in dialog during AI generation (use existing workflow-progress patterns)
- Add loading stage labels: Analyzing context, Generating suggestions, Processing results
- Use Lucide React icons for loading states
- Add skeleton loaders for suggestion list while loading
- Ensure loading states are accessible with proper ARIA labels
- Add timeout handling for long-running requests

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Loading states display at appropriate times
- [ ] Progress indicators show current stage
- [ ] UI remains responsive during loading
- [ ] All validation commands pass
- [ ] Accessibility requirements met

---

### Step 12: Add Integration Tests

**What**: Create integration tests for feature suggestion flow
**Why**: Ensures reliability, catches regressions, validates complete user flow
**Confidence**: Medium

**Files to Create:**

- `tests/integration/feature-planner/suggest-feature.test.tsx` - Integration tests for suggestion feature

**Changes:**

- Test complete flow: button click, form submission, dialog display, results rendering
- Mock Claude SDK responses using MSW
- Test error scenarios: auth failure, API errors, network errors
- Test permission checks and rate limiting
- Test suggestion persistence if implemented
- Test loading states and transitions
- Use Testing Library for component testing
- Use Testcontainers for database operations if testing persistence
- Follow existing test patterns from feature planner tests

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run test
```

**Success Criteria:**

- [ ] All tests pass successfully
- [ ] Test coverage includes happy path and error cases
- [ ] Tests follow existing patterns
- [ ] All validation commands pass
- [ ] Tests run in CI environment

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Integration tests pass with `npm run test`
- [ ] Database migrations run successfully on development branch
- [ ] Manual testing verifies complete user flow
- [ ] Claude slash command invocation works end-to-end
- [ ] Error handling tested with various failure scenarios
- [ ] Permission checks verified with different user roles
- [ ] Loading states display correctly during operations
- [ ] Dialog UI matches existing design patterns
- [ ] No console errors or warnings in browser
- [ ] Accessibility checked with screen reader

## Notes

### Assumptions Requiring Confirmation

- Assumption: @anthropic-ai/claude-agent-sdk is already configured with API keys in environment
- Assumption: /suggest-feature slash command accepts parameters in format: `/suggest-feature [page] [type] [priority]`
- Assumption: Users accessing feature planner already have necessary permissions (no new roles needed)
- Assumption: Cloudinary or similar is available if suggestions include images (unlikely but possible)

### Risk Mitigation

- **Medium Risk**: Claude API rate limits could cause failures during high usage - mitigated by implementing client-side rate limiting and queueing
- **Medium Risk**: Slash command response format may vary - mitigated by robust parsing with fallbacks
- **Low Risk**: Dialog performance with large suggestion responses - mitigated by pagination or truncation

### Architecture Decisions

- **High Confidence**: Three-layer architecture (Actions → Facades → Queries) maintains consistency with existing codebase
- **High Confidence**: TanStack Query for state management follows project patterns
- **Medium Confidence**: Optional persistence adds value but increases complexity - can be deferred to phase 2 if needed

### Implementation Order Notes

- Steps 1-7 form the core MVP and should be completed first
- Steps 8-9 (persistence and history) are optional enhancements
- Steps 10-12 (polish and testing) can run in parallel with steps 8-9

### Alternative Approaches Considered

- Using Popover instead of Dialog - rejected because suggestions content is substantial and needs modal focus
- Direct Claude SDK call from client - rejected due to API key security concerns
- WebSocket for real-time streaming - deferred to future enhancement, not required for MVP

---

## Orchestration Details

**Orchestration Logs**: `docs/2025_10_13/orchestration/suggest-feature-integration/`

- `00-orchestration-index.md` - Workflow overview and navigation
- `01-feature-refinement.md` - Detailed refinement log with AI analysis
- `02-file-discovery.md` - Comprehensive file discovery with 25 files identified
- `03-implementation-planning.md` - Planning step log with validation results

**Total Execution Time**: ~6 minutes (360 seconds)

- Step 1 (Refinement): 90 seconds
- Step 2 (File Discovery): 135 seconds
- Step 3 (Planning): 150 seconds
