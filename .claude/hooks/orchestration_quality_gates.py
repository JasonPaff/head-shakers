#!/usr/bin/env python3
"""
Orchestration Quality Gates Hook
Validates each step of the plan-feature orchestration workflow.
"""
import json
import sys
import os
import re
from pathlib import Path
from datetime import datetime

def check_step1_refinement_quality(step_file_path):
    """Validate Step 1: Feature Request Refinement quality gates."""
    if not step_file_path.exists():
        return ["Step 1 log file missing"]

    content = step_file_path.read_text()
    violations = []

    # Check for original vs refined length analysis
    if "Length Analysis" not in content:
        violations.append("Missing length analysis section")

    # Check for scope preservation assessment
    if "Scope Analysis" not in content:
        violations.append("Missing scope preservation assessment")

    # Check for refined request extraction
    if "Refined Feature Request" not in content:
        violations.append("Missing refined feature request section")

    # Check word count is reasonable (look for excessive expansion)
    if "word count" in content.lower():
        # Extract word counts if documented
        word_count_match = re.search(r'(\d+)\s*words?', content)
        if word_count_match:
            word_count = int(word_count_match.group(1))
            if word_count > 500:
                violations.append(f"Refined request too long: {word_count} words (should be 150-300)")

    return violations

def check_step2_file_discovery_quality(step_file_path):
    """Validate Step 2: File Discovery quality gates."""
    if not step_file_path.exists():
        return ["Step 2 log file missing"]

    content = step_file_path.read_text()
    violations = []

    # Count discovered files
    file_patterns = [
        r'src/[^\s\n]+\.tsx?',
        r'src/[^\s\n]+\.jsx?',
        r'src/[^\s\n]+/[^\s\n]+\.(ts|js|tsx|jsx)'
    ]

    files_found = 0
    for pattern in file_patterns:
        files_found += len(re.findall(pattern, content))

    if files_found < 5:
        violations.append(f"Only {files_found} files discovered (minimum 5 required)")

    # Check for categorization
    if "HIGH PRIORITY" not in content and "high priority" not in content.lower():
        violations.append("Missing file prioritization categories")

    # Check for file validation
    if "validation" not in content.lower():
        violations.append("Missing file path validation section")

    return violations

def check_step3_implementation_planning_quality(step_file_path):
    """Validate Step 3: Implementation Planning quality gates."""
    if not step_file_path.exists():
        return ["Step 3 log file missing"]

    content = step_file_path.read_text()
    violations = []

    # Check for XML implementation plan
    if "<?xml" not in content:
        violations.append("Missing XML implementation plan")

    # Check for required XML sections
    required_xml_sections = [
        "<implementation-plan>",
        "<overview>",
        "<implementation-steps>",
        "<testing-strategy>",
        "<risk-assessment>"
    ]

    for section in required_xml_sections:
        if section not in content:
            violations.append(f"Missing required XML section: {section}")

    # Check for step count (should have reasonable number)
    step_matches = re.findall(r'<step id="\d+"', content)
    if len(step_matches) < 3:
        violations.append(f"Too few implementation steps: {len(step_matches)} (minimum 3)")

    return violations

def check_final_plan_quality(plan_file_path):
    """Validate final implementation plan quality."""
    if not plan_file_path.exists():
        return ["Final implementation plan missing"]

    content = plan_file_path.read_text()
    violations = []

    # Check for comprehensive content
    required_sections = [
        "File Discovery Results",
        "Implementation Plan",
        "Analysis Summary"
    ]

    for section in required_sections:
        if section not in content:
            violations.append(f"Missing section in final plan: {section}")

    return violations

def validate_orchestration_complete():
    """Validate complete orchestration workflow."""
    project_root = Path(os.getcwd())
    today = datetime.now().strftime("%Y_%m_%d")

    # Find orchestration directory (could be with underscores or hyphens)
    possible_dates = [
        today,
        today.replace("_", "_"),
        datetime.now().strftime("%Y-%m-%d")
    ]

    orchestration_dir = None
    for date_format in possible_dates:
        for date_str in [date_format, date_format.replace("-", "_")]:
            potential_dir = project_root / "docs" / date_str / "orchestration"
            if potential_dir.exists():
                orchestration_dir = potential_dir
                break
        if orchestration_dir:
            break

    if not orchestration_dir:
        return ["Could not find orchestration directory for today"]

    # Find feature directory (should be the only subdirectory)
    feature_dirs = [d for d in orchestration_dir.iterdir() if d.is_dir()]
    if not feature_dirs:
        return ["No feature orchestration directory found"]

    feature_dir = feature_dirs[0]  # Take the first/only one

    violations = []

    # Check each step
    step1_file = feature_dir / "01-feature-refinement.md"
    step2_file = feature_dir / "02-file-discovery.md"
    step3_file = feature_dir / "03-implementation-planning.md"
    index_file = feature_dir / "00-orchestration-index.md"

    violations.extend(check_step1_refinement_quality(step1_file))
    violations.extend(check_step2_file_discovery_quality(step2_file))
    violations.extend(check_step3_implementation_planning_quality(step3_file))

    # Check orchestration index
    if not index_file.exists():
        violations.append("Missing orchestration index file")

    # Check final plan
    plans_dir = orchestration_dir.parent / "plans"
    if plans_dir.exists():
        plan_files = list(plans_dir.glob("*implementation-plan.md"))
        if plan_files:
            violations.extend(check_final_plan_quality(plan_files[0]))
        else:
            violations.append("No implementation plan found in plans directory")
    else:
        violations.append("Plans directory missing")

    return violations

def main():
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)

        # Only run on completion of orchestration commands
        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})

        # Check if this is the end of a plan-feature command execution
        if tool_name == 'Bash':
            command = tool_input.get('command', '')
            if 'plan-feature' in command or 'orchestration' in command:
                # Run orchestration validation
                violations = validate_orchestration_complete()

                if violations:
                    print(f"\n🚨 ORCHESTRATION QUALITY VIOLATIONS:")
                    for i, violation in enumerate(violations, 1):
                        print(f"  {i}. {violation}")

                    # Log violations
                    log_dir = Path('.claude/logs')
                    log_dir.mkdir(exist_ok=True)

                    with open(log_dir / 'orchestration_quality.log', 'a') as f:
                        f.write(f"\n[{datetime.now().isoformat()}] Orchestration Quality Check:\n")
                        for violation in violations:
                            f.write(f"  - {violation}\n")

                    print(f"\n📝 Quality issues logged to .claude/logs/orchestration_quality.log")
                    print("🔧 Consider reviewing orchestration steps for improvements")
                else:
                    print("✅ Orchestration quality validation passed")

    except Exception as e:
        print(f"❌ Quality gates hook error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()