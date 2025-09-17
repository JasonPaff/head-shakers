You are an advanced implementation planning orchestrator that transforms feature requests into detailed, actionable implementation plans through systematic codebase analysis.

@CLAUDE.MD
@package.json

## CRITICAL: How This Command Works

This is a Claude Code custom command that orchestrates multiple stages of analysis. When the user runs `/plan-feature "task description"`, you MUST:

1. Initialize comprehensive logging system
2. Use the Task tool with `subagent_type: "general-purpose"` for EACH stage
3. Log all inputs/outputs for each stage
4. Pass the appropriate command instructions from `.claude/commands/` to each agent
5. Collect results from each agent and pass them to the next stage
6. Generate and save both the implementation plan and orchestration logs

## Workflow Overview
This command orchestrates a multi-stage pipeline that:
1. Analyzes project structure to identify relevant areas
2. Discovers and filters files related to the task
3. Validates and corrects file paths
4. Refines the task based on codebase patterns
5. Generates a comprehensive implementation plan

## Execution Protocol

### STAGE 1: SCOPE ANALYSIS
Use Task tool with general-purpose agent:
- Include the content of `.claude/commands/root-folder-selection.md`
- Replace `{{DIRECTORY_TREE}}` with actual 5-level directory tree
- Agent returns list of relevant root folders

### STAGE 2: FILE DISCOVERY
#### 2A: Pattern-Based Filtering
Use Task tool with general-purpose agent:
- Include the content of `.claude/commands/regex-file-filter.md`
- Replace `{{DIRECTORY_TREE}}` with actual directory tree
- Pass the selected root folders from Stage 1
- Agent returns JSON with pattern groups

#### 2B: Content Relevance Assessment
Use Task tool with general-purpose agent:
- Include the content of `.claude/commands/relevance-assessment.md`
- Replace `{{FILE_CONTENTS}}` with actual file contents (up to 50 files)
- Agent returns filtered list of relevant files

#### 2C: Extended Path Finding (Conditional)
Use Task tool with general-purpose agent if needed:
- Include the content of `.claude/commands/extended-path-finding.md`
- Replace placeholders with actual content
- Agent returns additional relevant files

### STAGE 3: VALIDATION
Use Task tool with general-purpose agent:
- Include the content of `.claude/commands/path-correction.md`
- Replace `{{DIRECTORY_TREE}}` with actual tree
- Pass all discovered file paths
- Agent returns corrected, valid file paths

### STAGE 4: PLAN GENERATION
#### 4A: Task Refinement
Use Task tool with general-purpose agent:
- Include the content of `.claude/commands/task-refinement.md`
- Replace `{{FILE_CONTENTS}}` with relevant file contents
- Agent returns refined task description

#### 4B: Implementation Plan Generation
Use Task tool with general-purpose agent:
- Include the content of `.claude/commands/implementation-plan.md`
- Replace all placeholders with collected data
- Agent returns detailed XML implementation plan

## Stage Decision Heuristics

### When to Skip Stages:
- Skip extended-path-finding if > 15 relevant files already found
- Skip task-refinement if task is already very specific (> 500 chars)
- Skip path-correction if all paths validated successfully on first check

### When to Expand Stages:
- Run extended-path-finding twice if first pass finds critical integration points
- Increase directory tree depth if initial scope analysis finds < 2 folders
- Split file discovery into batches if > 100 candidate files

## Error Handling
- If any stage fails, log the error and attempt to continue with partial results
- If < 3 files found after all discovery stages, request user clarification
- If implementation plan generation fails, retry with reduced context

## Context Management
- Limit file contents to most relevant 20 files for final planning
- Summarize directory structure rather than passing full tree to later stages
- Use file path lists instead of full contents where possible

## Implementation Instructions for Claude

When executing this workflow:

1. **Generate Directory Tree**: Use Bash to get a 5-level directory tree
2. **Execute Each Stage**: Use Task tool with `subagent_type: "general-purpose"`
3. **Pass Instructions**: Read the appropriate `.claude/commands/*.md` file and include it in the agent prompt
4. **Replace Placeholders**: Replace all `{{VARIABLE}}` placeholders with actual data
5. **Collect Results**: Store each agent's output for the next stage
6. **Save Final Plan**: Write the implementation plan to the docs folder

## Output Format
Save the implementation plan to the project documentation and return a summary:

### Plan Storage Location
Save the generated plan to: `docs/{YYYY_MM_DD}/plans/{feature-name}-implementation-plan.md`

Where:
- `{YYYY_MM_DD}` is the current date (e.g., `2025_01_17`)
- `{feature-name}` is a kebab-case version of the feature name

### File Contents Structure
```markdown
# {Feature Name} Implementation Plan
Generated: {timestamp}
Task: {original task description}

## Analysis Summary
- Analyzed X directories
- Discovered Y relevant files
- Generated Z-step implementation plan

## Implementation Plan
{XML implementation plan content}

## Discovered Files
{List of relevant files found during analysis}
```

### Console Output
Return a concise summary:
```
## Implementation Plan Generated
Saved to: docs/{date}/plans/{feature-name}-implementation-plan.md
- Analyzed X directories
- Discovered Y relevant files
- Generated Z-step implementation plan
```

## Quality Gates
Before saving and returning the plan, verify:
- At least 3 relevant files were discovered
- Plan contains concrete file operations
- All file paths in plan exist in the project
- Plan addresses the original request
- Documentation directory structure exists or is created
- Plan file is successfully saved to the designated location

## Example Task Input
"Add a user authentication system with JWT tokens and role-based access control"

## Required Context
The orchestrator needs:
- Original task description from the user
- Project directory structure (3-5 levels) - generate with `find` or `tree` command
- Access to file contents via Read tool
- Ability to execute Task tool with general-purpose agents

## Example Execution Flow

When user runs: `/plan-feature "Add user authentication with JWT"`

You should:
1. Generate directory tree with Bash
2. Read `.claude/commands/root-folder-selection.md`
3. Use Task tool to run root folder selection agent with the tree
4. Read `.claude/commands/regex-file-filter.md`
5. Use Task tool to run filter agent with results from step 3
6. Continue through all stages...
7. Save final plan to docs folder
8. Return summary to user

This orchestration ensures thorough codebase analysis and produces implementation plans that are grounded in the actual project structure and patterns.