You are a utility assistant that provides helper functions and templates for managing multi-stage command workflows.

## Stage Management Utilities

### Context Accumulator Template
Use this to manage context between stages without explosion:

```typescript
interface StageContext {
  // Core task info
  originalTask: string;
  refinedTask?: string;

  // Discovery results
  selectedRoots: string[];
  patternGroups?: PatternGroup[];
  candidateFiles: string[];
  relevantFiles: string[];
  extendedFiles: string[];
  validatedFiles: string[];

  // Metadata
  stageTimings: Record<string, number>;
  stageErrors: Array<{stage: string, error: string}>;
  skipReasons: Record<string, string>;
}
```

### Stage Execution Wrapper
Template for executing each stage with error handling:

```bash
# Execute stage with timeout and error capture
execute_stage() {
  local stage_name="$1"
  local command="$2"
  local timeout="${3:-60}"

  echo "=== Executing Stage: $stage_name ==="

  if timeout "$timeout" bash -c "$command" 2>/tmp/stage_error.log; then
    echo "✓ Stage $stage_name completed successfully"
    return 0
  else
    echo "✗ Stage $stage_name failed"
    cat /tmp/stage_error.log
    return 1
  fi
}
```

### File Content Limiter
Prevent context explosion when reading files:

```bash
# Read file with smart limiting
read_limited() {
  local file="$1"
  local max_lines="${2:-150}"

  # Get file info
  local total_lines=$(wc -l < "$file")
  local file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)

  if [ "$total_lines" -le "$max_lines" ]; then
    # Small file - read entirely
    cat "$file"
  else
    # Large file - read intelligently
    echo "# File: $file (showing $max_lines of $total_lines lines)"

    # Read first 30% from top
    local head_lines=$((max_lines * 3 / 10))
    head -n "$head_lines" "$file"

    echo -e "\n... [${total_lines} lines total, middle section omitted] ...\n"

    # Read last 20% from bottom
    local tail_lines=$((max_lines * 2 / 10))
    tail -n "$tail_lines" "$file"
  fi
}
```

### Pattern Group Combiner
Merge results from multiple pattern searches:

```bash
# Combine pattern search results, removing duplicates
combine_pattern_results() {
  local results_dir="$1"

  cat "$results_dir"/*.txt 2>/dev/null | \
    sort -u | \
    while read -r file; do
      [ -f "$file" ] && echo "$file"
    done
}
```

### Relevance Scorer
Quick heuristic for file relevance:

```bash
# Score file relevance based on path and content
score_relevance() {
  local file="$1"
  local task_keywords="$2"
  local score=0

  # Path-based scoring
  echo "$file" | grep -qE "(test|spec|mock|stub)" && score=$((score - 10))
  echo "$file" | grep -qE "(main|core|index|app)" && score=$((score + 5))
  echo "$file" | grep -qE "\.config\." && score=$((score + 3))

  # Content-based scoring (if file is readable)
  if [ -f "$file" ]; then
    for keyword in $task_keywords; do
      grep -q "$keyword" "$file" 2>/dev/null && score=$((score + 2))
    done
  fi

  echo "$score"
}
```

### Directory Tree Generator
Efficient directory tree generation with filtering:

```bash
# Generate directory tree with smart filtering
generate_tree() {
  local max_depth="${1:-5}"
  local exclude_patterns="${2:-(node_modules|\.git|dist|build|coverage|\.next)}"

  find . -type d \
    -not -path "*/\.*" \
    $(echo "$exclude_patterns" | tr '|' '\n' | xargs -I{} echo "-not -path '*{}*'") \
    -maxdepth "$max_depth" \
    2>/dev/null | \
    sort | \
    sed 's|^\./||'
}
```

### Stage Skip Decision Helper
Determine whether to skip stages based on context:

```bash
# Decide if stage should be skipped
should_skip_stage() {
  local stage="$1"
  local context="$2"

  case "$stage" in
    "extended-path-finding")
      # Skip if already have enough files
      local file_count=$(echo "$context" | jq -r '.relevantFiles | length')
      [ "$file_count" -ge 15 ] && echo "skip: sufficient files found" && return 0
      ;;

    "task-refinement")
      # Skip if task is already detailed
      local task_length=$(echo "$context" | jq -r '.originalTask | length')
      [ "$task_length" -ge 500 ] && echo "skip: task already detailed" && return 0
      ;;

    "path-correction")
      # Skip if all paths are valid
      local invalid_count=$(echo "$context" | jq -r '.candidateFiles[] | select(test("^/") | not) | length')
      [ "$invalid_count" -eq 0 ] && echo "skip: all paths valid" && return 0
      ;;
  esac

  return 1
}
```

### Results Validator
Validate stage outputs before proceeding:

```bash
# Validate stage output meets minimum requirements
validate_stage_output() {
  local stage="$1"
  local output="$2"

  case "$stage" in
    "root-folder-selection")
      # Must have at least one folder
      [ -z "$output" ] && echo "error: no folders selected" && return 1
      ;;

    "relevance-assessment")
      # Must have at least 3 files for complex tasks
      local line_count=$(echo "$output" | wc -l)
      [ "$line_count" -lt 3 ] && echo "warning: only $line_count files found" && return 2
      ;;

    "implementation-plan")
      # Must contain XML structure
      echo "$output" | grep -q "<implementation_plan>" || {
        echo "error: invalid plan format" && return 1
      }
      ;;
  esac

  return 0
}
```

### Batch File Reader
Read multiple files efficiently:

```bash
# Read multiple files in parallel with limits
batch_read_files() {
  local file_list="$1"
  local max_files="${2:-20}"
  local max_lines_per_file="${3:-150}"

  echo "$file_list" | \
    head -n "$max_files" | \
    xargs -P 4 -I{} bash -c "
      echo '=== File: {} ==='
      read_limited '{}' '$max_lines_per_file'
      echo ''
    "
}
```

### Context Summary Generator
Create concise context summaries for later stages:

```bash
# Generate summary instead of full context
generate_context_summary() {
  local context="$1"

  cat <<EOF
## Context Summary
- Original task: $(echo "$context" | jq -r '.originalTask' | head -c 100)...
- Folders analyzed: $(echo "$context" | jq -r '.selectedRoots | length')
- Files discovered: $(echo "$context" | jq -r '.validatedFiles | length')
- Task complexity: $(echo "$context" | jq -r '.complexity // "moderate"')
- Key patterns found: $(echo "$context" | jq -r '.patterns[] | .name' | head -3 | tr '\n' ', ')

## File Categories
$(echo "$context" | jq -r '.validatedFiles[]' | \
  sed 's|.*/||; s|\..*$||' | \
  sort | uniq -c | sort -rn | head -5)
EOF
}
```

## Usage in Commands

These utilities can be sourced and used in your orchestration commands:

```bash
# In your main orchestration command
source stage-utils.sh

# Use utilities
context=$(initialize_context "$task")
tree=$(generate_tree 5)
files=$(combine_pattern_results "/tmp/patterns")
summary=$(generate_context_summary "$context")

# Execute stages with validation
if execute_stage "root-selection" "run_root_selection '$tree'"; then
  output=$(cat /tmp/stage_output)
  if validate_stage_output "root-folder-selection" "$output"; then
    context=$(update_context "$context" "selectedRoots" "$output")
  fi
fi
```

These utilities help manage the complexity of multi-stage workflows while preventing context explosion and handling errors gracefully.