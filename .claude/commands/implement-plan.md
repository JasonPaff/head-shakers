---
allowed-tools: Task(subagent_type:general-purpose), Read(*), Write(*), Bash(git:*,mkdir:*,npm:*,cd:*), TodoWrite(*), AskUserQuestion(*)
argument-hint: 'path/to/implementation-plan.md [--step-by-step|--dry-run|--resume-from=N|--worktree]'
description: Execute implementation plan with structured tracking and validation using subagent architecture
model: sonnet
---

You are a lightweight implementation orchestrator that coordinates the execution of detailed implementation plans by delegating each step to specialized subagents. Your role is coordination, tracking, and logging - NOT direct implementation.

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
- `--worktree`: Create a new git worktree with feature branch for isolated development

**Examples:**

- `/implement-plan docs/2025_11_11/plans/add-user-auth-implementation-plan.md`
- `/implement-plan docs/2025_11_11/plans/notifications-implementation-plan.md --step-by-step`
- `/implement-plan docs/2025_11_11/plans/admin-dashboard-implementation-plan.md --dry-run`
- `/implement-plan docs/2025_11_11/plans/social-features-implementation-plan.md --resume-from=3`
- `/implement-plan docs/2025_11_11/plans/user-profile-implementation-plan.md --worktree`
- `/implement-plan docs/2025_11_11/plans/search-feature-implementation-plan.md --worktree --step-by-step`

## Architecture Overview

**Orchestrator Pattern**: This command uses an orchestrator + subagent architecture for scalability:

- **Main Orchestrator** (this command): Lightweight coordination, todo management, logging
- **Step Subagents**: Fresh context per step, handles actual implementation
- **Benefits**: No context overflow, scalable to 50+ step plans, better isolation

## Workflow Overview

When the user runs this command, execute this comprehensive workflow:

1. **Pre-Implementation Checks**: Validate environment and parse plan (orchestrator)
2. **Setup**: Initialize todo list and logging structure (orchestrator)
3. **Step Execution**: Launch subagent for each step (orchestrator delegates to subagents)
4. **Quality Gates**: Run validation commands (orchestrator or subagent)
5. **Summary**: Generate implementation report and offer git commit (orchestrator)

## Step-by-Step Execution

### Phase 1: Pre-Implementation Checks

**Objective**: Ensure safe execution environment and parse the implementation plan.

**Process**:

1. Record execution start time with ISO timestamp
2. **Parse Arguments**:
   - Extract plan file path from `$ARGUMENTS`
   - Detect execution mode flags (`--step-by-step`, `--dry-run`, `--resume-from=N`, `--worktree`)
   - Validate plan file path exists
3. **Worktree Setup** (if `--worktree` flag present):
   - Extract feature name from plan filename (e.g., `add-user-auth-implementation-plan.md` → `add-user-auth`)
   - Generate feature slug (lowercase, hyphens, no special chars)
   - Define worktree path: `.worktrees/{feature-slug}/`
   - Define branch name: `feat/{feature-slug}`
   - Ensure `.worktrees/` is in `.gitignore` (check and add if missing)
   - Check if worktree path already exists:
     - If exists: Error and ask user to remove existing worktree or use different plan name
     - If not exists: Continue
   - Run `git worktree add -b {branch-name} {worktree-path}`
   - Capture worktree creation output
   - Change working directory to worktree path: `cd {worktree-path}`
   - Run `npm install` to set up dependencies (with timeout 300 seconds)
   - Capture npm install output
   - Verify npm install succeeded
   - Log worktree setup details:
     - Worktree path (absolute)
     - Branch name
     - npm install status
     - Working directory changed to worktree
   - **IMPORTANT**: All subsequent operations (git commands, file operations, validation) will now run in worktree context
4. **Git Safety Checks**:
   - Run `git branch --show-current` to get current branch
   - **If worktree was created**: Branch will be new feature branch, skip production/main checks
   - **If worktree was NOT created**:
     - **CRITICAL**: Block execution if on `main`
     - Warn user and require explicit confirmation if on development branch
   - Run `git status` to check for uncommitted changes
   - If uncommitted changes exist, offer to stash or require commit first
5. **Read Implementation Plan**:
   - Use Read tool to load the plan file
   - Parse plan structure and extract:
     - Feature name and overview
     - Estimated duration and complexity
     - Prerequisites section
     - All implementation steps with details
     - Quality gates section
     - Success criteria
6. **Validate Prerequisites**:
   - Check each prerequisite from plan
   - Verify required files exist
   - Verify required packages are installed
   - If prerequisites not met, list missing items and exit
7. **Create Implementation Directory**:
   - Extract feature name from plan filename
   - Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/` directory
   - Initialize `00-implementation-index.md` with overview and navigation
8. **SAVE PRE-CHECKS LOG**: Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/01-pre-checks.md`:
   - Execution metadata (timestamp, mode, plan path)
   - Worktree details (if `--worktree` flag used):
     - Worktree path (absolute)
     - Feature branch name
     - npm install output and status
   - Git status and branch information
   - Parsed plan summary (X steps, Y quality gates)
   - Prerequisites validation results
   - Safety check results
9. **CHECKPOINT**: Pre-checks complete, ready to proceed

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
4. **Prepare Step Metadata**:
   - Store parsed step details for subagent delegation
   - Note files mentioned in each step (for subagent context)
   - Identify steps with dependencies on previous steps
5. **SAVE SETUP LOG**: Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/02-setup.md`:
   - Setup metadata (timestamp, duration)
   - Extracted steps summary (N steps identified)
   - Todo list created (N+1 items including quality gates)
   - Step dependency analysis
   - Files mentioned per step summary
6. **UPDATE INDEX**: Append setup summary to implementation index
7. **CHECKPOINT**: Setup complete, beginning implementation

**Orchestrator Note**: No files are loaded into context at this phase. Each subagent will load only the files it needs.

### Phase 3: Step-by-Step Implementation (Subagent Delegation)

**Objective**: Orchestrate execution of each step by delegating to subagents with fresh context.

**Architecture**: Each step runs in its own subagent with isolated context. The orchestrator coordinates, tracks progress, and aggregates results.

**Process** (repeat for each step):

1. Record step start time with ISO timestamp
2. **Update Todo Status**:
   - Mark current step todo as "in_progress"
   - Ensure exactly ONE todo is in_progress at a time
3. **Pre-Step Validation** (Orchestrator):
   - Verify all prerequisite steps are completed
   - If step depends on previous step, verify previous step success
   - Check if any blockers from previous steps
4. **Prepare Subagent Input** (Orchestrator):
   - Gather step details from parsed plan:
     - Step number and title
     - What (description of changes)
     - Why (rationale)
     - Files to modify/create (list of file paths)
     - Validation commands to run
     - Success criteria to verify
     - Confidence level
   - Include previous step summary (if dependent):
     - What was changed in previous step
     - Files modified/created
     - Any notes for this step
   - Detect if step involves React files (.tsx, .jsx, .ts, .js)
5. **Launch Step Subagent**:
   - Use Task tool with `subagent_type: "general-purpose"`
   - Description: "Implement step {N}: {step title}"
   - **CRITICAL**: Set timeout to 300 seconds (5 minutes) per step
   - **Subagent Prompt Template**:
     ```
     You are implementing Step {N} of an implementation plan with FRESH CONTEXT.

     Your task is to implement this step completely and return structured results.

     ## Step Details

     **Step**: {N}/{Total} - {Step Title}

     **What to do**:
     {What description from plan}

     **Why**:
     {Why rationale from plan}

     **Files to work with**:
     {List of file paths to modify or create}

     **Validation commands**:
     {List of validation commands to run}

     **Success criteria**:
     {List of success criteria to verify}

     **Confidence level**: {Confidence from plan}

     {IF DEPENDENT}
     **Previous step context**:
     Step {N-1} made these changes:
     {Previous step summary}
     {END IF}

     ## Instructions

     1. **Read Files**: Load all files mentioned above using the Read tool
     2. **Apply Conventions**: {IF React files detected}Invoke the react-coding-conventions skill FIRST before making any changes{END IF}
     3. **Implement Changes**:
        - Use Edit tool for existing files
        - Use Write tool for new files
        - Follow the "What" description exactly
        - Keep changes focused on this step only
     4. **Validation**:
        - Run ALL validation commands specified above
        - For code changes, MUST run: npm run lint:fix && npm run typecheck
        - Capture all validation output
     5. **Verify Success Criteria**: Check each criterion and note pass/fail
     6. **Return Structured Results**: At the end of your work, provide a clear summary in this format:

     ## STEP RESULTS

     **Status**: success | failure

     **Files Modified**:
     - path/to/file1.ts - Description of changes made
     - path/to/file2.tsx - Description of changes made

     **Files Created**:
     - path/to/newfile.ts - Description of file purpose

     **Validation Results**:
     - Command: npm run lint:fix && npm run typecheck
       Result: PASS | FAIL
       Output: {relevant output}
     - {other validation commands}

     **Success Criteria**:
     - [✓] Criterion 1: {description}
     - [✓] Criterion 2: {description}
     - [✗] Criterion 3: {description} - {reason for failure}

     **Errors/Warnings**: {any issues encountered}

     **Notes for Next Steps**: {anything important for subsequent steps}

     IMPORTANT:
     - Do NOT read files outside the list provided
     - Do NOT implement steps beyond this one
     - Do NOT skip validation commands
     - Focus ONLY on this step's requirements
     ```
6. **Subagent Execution** (Subagent performs):
   - Reads necessary files
   - Invokes react-coding-conventions skill if React files
   - Implements changes per step instructions
   - Runs validation commands
   - Verifies success criteria
   - Returns structured results to orchestrator
7. **Process Subagent Results** (Orchestrator):
   - Capture full subagent response
   - Parse structured results section
   - Extract:
     - Status (success/failure)
     - Files modified/created with descriptions
     - Validation command outputs
     - Success criteria verification
     - Errors/warnings
     - Notes for next steps
8. **Step Logging** (Orchestrator):
   - Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/0{N+2}-step-{N}-results.md`:
     - Step metadata (number, title, timestamp, duration)
     - Subagent input (what was asked)
     - Subagent output (full response)
     - Parsed results summary
     - Files modified/created
     - Validation results
     - Success criteria verification
     - Any errors or warnings
9. **Update Todo Status** (Orchestrator):
   - If step succeeded: Mark todo as "completed"
   - If step failed: Keep as "in_progress" and log error
10. **Error Handling** (Orchestrator):
    - If subagent times out:
      - Log timeout error
      - Mark step as failed
      - Continue or abort based on severity
    - If subagent returns failure:
      - Log detailed error information
      - Attempt to determine if blocking
      - If `--step-by-step` mode: Ask user how to proceed
      - Otherwise: Continue or abort based on severity
11. **Step-by-Step Mode Check** (Orchestrator):
    - If `--step-by-step` flag present:
      - Use AskUserQuestion to ask user:
        - "Step {N} completed {successfully/with errors}. Continue to next step?"
        - Options: "Continue", "Skip next step", "Retry this step", "Abort implementation"
      - Handle user response accordingly
12. **UPDATE INDEX** (Orchestrator): Append step summary to implementation index
13. **Progress Report** (Orchestrator):
    - Output concise progress: "Completed step {N}/{Total} - {step title}"

**Resume Mode**: If `--resume-from=N` flag present, skip to step N and begin execution there.

**Context Management**:
- **Orchestrator**: Maintains minimal context (parsed plan, step metadata, results summaries)
- **Subagents**: Each gets fresh context with only files needed for their step
- **Result**: Scalable to plans with 50+ steps without context overflow

### Phase 4: Quality Gates Execution

**Objective**: Run all quality gates from the plan to ensure implementation quality.

**Architecture**: Quality gates can run in orchestrator (simple) or delegated to subagent (complex tests).

**Process**:

1. Record quality gates start time with ISO timestamp
2. **Extract Quality Gates** (Orchestrator):
   - Parse quality gates section from plan
   - Identify all validation commands and checks
   - Assess complexity (simple commands vs complex test suites)
3. **Mark Quality Gate Todo** (Orchestrator):
   - Mark quality gates todo as "in_progress"
4. **Execute Quality Gates**:

   **Option A - Simple Validation** (Orchestrator runs directly):
   - For basic commands (lint, typecheck, build):
     - Run validation commands using Bash tool:
       - `npm run lint:fix` (if not already run)
       - `npm run typecheck`
       - `npm run build` (if specified in plan)
     - Capture all output
     - Check pass/fail status

   **Option B - Complex Testing** (Delegate to subagent):
   - For comprehensive test suites (unit, integration, e2e):
     - Use Task tool with `subagent_type: "general-purpose"`
     - Description: "Run quality gates and test suites"
     - **Subagent handles**: Running tests, analyzing failures, suggesting fixes
     - **Returns**: Test results, coverage reports, failure analysis

5. **Database Validation** (if applicable - Orchestrator):
   - If plan involves database changes:
     - Suggest running `/db check schema` to validate migrations
     - Verify database integrity
6. **Integration Checks** (if applicable - Orchestrator):
   - If plan involves UI changes:
     - Suggest running `/ui-audit [page]` to test user interactions
7. **Quality Gate Results** (Orchestrator):
   - Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/XX-quality-gates.md`:
     - Quality gates metadata (timestamp, duration)
     - Each gate result (pass/fail)
     - Full output of all validation commands
     - Test results (if applicable)
     - Summary of issues found
     - Blockers vs warnings categorization
8. **Gate Status Check** (Orchestrator):
   - If all gates pass: Mark quality gates todo as "completed"
   - If any gate fails:
     - Log failure details
     - Keep todo as "in_progress"
     - Determine if blocking (critical vs non-critical failures)
     - Provide recommendations for fixes
9. **UPDATE INDEX** (Orchestrator): Append quality gates summary to implementation index

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
8. **Worktree Cleanup** (if `--worktree` flag was used):
   - Use AskUserQuestion to ask user how to handle the worktree:
     - Question: "Implementation complete in worktree. How would you like to proceed?"
     - Options:
       1. "Merge to main branch and remove worktree" - Merges feature branch to original branch, removes worktree
       2. "Push branch and create PR" - Pushes feature branch to remote, offers to remove worktree
       3. "Keep worktree for testing" - Leaves worktree in place for manual testing/review
       4. "Remove worktree only" - Deletes worktree but keeps feature branch
   - **Option 1 - Merge and Remove**:
     - Change directory back to original working directory
     - Run `git checkout {original-branch}` (from pre-checks log)
     - Run `git merge feat/{feature-slug} --no-ff -m "Merge feature: {feature-name}"`
     - If merge successful:
       - Run `git worktree remove .worktrees/{feature-slug}`
       - Run `git branch -d feat/{feature-slug}` (delete feature branch)
       - Confirm merge and cleanup complete
     - If merge conflicts:
       - List conflict files
       - Offer to abort merge or let user resolve manually
   - **Option 2 - Push and PR**:
     - Ensure commit was made (from step 7)
     - Run `git push -u origin feat/{feature-slug}`
     - Offer to create PR using `gh pr create` (if gh CLI available)
     - Use AskUserQuestion to ask: "Remove worktree now or keep for testing?"
       - If "Remove": Run `git worktree remove .worktrees/{feature-slug}` from original directory
       - If "Keep": Leave worktree in place
   - **Option 3 - Keep Worktree**:
     - Output message: "Worktree kept at: {worktree-path}"
     - Provide instructions: "To return to worktree: cd {worktree-path}"
     - Provide cleanup command: "To remove later: git worktree remove {worktree-path}"
   - **Option 4 - Remove Worktree Only**:
     - Change directory back to original working directory
     - Run `git worktree remove .worktrees/{feature-slug}`
     - Output message: "Worktree removed. Feature branch 'feat/{feature-slug}' preserved."
     - Provide merge instruction: "To merge later: git merge feat/{feature-slug}"
   - Log worktree cleanup action to implementation summary
9. **Final Output to User**:
   ```
   ## Implementation Complete

   ✓ Completed {N}/{Total} steps successfully
   ✓ Modified {X} files, created {Y} files
   ✓ Quality gates: {Z} passed, {W} failed
   {IF WORKTREE}
   ✓ Worktree: {worktree-action-taken}
   ✓ Branch: feat/{feature-slug}
   {END IF}

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
  - **If in worktree**: Offer to remove entire worktree (clean rollback)
  - **If not in worktree**: Suggest using `git diff` to review changes
  - Offer to `git restore` specific files
  - Recommend `git stash` to save partial work
  - Never automatically discard work without user confirmation

## Implementation Details

**Critical Requirements**:

- **ORCHESTRATOR PATTERN**: This command is a lightweight coordinator, NOT a direct implementer
- **SUBAGENT DELEGATION**: Each step executed by isolated subagent with fresh context
- **WORKTREE ISOLATION**: Optional git worktree creation for isolated feature development with automated cleanup
- **SAFETY FIRST**: Never execute on main or production branches without explicit confirmation (worktrees bypass this with new branches)
- **SKILL INTEGRATION**: Subagents automatically invoke react-coding-conventions skill for React files
- **SYSTEMATIC EXECUTION**: Execute steps in order, one at a time, via subagent delegation
- **VALIDATION ENFORCEMENT**: Subagents always run lint:fix and typecheck for code changes
- **TODO MANAGEMENT**: Orchestrator keeps todo list updated in real-time (ONE in_progress at a time)
- **COMPREHENSIVE LOGGING**: Orchestrator saves detailed logs for each step and phase
- **ERROR RECOVERY**: Handle subagent errors gracefully with clear user guidance
- **QUALITY ASSURANCE**: Enforce quality gates before completion
- **CONTEXT EFFICIENCY**: Orchestrator maintains minimal context, subagents use fresh context per step
- **SCALABILITY**: Can handle plans with 50+ steps without context overflow

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

- **Orchestrator**: Minimal context usage, fast coordination
- **Subagents**: Fresh context per step prevents bloat
- **Parallel Potential**: Independent steps could run in parallel (future enhancement)
- **Batch Operations**: Orchestrator batches pre-checks and setup operations
- **Context Isolation**: Each subagent only loads files needed for its step
- **Scalable Architecture**: Linear context growth instead of exponential

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

## Subagent Communication Protocol

**Input to Step Subagent** (from orchestrator):
```
- Step number and title
- What: Description of changes needed
- Why: Rationale for the changes
- Files: List of file paths to modify/create
- Validation commands: Commands to run for verification
- Success criteria: Criteria to check
- Previous step context: Summary of what previous step did (if dependent)
- React file detection: Boolean indicating if react-coding-conventions skill needed
```

**Output from Step Subagent** (to orchestrator):
```
- Status: success | failure
- Files modified: List with descriptions of changes
- Files created: List with descriptions
- Validation results: Command outputs with pass/fail status
- Success criteria: Verification of each criterion
- Errors/warnings: Any issues encountered
- Notes: Information for subsequent steps
```

**Architecture Benefits**:

1. **Context Isolation**: Each step has clean, isolated context
2. **Scalability**: Can handle 50+ step plans without context overflow
3. **Error Containment**: Failures isolated to individual steps
4. **Parallel Potential**: Future enhancement could run independent steps concurrently
5. **Debugging**: Clear separation between orchestration and implementation
6. **Resource Efficiency**: Only load files needed per step, not entire codebase

## Notes

- This command is designed to work seamlessly with plans generated by `/plan-feature`
- **Architecture**: Uses orchestrator + subagent pattern for scalability
- Always review the implementation plan before executing to ensure it's current
- Use `--step-by-step` mode for complex or risky implementations
- Use `--dry-run` mode to preview changes before applying them
- Use `--worktree` mode for isolated feature development with these benefits:
  - Complete isolation from main codebase
  - Safe experimentation without affecting working directory
  - Easy rollback by removing entire worktree
  - Automatic dependency installation (npm install)
  - Flexible cleanup options (merge, PR, keep, or remove)
- **Worktree Location**: Created at `.worktrees/{feature-slug}/` (gitignored by default)
- **Worktree Branch**: Uses `feat/{feature-slug}` naming convention
- Implementation logs provide complete audit trail for debugging and review
- Quality gates are enforced but non-blocking warnings won't stop execution
- Git commit is offered but optional - you can commit manually if preferred
- **Scalability**: Tested architecture can handle plans with 50+ steps efficiently
