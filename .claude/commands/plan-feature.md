---
allowed-tools: Task(subagent_type:*), Bash(mkdir:*), Bash(echo:*), Write(*), Read(*), Glob(*), Grep(*)
argument-hint: 'feature description'
description: Generate detailed implementation plans through automated 3-step orchestration
---

You are a streamlined feature planning orchestrator that creates detailed implementation plans through a simple 3-step process.

@CLAUDE.MD
@package.json

## Command Usage

```
/plan-feature "feature description"
```

**Examples:**

- `/plan-feature "Add user authentication with OAuth"`
- `/plan-feature "Implement real-time notifications system"`
- `/plan-feature "Create admin dashboard with analytics"`

## Workflow Overview

When the user runs this command, execute this simple 3-step workflow:

1. **Feature Request Refinement**: Enhance the user request with project context
2. **File Discovery**: Find all relevant files for the implementation
3. **Implementation Planning**: Generate detailed Markdown implementation plan

## Step-by-Step Execution

### Step 1: Feature Request Refinement

**Objective**: Enhance the user's request with project context to make it more actionable.

**Process**:

1. **Initialize Orchestration Directory**: Create `docs/{YYYY_MM_DD}/orchestration/{feature-name}/` directory structure
2. **Create Orchestration Index**: Save `docs/{YYYY_MM_DD}/orchestration/{feature-name}/00-orchestration-index.md` with workflow overview and links
3. Record step start time with ISO timestamp
4. Read CLAUDE.md and package.json for project context
5. Use Task tool with `subagent_type: "general-purpose"`:
   - Description: "Refine feature request with project context"
   - **IMPORTANT**: Request single paragraph output (200-500 words) without headers or sections
   - **ERROR HANDLING**: If subagent fails, retry once with simplified prompt and log the failure
   - **TIMEOUT**: Set 30-second timeout for subagent response
   - **RETRY STRATEGY**: Maximum 2 attempts with exponential backoff
   - Prompt template: "Refine this feature request into a SINGLE PARAGRAPH (no headers, bullet points, or sections): '$ARGUMENTS'. Using the project context from CLAUDE.md and package.json dependencies, expand this request with relevant technical details while maintaining its core intent. Output ONLY the refined paragraph (200-500 words), nothing else."
   - **CONSTRAINT**: Output must be single paragraph format only
   - **CONSTRAINT**: Refined request must be 2-4x original length (no excessive expansion)
   - **CONSTRAINT**: Preserve original intent and scope (no feature creep)
   - **CONSTRAINT**: Add only essential technical context, not exhaustive details
   - **LOG REQUIREMENT**: Capture complete agent prompt and full response
   - **FALLBACK**: If subagent returns invalid format, extract paragraph content manually
   - Agent returns enhanced feature request as single paragraph
6. Record step end time and validate output
   - **Format Check**: Verify output is single paragraph (no headers, sections, or bullet points)
   - **Length Check**: Verify refined request is 200-500 words and 2-4x original length
   - **Scope Check**: Confirm core intent preserved without feature creep
   - **Quality Check**: Ensure only essential technical context added
   - **Error Recovery**: If format is wrong, extract just the paragraph content if possible
   - **Validation Success**: Log successful validation or detailed error messages
7. **SAVE STEP 1 LOG**: Create `docs/{YYYY_MM_DD}/orchestration/{feature-name}/01-feature-refinement.md` with:
   - Step metadata (timestamps, duration, status)
   - Original request and context provided
   - Complete agent prompt sent
   - Full agent response received
   - Refined feature request extracted
   - **Length Analysis**: Original vs refined word count comparison
   - **Scope Analysis**: Assessment of intent preservation
   - Validation results and any warnings
8. **CHECKPOINT**: Step 1 markdown log now available for review/debugging

### Step 2: AI-Powered File Discovery

**Objective**: Use the file discovery agent to intelligently identify all files relevant to implementing the feature by analyzing the refined request and codebase structure.

**Process**:

1. Record step start time with ISO timestamp
2. Use Task tool with `subagent_type: "file-discovery-agent"`:
3. **AI-Powered Discovery**: Use integrated Claude API for intelligent file analysis:
   - **Context-Aware Analysis**: AI examines the refined feature request and understands implementation requirements
   - **Codebase Structure Analysis**: AI analyzes the Head Shakers project architecture and patterns
   - **Content-Based Discovery**: AI reads and analyzes file contents for relevance (not just filenames)
   - **Smart Prioritization**: AI categorizes files by implementation priority (Critical/High/Medium/Low)
   - **Comprehensive Coverage**: AI searches across all architectural layers (schemas, actions, queries, validations, components, pages)
   - **Pattern Recognition**: AI identifies existing similar functionality and integration points
   - **ERROR HANDLING**: If AI analysis fails, retry with simplified prompt and log the failure
   - **TIMEOUT**: Set 60-second timeout for AI file discovery
   - **RETRY STRATEGY**: Maximum 2 attempts with fallback strategies
   - **MINIMUM REQUIREMENT**: Must discover at least 3 relevant files through AI analysis
   - **LOG REQUIREMENT**: Capture complete AI prompt and full analysis response
4. **Enhanced File Validation**:
   - Validate all AI-discovered file paths exist using file system checks
   - Check file permissions and accessibility
   - Log any missing or inaccessible files discovered by AI
   - Flag files that may need creation vs modification
   - Cross-reference AI analysis with actual file contents
5. Record step end time and validation results
6. **SAVE STEP 2 LOG**: Create `docs/{YYYY_MM_DD}/orchestration/{feature-name}/02-file-discovery.md` with:
   - Step metadata (timestamps, duration, status)
   - Refined request used as input
   - Complete AI prompt sent and analysis received
   - AI file discovery analysis with reasoning
   - Discovered files list with AI-generated categorization and priorities
   - File path validation results and existence checks
   - AI analysis metrics (API cost, duration, tokens used)
   - Discovery statistics and coverage analysis7
7. **UPDATE INDEX**: Append Step 2 summary to orchestration index
8. **CHECKPOINT**: Step 2 markdown log now available for review/debugging

### Step 3: Implementation Planning

**Objective**: Generate detailed markdown implementation plan following the required template.

**Process**:

1. Record step start time with ISO timestamp
2. Use Task tool with `subagent_type: "implementation-planner"`:
   - Description: "Generate detailed implementation plan"
   - **CRITICAL**: Explicitly request MARKDOWN format following the agent's template
   - **ERROR HANDLING**: If XML format returned, attempt automatic conversion to markdown and log the issue
   - **TIMEOUT**: Set 60-second timeout for plan generation
   - **RETRY STRATEGY**: If format validation fails, retry with explicit format constraints (maximum 2 attempts)
   - **FALLBACK**: If all retries fail, flag for manual review and continue with available output
   - Prompt must include: "Generate an implementation plan in MARKDOWN format (NOT XML) following your defined template with these sections: ## Overview (with Estimated Duration, Complexity, Risk Level), ## Quick Summary, ## Prerequisites, ## Implementation Steps (each step with What/Why/Confidence/Files/Changes/Validation Commands/Success Criteria), ## Quality Gates, ## Notes. IMPORTANT: Include 'npm run lint:fix && npm run typecheck' validation for every step touching JS/JSX/TS/TSX files. Do NOT include code examples."
   - Pass refined feature request, discovered files analysis, and project context
   - **LOG REQUIREMENT**: Capture complete agent prompt and full response
   - **VALIDATION COMMANDS**: Ensure all steps include appropriate validation commands
   - Agent generates structured markdown implementation plan
3. **Enhanced Plan Validation**:
   - **Format Check**: Verify output is markdown with required sections (not XML)
   - **Auto-Conversion**: If XML format detected, attempt automatic conversion to markdown
   - **Template Compliance**: Check for Overview, Prerequisites, Implementation Steps, Quality Gates
   - **Section Validation**: Verify each required section contains appropriate content
   - **Command Validation**: Ensure steps include `npm run lint:fix && npm run typecheck`
   - **Content Quality**: Verify no code examples or implementations included
   - **Completeness Check**: Confirm plan addresses all aspects of the refined request
   - **Error Recovery**: If validation fails, retry with explicit format constraints
   - **Manual Review Flag**: If auto-conversion fails, flag for manual review
4. Record step end time and validation results
5. **SAVE STEP 3 LOG**: Create `docs/{YYYY_MM_DD}/orchestration/{feature-name}/03-implementation-planning.md` with:
   - Step metadata (timestamps, duration, status)
   - Refined request and file analysis used as input
   - Complete agent prompt sent
   - Full agent response with implementation plan
   - Plan format validation results (markdown vs XML check)
   - Template compliance validation results
   - Complexity assessment and time estimates
   - Quality gate results
6. **UPDATE INDEX**: Append Step 3 summary to orchestration index
7. **FINAL CHECKPOINT**: All step logs now available for review
8. **SAVE IMPLEMENTATION PLAN**: Create separate `docs/{YYYY_MM_DD}/plans/{feature-name}-implementation-plan.md` file
   - Ensure plan is saved in proper markdown format
   - If agent returned XML, convert to markdown or flag for manual review

## Logging and Output

**Initialize Orchestration Structure**: Create directory hierarchy and index file:

- Create orchestration directory: `docs/{YYYY_MM_DD}/orchestration/{feature-name}/`
- Initialize orchestration index with workflow overview and navigation links
- Each step saves its own detailed markdown log file
- Human-readable format with clear sections and formatting
- Complete capture of all inputs, outputs, and metadata

**Critical Logging Requirements**:

- **Separate Step Files**: Each step saves its own markdown file with full details
- **Human Readable**: Use markdown formatting with headers, lists, and code blocks
- **Complete Data Capture**: Full input prompts and agent responses in formatted sections
- **Step Metadata**: Timestamps, duration, status clearly presented at the top
- **Error Handling**: Dedicated sections for errors, warnings, and validation results
- **Raw Agent Outputs**: Preserved in code blocks for debugging

**Incremental Save Strategy**:

- **Initial**: Create orchestration directory and index file with workflow overview
- **After Step 1**: Save `01-feature-refinement.md` with complete step details
- **After Step 2**: Save `02-file-discovery.md` with complete step details
- **After Step 3**: Save `03-implementation-planning.md` with complete step details
- **Final**: Update orchestration index with summary and save implementation plan

**Save Results**:

- Implementation plan: `docs/{YYYY_MM_DD}/plans/{feature-name}-implementation-plan.md`
- Orchestration logs: `docs/{YYYY_MM_DD}/orchestration/{feature-name}/`
  - `00-orchestration-index.md` - Workflow overview and navigation
  - `01-feature-refinement.md` - Step 1 detailed log
  - `02-file-discovery.md` - Step 2 detailed log
  - `03-implementation-planning.md` - Step 3 detailed log

**Return Summary**:

```
## Implementation Plan Generated
Saved to: docs/{date}/plans/{feature-name}-implementation-plan.md

## Orchestration Logs
Directory: docs/{date}/orchestration/{feature-name}/
- 📄 00-orchestration-index.md - Workflow overview and navigation
- 📄 01-feature-refinement.md - Refined request with project context
- 📄 02-file-discovery.md - Discovered X files across Y directories
- 📄 03-implementation-planning.md - Generated Z-step implementation plan

Execution time: X.X seconds
```

## Implementation Details

**Essential Requirements**:

- **CRITICAL**: Capture complete agent inputs and outputs (not summaries)
- **CRITICAL**: Record precise timestamps for each step with ISO format
- **CRITICAL**: Must use the file discovery agent for step 2
- **CRITICAL**: Must use the implementation planner agent for step 3
- **CRITICAL**: Validate and log all discovered file paths with existence checks
- **CRITICAL**: Implement proper error handling and recovery for all subagent failures
- **LOGGING**: Create comprehensive logging for each step with full data capture
- **PERSISTENCE**: Save implementation plan and logs to the docs folder structure
- **PREPARATION**: Ensure the directory structure exists before saving (create if needed)
- **FEEDBACK**: Return concise execution summary with links to generated files
- **PARALLEL EXECUTION**: Use batched tool calls where possible for performance
- **TIMEOUT HANDLING**: Implement appropriate timeouts for all subagent operations
- **VALIDATION**: Validate all outputs against expected formats and requirements
- **FALLBACK**: Provide fallback strategies for common failure scenarios

**Enhanced Quality Gates**:

- **Step 1 Success**: Feature request successfully refined with project context
  - **Length Constraint**: Refined request must be 2-4x the length of original (not 10x+)
  - **Format Validation**: Output must be single paragraph without headers or sections
  - **Intent Preservation**: Core intent of original request must remain unchanged
  - **Scope Control**: No unnecessary elaboration or feature creep in refinement
- **Step 2 Success**: AI-powered file discovery completed with comprehensive analysis
  - **Minimum Files**: At least 3 relevant files discovered through AI analysis
  - **AI Analysis Quality**: AI provides detailed reasoning for each file's relevance and priority
  - **File Validation**: All AI-discovered file paths validated to exist and be accessible
  - **Smart Categorization**: Files properly categorized by AI-determined implementation priority
  - **Comprehensive Coverage**: AI discovery covers all major components affected by the feature
  - **Content Validation**: AI analysis based on actual file contents, not just filenames
  - **Pattern Recognition**: AI identifies existing similar functionality and integration points
- **Step 3 Success**: Implementation plan generated in correct format
  - **Format Compliance**: Plan must be in markdown format (not XML)
  - **Template Adherence**: Includes all required sections (Overview, Prerequisites, Steps, Quality Gates)
  - **Validation Commands**: Every step includes appropriate lint/typecheck commands
  - **No Code Examples**: Plan contains no implementation code, only instructions
  - **Actionable Steps**: Implementation plan contains concrete, actionable steps
  - **Complete Coverage**: Plan addresses the refined feature request completely
- **Logging Success**: All agent responses captured in full for debugging and review
- **Error Recovery**: All errors handled gracefully with appropriate fallback strategies

## File Output Structure

**Implementation Plan**: `docs/{YYYY_MM_DD}/plans/{feature-name}-implementation-plan.md`

```markdown
# {Feature Name} Implementation Plan

Generated: {timestamp}
Original Request: {original user request}
Refined Request: {enhanced request with project context}

## Analysis Summary

- Feature request refined with project context
- Discovered X files across Y directories
- Generated Z-step implementation plan

## File Discovery Results

{File discovery agent output}

## Implementation Plan

{Markdown implementation plan from planning agent}
```
