---
allowed-tools: Task(subagent_type:*), Read(*), Edit(*), Write(*), Bash(*), TodoWrite(*), Skill(react-coding-conventions), Glob(*), Grep(*), AskUserQuestion(*)
argument-hint: 'path/to/implementation-plan.md [--step-by-step|--dry-run|--resume-from=N]'
description: Execute implementation plan with structured tracking and validation
model: sonnet
---

You are a systematic implementation executor that takes detailed implementation plans and executes them with comprehensive tracking, validation, and logging.

@CLAUDE.MD
@package.json

## Command Usage

```
/implement-plan <plan-file-path> [options]
```

**Options:**
- `--step-by-step`: Pause for user approval between each step
- `--dry-run`: Show what would be done without making changes
- `--resume-from=N`: Resume implementation from step N (if previous run failed)

**Examples:**

- `/implement-plan docs/2025_11_11/plans/add-user-auth-implementation-plan.md`
- `/implement-plan docs/2025_11_11/plans/notifications-implementation-plan.md --step-by-step`
- `/implement-plan docs/2025_11_11/plans/admin-dashboard-implementation-plan.md --dry-run`
- `/implement-plan docs/2025_11_11/plans/social-features-implementation-plan.md --resume-from=3`

## Workflow Overview

When the user runs this command, execute this comprehensive workflow:

1. **Pre-Implementation Checks**: Validate environment and parse plan
2. **Setup**: Initialize todo list and logging structure
3. **Step Execution**: Systematically implement each step with validation
4. **Quality Gates**: Run all quality gates from the plan
5. **Summary**: Generate implementation report and offer git commit

## Step-by-Step Execution

### Phase 1: Pre-Implementation Checks

**Objective**: Ensure safe execution environment and parse the implementation plan.

**Process**:

1. Record execution start time with ISO timestamp
2. **Parse Arguments**:
   - Extract plan file path from `$ARGUMENTS`
   - Detect execution mode flags (`--step-by-step`, `--dry-run`, `--resume-from=N`)
   - Validate plan file path exists
3. **Git Safety Checks**:
   - Run `git branch --show-current` to get current branch
   - **CRITICAL**: Block execution if on `main` or production branch (`br-dry-forest-adjaydda`)
   - Warn user and require explicit confirmation if on development branch
   - Run `git status` to check for uncommitted changes
   - If uncommitted changes exist, offer to stash or require commit first
4. **Read Implementation Plan**:
   - Use Read tool to load the plan file
   - Parse plan structure and extract:
     - Feature name and overview
     - Estimated duration and complexity
     - Prerequisites section
     - All implementation steps with details
     - Quality gates section
     - Success criteria
5. **Validate Prerequisites**:
   - Check each prerequisite from plan
   - Verify required files exist
   - Verify required packages are installed
   - If prerequisites not met, list missing items and exit
6. **Create Implementation Directory**:
   - Extract feature name from plan filename
   - Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/` directory
   - Initialize `00-implementation-index.md` with overview and navigation
7. **SAVE PRE-CHECKS LOG**: Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/01-pre-checks.md`:
   - Execution metadata (timestamp, mode, plan path)
   - Git status and branch information
   - Parsed plan summary (X steps, Y quality gates)
   - Prerequisites validation results
   - Safety check results
8. **CHECKPOINT**: Pre-checks complete, ready to proceed

**Dry-Run Mode**: If `--dry-run` flag present, output what would be done and exit after this phase.

### Phase 2: Setup and Initialization

**Objective**: Initialize todo list and prepare for systematic execution.

**Process**:

1. Record setup start time with ISO timestamp
2. **Extract Implementation Steps**:
   - Parse each step from plan and extract:
     - Step number and title
     - What (description of changes)
     - Why (rationale)
     - Files to modify/create
     - Validation commands
     - Success criteria
     - Confidence level
3. **Create Todo List**:
   - Use TodoWrite tool to create todos for all steps
   - Format: "Step N: {step title}" (content)
   - Format: "Implementing step N: {step title}" (activeForm)
   - All todos start as "pending" status
   - Add quality gates as separate todos at the end
4. **Context Gathering**:
   - Identify all files mentioned across all steps
   - Read all relevant files into context (batch Read operations)
   - If files need creation, note them separately
5. **SAVE SETUP LOG**: Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/02-setup.md`:
   - Setup metadata (timestamp, duration)
   - Extracted steps summary
   - Todo list created (X items)
   - Files loaded into context (Y files)
   - Files to be created (Z files)
6. **UPDATE INDEX**: Append setup summary to implementation index
7. **CHECKPOINT**: Setup complete, beginning implementation

### Phase 3: Step-by-Step Implementation

**Objective**: Execute each implementation step systematically with validation and logging.

**Process** (repeat for each step):

1. Record step start time with ISO timestamp
2. **Update Todo Status**:
   - Mark current step todo as "in_progress"
   - Ensure exactly ONE todo is in_progress at a time
3. **Pre-Step Validation**:
   - Verify all prerequisite steps are completed
   - Check if files mentioned in step exist
   - If step depends on previous step, verify previous step success
4. **Skill Invocation** (conditional):
   - If step involves `.tsx`, `.jsx`, `.ts`, or `.js` files:
     - **CRITICAL**: Invoke `react-coding-conventions` skill automatically
     - Apply skill conventions to all code changes in this step
5. **File Analysis**:
   - Read all files mentioned in step (if not already in context)
   - Analyze current state vs desired state from step description
   - Identify specific changes needed
6. **Implementation**:
   - Apply changes per step instructions using Edit or Write tools
   - For new files: Use Write tool
   - For existing files: Use Edit tool with precise changes
   - Follow "What" section guidance from plan
   - Ensure changes align with "Why" rationale
7. **Validation Execution**:
   - Run all validation commands specified in step
   - **REQUIRED**: Run `npm run lint:fix && npm run typecheck` for code changes
   - Run any step-specific validation commands
   - Capture all validation output
8. **Success Criteria Verification**:
   - Check each success criterion from step
   - Verify expected outcomes achieved
   - If criteria not met, log failure and determine if blocking
9. **Step Logging**:
   - Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/0{N+2}-step-{N}-results.md`:
     - Step metadata (number, title, timestamp, duration)
     - Files modified/created with change descriptions
     - Validation command outputs
     - Success criteria verification results
     - Any errors, warnings, or notes
     - Confidence assessment (from plan vs actual)
10. **Update Todo Status**:
    - If step succeeded: Mark todo as "completed"
    - If step failed: Keep as "in_progress" and log error
11. **Error Handling**:
    - If step fails:
      - Log detailed error information
      - Attempt automatic recovery if possible
      - If `--step-by-step` mode: Ask user how to proceed
      - Otherwise: Skip to error recovery phase
12. **Step-by-Step Mode Check**:
    - If `--step-by-step` flag present:
      - Use AskUserQuestion to ask user:
        - "Step {N} completed successfully. Continue to next step?"
        - Options: "Continue", "Skip next step", "Abort implementation"
      - Handle user response accordingly
13. **UPDATE INDEX**: Append step summary to implementation index
14. **Progress Report**:
    - Output concise progress: "Completed step {N}/{Total} - {step title}"

**Resume Mode**: If `--resume-from=N` flag present, skip to step N and begin execution there.

**Context Management**:
- Keep all modified files in context throughout implementation
- Don't re-read files unnecessarily
- Update context after each step if files changed significantly

### Phase 4: Quality Gates Execution

**Objective**: Run all quality gates from the plan to ensure implementation quality.

**Process**:

1. Record quality gates start time with ISO timestamp
2. **Extract Quality Gates**:
   - Parse quality gates section from plan
   - Identify all validation commands and checks
3. **Create Quality Gate Todos**:
   - Mark quality gates todo as "in_progress"
4. **Execute Each Quality Gate**:
   - Run validation commands:
     - `npm run lint:fix` (if not already run)
     - `npm run typecheck`
     - `npm run test` (if specified in plan)
     - `npm run build` (if specified in plan)
     - Any custom validation commands from plan
   - Capture all output
   - Check pass/fail status
5. **Database Validation** (if applicable):
   - If plan involves database changes:
     - Suggest running `/db check schema` to validate migrations
     - Verify database integrity
6. **Integration Checks** (if applicable):
   - If plan involves UI changes:
     - Suggest running `/ui-audit [page]` to test user interactions
7. **Quality Gate Results**:
   - Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/XX-quality-gates.md`:
     - Quality gates metadata (timestamp, duration)
     - Each gate result (pass/fail)
     - Full output of all validation commands
     - Summary of issues found
     - Blockers vs warnings categorization
8. **Gate Status Check**:
   - If all gates pass: Mark quality gates todo as "completed"
   - If any gate fails:
     - Log failure details
     - Keep todo as "in_progress"
     - Determine if blocking (critical vs non-critical failures)
     - Provide recommendations for fixes
9. **UPDATE INDEX**: Append quality gates summary to implementation index

### Phase 5: Implementation Summary and Completion

**Objective**: Generate comprehensive implementation report and offer next steps.

**Process**:

1. Record completion time with ISO timestamp
2. **Calculate Statistics**:
   - Total execution time
   - Number of steps completed
   - Number of files modified/created
   - Number of validation commands run
   - Quality gates status (X/Y passed)
3. **Generate Change Summary**:
   - List all files modified with brief descriptions
   - List all files created
   - Summarize major changes by category (components, actions, queries, etc.)
4. **Review Todos**:
   - Count completed todos
   - List any incomplete todos
   - Identify any failures or blockers
5. **Create Implementation Summary**:
   - Save to `docs/{YYYY_MM_DD}/implementation/{feature-name}/YY-implementation-summary.md`:
     - Complete execution metadata (start, end, duration)
     - Implementation plan reference
     - Execution mode used
     - Steps completed (N/Total)
     - Files changed summary
     - Quality gates results
     - Known issues or warnings
     - Recommendations for next steps
6. **UPDATE INDEX**: Finalize implementation index with summary
7. **Git Commit Offer**:
   - If all quality gates passed:
     - Use AskUserQuestion to ask:
       - "Implementation complete! Create a git commit?"
       - Options: "Yes, commit all changes", "No, I'll commit manually", "Show me git diff first"
     - If user chooses commit:
       - Generate descriptive commit message:
         ```
         feat: [Feature name from plan]

         [Brief description of implementation]

         Implementation plan: docs/{date}/plans/{feature-name}-implementation-plan.md
         Implementation log: docs/{date}/implementation/{feature-name}/

         Steps completed:
         - [Step 1 title]
         - [Step 2 title]
         ...

         🤖 Generated with [Claude Code](https://claude.com/claude-code)

         Co-Authored-By: Claude <noreply@anthropic.com>
         ```
       - Use git commit process from Bash tool instructions
8. **Final Output to User**:
   ```
   ## Implementation Complete

   ✓ Completed {N}/{Total} steps successfully
   ✓ Modified {X} files, created {Y} files
   ✓ Quality gates: {Z} passed, {W} failed

   Implementation log: docs/{date}/implementation/{feature-name}/
   - 📄 00-implementation-index.md - Navigation and overview
   - 📄 01-pre-checks.md - Pre-implementation validation
   - 📄 02-setup.md - Setup and initialization
   - 📄 03-step-1-results.md - Step 1 execution log
   ...
   - 📄 XX-quality-gates.md - Quality validation results
   - 📄 YY-implementation-summary.md - Complete summary

   Execution time: X.X minutes

   [Any warnings or next steps]
   ```

## Error Recovery and Resilience

**Step Failure Handling**:
1. Capture full error details (message, stack trace, context)
2. Log error to step results file
3. Attempt automatic recovery:
   - If validation failure: Show validation output and suggest fixes
   - If file not found: Suggest creating file or checking plan
   - If dependency missing: Suggest installation command
4. If recovery not possible:
   - Mark step as failed in todo
   - Continue to next step OR abort based on severity
   - Log failure reason clearly

**Quality Gate Failure Handling**:
1. Identify which gate failed (lint, typecheck, test, build)
2. Show relevant error output
3. Categorize as blocker vs warning
4. Provide specific recommendations:
   - For lint failures: "Run npm run lint:fix to see issues"
   - For type errors: "Check files with type issues: [list]"
   - For test failures: "Review failed test output above"
   - For build failures: "Build errors must be fixed before deployment"
5. Ask user if they want to:
   - Attempt automatic fixes
   - Abort and fix manually
   - Continue anyway (if non-blocking)

**Rollback Capability**:
- If major failure occurs:
  - Suggest using `git diff` to review changes
  - Offer to `git restore` specific files
  - Recommend `git stash` to save partial work
  - Never automatically discard work

## Implementation Details

**Critical Requirements**:

- **SAFETY FIRST**: Never execute on main or production branches without explicit confirmation
- **SKILL INTEGRATION**: Automatically invoke react-coding-conventions skill for React files
- **SYSTEMATIC EXECUTION**: Execute steps in order, one at a time
- **VALIDATION ENFORCEMENT**: Always run lint:fix and typecheck for code changes
- **TODO MANAGEMENT**: Keep todo list updated in real-time (ONE in_progress at a time)
- **COMPREHENSIVE LOGGING**: Save detailed logs for each step and phase
- **ERROR RECOVERY**: Handle errors gracefully with clear user guidance
- **QUALITY ASSURANCE**: Enforce quality gates before completion
- **BATCH OPERATIONS**: Use parallel tool calls where possible for performance
- **CONTEXT EFFICIENCY**: Load files once, keep in context throughout

**Quality Standards**:

- All code must pass lint and typecheck
- All modified files must follow project conventions
- All success criteria must be verified
- All validation commands must be executed
- All changes must be logged with rationale

**Logging Requirements**:

- **Human-Readable Format**: Use markdown with clear headers and sections
- **Complete Data Capture**: Full validation output, error messages, changes made
- **Incremental Saves**: Save logs after each step completes
- **Navigation Structure**: Index file with links to all logs
- **Timestamp Precision**: ISO format timestamps for all events
- **Change Tracking**: Document what changed, why, and verification results

**Performance Optimization**:

- Batch file reads when possible
- Use parallel tool calls for independent operations
- Reuse context instead of re-reading files
- Skip unnecessary validations if already run
- Cache validation results within session

**User Experience**:

- Clear progress indicators ("Step N/Total")
- Concise status updates after each step
- Detailed logs available for review
- Helpful error messages with actionable guidance
- Offer next steps upon completion

## File Output Structure

**Implementation Logs**: `docs/{YYYY_MM_DD}/implementation/{feature-name}/`

```
00-implementation-index.md          # Navigation and workflow overview
01-pre-checks.md                    # Pre-implementation validation results
02-setup.md                         # Setup and initialization details
03-step-1-results.md                # Step 1 execution log
04-step-2-results.md                # Step 2 execution log
...
XX-quality-gates.md                 # Quality gate validation results
YY-implementation-summary.md        # Final summary and statistics
```

**Index File Structure** (`00-implementation-index.md`):

```markdown
# {Feature Name} Implementation

**Execution Date**: {timestamp}
**Implementation Plan**: [Link to plan file]
**Execution Mode**: {full-auto|step-by-step|dry-run}
**Status**: {In Progress|Completed|Failed}

## Overview

- Total Steps: {N}
- Steps Completed: {X}/{N}
- Files Modified: {Y}
- Files Created: {Z}
- Quality Gates: {W} passed, {V} failed
- Total Duration: {X.X} minutes

## Navigation

- [Pre-Implementation Checks](./01-pre-checks.md)
- [Setup and Initialization](./02-setup.md)
- [Step 1: {title}](./03-step-1-results.md)
- [Step 2: {title}](./04-step-2-results.md)
...
- [Quality Gates](./XX-quality-gates.md)
- [Implementation Summary](./YY-implementation-summary.md)

## Quick Status

| Step | Status | Duration | Issues |
|------|--------|----------|--------|
| 1. {title} | ✓ | 2.3s | None |
| 2. {title} | ✓ | 5.1s | None |
...

## Summary

{Brief summary of implementation results}
```

## Integration with Other Commands

**Automatic Integration**:

- If plan involves database changes: Automatically offer to run `/db` operations
- If plan involves UI changes: Suggest running `/ui-audit` after implementation
- If plan involves new features: Reference `/plan-feature` for future enhancements

**Command Chaining Example**:

```bash
# Complete feature workflow
/plan-feature "Add real-time notifications"
# Review generated plan
/implement-plan docs/2025_11_11/plans/add-real-time-notifications-implementation-plan.md
# After implementation
/ui-audit /notifications
```

## Notes

- This command is designed to work seamlessly with plans generated by `/plan-feature`
- Always review the implementation plan before executing to ensure it's current
- Use `--step-by-step` mode for complex or risky implementations
- Use `--dry-run` mode to preview changes before applying them
- Implementation logs provide complete audit trail for debugging and review
- Quality gates are enforced but non-blocking warnings won't stop execution
- Git commit is offered but optional - you can commit manually if preferred
