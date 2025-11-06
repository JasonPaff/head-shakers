# Step 3: Implementation Planning

## Metadata

- **Step**: 3 of 3
- **Status**: ✅ Completed
- **Started**: 2025-10-25T00:03:45Z
- **Completed**: 2025-10-25T00:06:15Z
- **Duration**: 150 seconds
- **Subagent**: implementation-planner
- **Output Format**: Markdown ✅

## Input Context

**Refined Feature Request** (from Step 1):
[449-word refined feature request with comprehensive technical details]

**File Discovery Analysis** (from Step 2):

- 45 files discovered across 4 priority levels
- 12 CRITICAL files requiring modification
- Modal dialog approach recommended
- Layered architecture pattern identified
- Collection edit dialog pattern for reference

## Agent Prompt

```
Generate a detailed implementation plan in MARKDOWN format (NOT XML) following your defined template with these sections: ## Overview (with Estimated Duration, Complexity, Risk Level), ## Quick Summary, ## Prerequisites, ## Implementation Steps (each step with What/Why/Confidence/Files/Changes/Validation Commands/Success Criteria), ## Quality Gates, ## Notes.

IMPORTANT:
- Include 'npm run lint:fix && npm run typecheck' validation for every step touching JS/JSX/TS/TSX files
- Do NOT include code examples or implementations
- Output must be MARKDOWN format only

[Complete refined feature request, file discovery analysis, architecture patterns, and project context provided]
```

## Plan Generation Results

### Format Validation

| Check                         | Status  | Result                                |
| ----------------------------- | ------- | ------------------------------------- |
| Output Format                 | ✅ Pass | Markdown format confirmed (not XML)   |
| Template Compliance           | ✅ Pass | All required sections present         |
| Section: Overview             | ✅ Pass | Includes duration, complexity, risk   |
| Section: Quick Summary        | ✅ Pass | Concise feature summary               |
| Section: Prerequisites        | ✅ Pass | Pre-implementation checklist          |
| Section: Implementation Steps | ✅ Pass | 12 detailed steps                     |
| Section: Quality Gates        | ✅ Pass | Validation criteria defined           |
| Section: Notes                | ✅ Pass | Assumptions and considerations        |
| Validation Commands           | ✅ Pass | Every step includes lint/typecheck    |
| No Code Examples              | ✅ Pass | Instructions only, no implementations |

### Plan Statistics

- **Total Steps**: 12 steps
- **Estimated Duration**: 2-3 days
- **Complexity Level**: Medium
- **Risk Assessment**: Medium
- **Files to Modify**: 9 existing files
- **Files to Create**: 1 new file
- **Validation Commands**: Included in all 12 steps

### Implementation Approach

**Strategy**: Modal Dialog Edit (matches collection pattern)
**Architecture**: Layered (Schema → Validation → Query → Facade → Action → UI)
**Key Patterns**:

- Update schema extends insert schema with ID
- Ownership validation in facade layer
- Photo management via CloudinaryService
- Cache invalidation on successful update
- TanStack Form with useAppForm hook

## Step Breakdown Analysis

### Backend Steps (Steps 1-6)

**Duration**: 1-1.5 days
**Focus**: Data layer, validation, business logic

1. **Validation Schemas** - Foundation for type-safe updates
2. **Query Layer** - Database update operations
3. **Facade Layer** - Business logic and authorization
4. **Server Action** - Authenticated entry point
5. **Constants** - Operation naming consistency
6. **Cache Service** - UI refresh coordination

### Frontend Steps (Steps 7-9)

**Duration**: 1-1.5 days
**Focus**: UI components, user interactions

7. **Edit Dialog Component** - Main UI component
8. **Header Integration** - Primary entry point
9. **Optimistic Updates** - Enhanced UX

### Polish Steps (Steps 10-12)

**Duration**: 0.5-1 day
**Focus**: Error handling, photos, additional entry points

10. **Error Handling** - Robust failure scenarios
11. **Photo Management** - Complex upload/delete/reorder flow
12. **Secondary Entry Points** - Additional access points

## Quality Gates Summary

**Code Quality Gates**:

- TypeScript compilation passes
- ESLint passes with auto-fixes
- No ts-ignore or eslint-disable comments

**Functional Gates**:

- Authorization prevents unauthorized edits
- Photo transitions work correctly
- Cache invalidation refreshes all views
- Edit dialog matches design patterns

**UX Gates**:

- Success/error notifications display
- Optimistic updates provide responsiveness
- Loading states show during operations

## Risk Assessment

### High-Risk Areas Identified

1. **Photo Management** (Step 11)
   - Complex temp-to-permanent transitions
   - Cleanup of orphaned photos
   - Requires careful testing

2. **Cache Invalidation** (Step 6)
   - Must cover all views displaying bobblehead data
   - Detail page, collections, search results
   - Verify comprehensive coverage

3. **Authorization** (Step 3)
   - Consistent checks across all layers
   - Prevent unauthorized edits
   - Test owned vs non-owned scenarios

### Mitigation Strategies

- **Photo Management**: Follow existing CloudinaryService patterns, test all photo operations
- **Cache Invalidation**: Reference onCreate patterns, verify all cache paths
- **Authorization**: Implement at facade layer, test with different user scenarios

## Critical Assumptions

1. **Photo Flow**: Cloudinary service implementation matches assumptions
2. **Collection Views**: File paths need verification during implementation
3. **Toast Notifications**: Service usage matches existing patterns
4. **TanStack Query**: Cache invalidation patterns align with setup

## Testing Strategy

**Manual Testing Scenarios**:

- Edit owned bobblehead (happy path)
- Attempt to edit non-owned bobblehead (authorization)
- Add/delete/reorder photos (photo management)
- Submit with validation errors (field validation)
- Submit with network failure (error handling)
- Verify updates appear in detail page (cache invalidation)
- Verify updates appear in collection list (cache invalidation)

**Automated Testing** (recommended but not in plan):

- Unit tests for validation schemas
- Integration tests for query/facade layers
- E2E tests for edit dialog flow

## Performance Considerations

1. **Large Photos**: Progress indicators for uploads
2. **Slow Networks**: Optimistic updates handle gracefully
3. **Query Refetch**: Minimize unnecessary network calls

## Plan Validation Results

| Validation          | Status  | Notes                                                 |
| ------------------- | ------- | ----------------------------------------------------- |
| Format Check        | ✅ Pass | Markdown format (not XML)                             |
| Template Adherence  | ✅ Pass | All sections present                                  |
| Step Details        | ✅ Pass | What/Why/Confidence/Files/Changes/Validation/Criteria |
| Validation Commands | ✅ Pass | Every step includes lint/typecheck                    |
| No Code Examples    | ✅ Pass | Instructions only                                     |
| Actionable Steps    | ✅ Pass | Clear implementation guidance                         |
| Complete Coverage   | ✅ Pass | Addresses all aspects of refined request              |
| Pattern Alignment   | ✅ Pass | Follows discovered architecture patterns              |

## Integration with Discovered Files

Plan properly references all CRITICAL files from Step 2:

| File                          | Step | Action                        |
| ----------------------------- | ---- | ----------------------------- |
| bobbleheads.validation.ts     | 1    | Add update schemas            |
| bobbleheads-query.ts          | 2    | Add updateAsync method        |
| bobbleheads.facade.ts         | 3    | Add update business logic     |
| bobbleheads.actions.ts        | 4    | Add update server action      |
| action-names.ts               | 5    | Complete UPDATE constant      |
| operations.ts                 | 5    | Complete UPDATE constant      |
| cache-revalidation.service.ts | 6    | Add onUpdate method           |
| bobblehead-edit-dialog.tsx    | 7    | Create edit dialog (new file) |
| bobblehead-header.tsx         | 8    | Wire edit button              |

## Complexity Assessment

### Medium Complexity Justification

**Factors Increasing Complexity**:

- Photo management with temp-to-permanent transitions
- Multiple form fields with various validation rules
- Cache invalidation across multiple views
- Authorization checks at multiple layers

**Factors Decreasing Complexity**:

- Existing patterns to follow (collection edit dialog)
- Well-defined architecture layers
- Reusable form components from add flow
- Established Cloudinary integration

**Overall**: Medium complexity appropriate for 2-3 day estimate

## Next Steps

1. Review generated implementation plan
2. Save plan to `docs/2025_10_25/plans/` directory
3. Update orchestration index with completion summary
4. Present plan to user for approval
5. Begin implementation following step-by-step guide

## Agent Response (Full Plan)

[Complete markdown implementation plan included below in Final Output section]
