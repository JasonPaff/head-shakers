# Workflow Execution Example

## How to Use the /plan-feature Command

### User Input
```
/plan-feature "Add a tag system for bobbleheads with autocomplete"
```

### What Claude Should Do (Step-by-Step)

#### 1. Generate Directory Tree
```bash
find . -type d -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -maxdepth 5 | head -100
```

#### 2. Stage 1: Root Folder Selection
```python
# Read the root-folder-selection.md command
root_selection_instructions = read_file('.claude/commands/root-folder-selection.md')

# Replace the placeholder
instructions_with_tree = root_selection_instructions.replace('{{DIRECTORY_TREE}}', actual_tree)

# Execute via Task tool
result = Task(
    subagent_type="general-purpose",
    description="Select relevant folders",
    prompt=f"""
    Task: Add a tag system for bobbleheads with autocomplete

    {instructions_with_tree}
    """
)
```

#### 3. Stage 2A: Pattern-Based Filtering
```python
# Read the regex-file-filter.md command
filter_instructions = read_file('.claude/commands/regex-file-filter.md')

# Replace placeholder and add context
instructions = filter_instructions.replace('{{DIRECTORY_TREE}}', actual_tree)

# Execute via Task tool
patterns = Task(
    subagent_type="general-purpose",
    description="Generate file patterns",
    prompt=f"""
    Task: Add a tag system for bobbleheads with autocomplete
    Selected root folders from previous stage: {root_folders}

    {instructions}
    """
)
```

#### 4. Apply Patterns to Find Files
```bash
# Use the pattern groups to find actual files
for pattern in patterns['patternGroups']:
    rg -l "{pattern['contentPattern']}" --glob "{pattern['pathPattern']}"
```

#### 5. Stage 2B: Relevance Assessment
```python
# Read file contents
file_contents = ""
for file in candidate_files[:50]:
    content = read_file(file)
    file_contents += f"=== {file} ===\n{content}\n\n"

# Read relevance-assessment.md
assessment_instructions = read_file('.claude/commands/relevance-assessment.md')
instructions = assessment_instructions.replace('{{FILE_CONTENTS}}', file_contents)

# Execute via Task tool
relevant_files = Task(
    subagent_type="general-purpose",
    description="Assess file relevance",
    prompt=f"""
    Task: Add a tag system for bobbleheads with autocomplete

    {instructions}
    """
)
```

#### 6. Stage 3: Path Validation
```python
# Similar pattern - read path-correction.md, replace placeholders, execute
```

#### 7. Stage 4A: Task Refinement
```python
# Read relevant file contents
# Execute task-refinement with Task tool
```

#### 8. Stage 4B: Implementation Plan Generation
```python
# Collect all context from previous stages
project_context = f"""
Project: Head Shakers - Bobblehead Collection Platform
Tech Stack: Next.js 15, React 19, PostgreSQL, Drizzle ORM
Selected Folders: {root_folders}
Relevant Files: {validated_files}
"""

# Read implementation-plan.md
plan_instructions = read_file('.claude/commands/implementation-plan.md')
instructions = plan_instructions.replace('{{PROJECT_CONTEXT}}', project_context)
instructions = instructions.replace('{{FILE_CONTENTS}}', relevant_file_contents)
instructions = instructions.replace('{{DIRECTORY_TREE}}', directory_tree)

# Execute via Task tool
implementation_plan = Task(
    subagent_type="general-purpose",
    description="Generate implementation plan",
    prompt=f"""
    Task: {refined_task}

    {instructions}
    """
)
```

#### 9. Save the Plan
```python
# Create the documentation directory
mkdir -p docs/2025_01_17/plans/

# Save the plan
write_file('docs/2025_01_17/plans/tag-system-implementation-plan.md', final_plan_content)
```

#### 10. Return Summary to User
```
## Implementation Plan Generated
Saved to: docs/2025_01_17/plans/tag-system-implementation-plan.md
- Analyzed 5 directories
- Discovered 12 relevant files
- Generated 8-step implementation plan
```

## Key Points for Successful Execution

1. **Use Task Tool**: Each stage must use the Task tool with `subagent_type: "general-purpose"`
2. **Read Command Files**: Read the actual `.claude/commands/*.md` files for instructions
3. **Replace Placeholders**: Replace all `{{VARIABLE}}` placeholders with real data
4. **Pass Context Forward**: Each stage's output becomes input for the next
5. **Save Results**: Always save the final plan to the docs folder

## Common Mistakes to Avoid

- ❌ Don't try to execute .md files as scripts
- ❌ Don't forget to replace placeholders
- ❌ Don't skip stages even if they seem unnecessary
- ❌ Don't forget to create the docs directory structure
- ✅ Do use Task tool for each stage
- ✅ Do pass complete context between stages
- ✅ Do validate outputs before proceeding