#!/usr/bin/env python3
"""
Agent Output Validation Hook for Claude Code
Validates that agents follow their prompt constraints and requirements.
"""
import json
import sys
import os
import re
from pathlib import Path

def validate_implementation_planner_output(output_text, agent_name):
    """Validate implementation-planner agent output against its constraints."""
    violations = []

    # Check 1: Must use markdown template format (NOT XML)
    if output_text.strip().startswith('<?xml'):
        violations.append("VIOLATION: Used XML format instead of required markdown template")

    # Check 2: Must NOT include code examples
    code_patterns = [
        r'```(?:typescript|javascript|tsx|jsx|ts|js)',
        r'export\s+(?:interface|function|const)',
        r'import\s+.*from',
        r'React\.forwardRef',
        r'useEffect\s*\(',
    ]

    for pattern in code_patterns:
        if re.search(pattern, output_text, re.IGNORECASE | re.MULTILINE):
            violations.append(f"VIOLATION: Contains forbidden code examples (pattern: {pattern})")

    # Check 3: Must include mandatory validation commands
    required_validation = r'npm\s+run\s+lint:fix\s*&&\s*npm\s+run\s+typecheck'
    if not re.search(required_validation, output_text):
        violations.append("VIOLATION: Missing mandatory validation commands (npm run lint:fix && npm run typecheck)")

    # Check 4: Must use required markdown template structure
    required_sections = [
        r'# Implementation Plan:',
        r'## Overview',
        r'## Implementation Steps',
        r'## Quality Gates'
    ]

    for section in required_sections:
        if not re.search(section, output_text, re.MULTILINE):
            violations.append(f"VIOLATION: Missing required section: {section}")

    # Check 5: Steps must have required structure
    step_pattern = r'### Step \d+:'
    if not re.search(step_pattern, output_text):
        violations.append("VIOLATION: Steps must use '### Step N:' format")

    return violations

def validate_file_discovery_output(output_text, agent_name):
    """Validate file-discovery-agent output."""
    violations = []

    # Must discover at least 5 files
    file_pattern = r'src/[^\s\n]+'
    files_found = len(re.findall(file_pattern, output_text))
    if files_found < 5:
        violations.append(f"VIOLATION: Only found {files_found} files, minimum 5 required")

    return violations

def validate_general_purpose_output(output_text, agent_name):
    """Validate general-purpose agent output for refinement."""
    violations = []

    # Check length constraint (should be 2-4x original, roughly 150-300 words)
    word_count = len(output_text.split())
    if word_count > 500:  # Excessive expansion
        violations.append(f"VIOLATION: Refined request too long ({word_count} words), should be 150-300 words")

    return violations

def main():
    try:
        # Read input from stdin (hook data)
        input_data = json.load(sys.stdin)

        # Extract tool information
        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})
        tool_result = input_data.get('tool_result', {})

        # Only validate Task tool calls (agent invocations)
        if tool_name != 'Task':
            sys.exit(0)

        # Get agent type and output
        agent_type = tool_input.get('subagent_type', '')
        agent_output = tool_result.get('content', '')

        if not agent_output:
            sys.exit(0)

        # Validate based on agent type
        violations = []

        if agent_type == 'implementation-planner':
            violations = validate_implementation_planner_output(agent_output, agent_type)
        elif agent_type == 'file-discovery-agent':
            violations = validate_file_discovery_output(agent_output, agent_type)
        elif agent_type == 'general-purpose':
            violations = validate_general_purpose_output(agent_output, agent_type)

        # Report violations
        if violations:
            print(f"\n🚨 AGENT COMPLIANCE VIOLATIONS ({agent_type}):")
            for i, violation in enumerate(violations, 1):
                print(f"  {i}. {violation}")

            # Create violation log
            log_dir = Path('.claude/logs')
            log_dir.mkdir(exist_ok=True)

            with open(log_dir / 'agent_violations.log', 'a') as f:
                f.write(f"\n[{agent_type}] Violations found:\n")
                for violation in violations:
                    f.write(f"  - {violation}\n")

            print(f"\n📝 Violations logged to .claude/logs/agent_violations.log")
            print("🔄 Consider regenerating with corrected agent prompt")
        else:
            print(f"✅ Agent {agent_type} output passed validation")

    except Exception as e:
        print(f"❌ Validation hook error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()