#!/usr/bin/env python3
"""
Neon Database Validation Hook for Head Shakers Project

This hook intercepts Neon MCP tool calls to ensure:
1. Correct project ID is always used
2. Default database name is applied when missing
3. Appropriate branch selection (development vs production)
4. Safety checks for production operations
5. Logging of all validation decisions

Usage: Called automatically by Claude Code PreToolUse hook
"""

import json
import sys
import os
from datetime import datetime
from pathlib import Path

# Head Shakers Project Configuration
HEAD_SHAKERS_CONFIG = {
    "project_id": "misty-boat-49919732",
    "database_name": "head-shakers",
    "development_branch": "br-dark-forest-adf48tll",
    "production_branch": "br-dry-forest-adjaydda",
    "allowed_tools": [
        "mcp__Neon__list_projects",
        "mcp__Neon__describe_project",
        "mcp__Neon__run_sql",
        "mcp__Neon__run_sql_transaction",
        "mcp__Neon__describe_table_schema",
        "mcp__Neon__get_database_tables",
        "mcp__Neon__create_branch",
        "mcp__Neon__describe_branch",
        "mcp__Neon__delete_branch",
        "mcp__Neon__prepare_database_migration",
        "mcp__Neon__complete_database_migration",
        "mcp__Neon__prepare_query_tuning",
        "mcp__Neon__complete_query_tuning",
        "mcp__Neon__list_slow_queries",
        "mcp__Neon__explain_sql_statement",
        "mcp__Neon__get_connection_string",
        "mcp__Neon__reset_from_parent"
    ]
}

# Production operations that require extra caution
PRODUCTION_SENSITIVE_TOOLS = [
    "mcp__Neon__complete_database_migration",
    "mcp__Neon__delete_branch",
    "mcp__Neon__reset_from_parent",
    "mcp__Neon__run_sql_transaction"
]

def log_validation_decision(decision_type, tool_name, original_params, modified_params, action_taken):
    """Log validation decisions for audit and optimization"""
    try:
        # Create logs directory with current date
        today = datetime.now().strftime("%Y_%m_%d")
        log_dir = Path(f"docs/{today}/database")
        log_dir.mkdir(parents=True, exist_ok=True)

        log_file = log_dir / "validation-log.md"

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        log_entry = f"""
## {timestamp} - {decision_type}
- **Tool**: {tool_name}
- **Action**: {action_taken}
- **Original Params**: {json.dumps(original_params, indent=2)}
- **Modified Params**: {json.dumps(modified_params, indent=2)}

"""

        # Append to log file
        with open(log_file, "a", encoding="utf-8") as f:
            if not log_file.exists() or log_file.stat().st_size == 0:
                f.write(f"# Neon Database Validation Log - {today}\n\n")
            f.write(log_entry)

    except Exception as e:
        print(f"Warning: Could not write to validation log: {e}", file=sys.stderr)

def validate_project_id(params):
    """Ensure correct project ID is used"""
    if "projectId" not in params:
        params["projectId"] = HEAD_SHAKERS_CONFIG["project_id"]
        return True, "Added missing project ID"
    elif params["projectId"] != HEAD_SHAKERS_CONFIG["project_id"]:
        params["projectId"] = HEAD_SHAKERS_CONFIG["project_id"]
        return True, "Corrected project ID to Head Shakers project"
    return False, "Project ID already correct"

def validate_database_name(params):
    """Apply default database name when missing"""
    if "databaseName" not in params and "database" not in params:
        params["databaseName"] = HEAD_SHAKERS_CONFIG["database_name"]
        return True, "Added default database name"
    return False, "Database name already specified"

def validate_branch_usage(tool_name, params):
    """Validate branch selection and warn about production usage"""
    branch_id = params.get("branchId", "")

    # If no branch specified, default to development
    if not branch_id:
        params["branchId"] = HEAD_SHAKERS_CONFIG["development_branch"]
        return True, "Defaulted to development branch"

    # Check for production branch usage
    if branch_id == HEAD_SHAKERS_CONFIG["production_branch"]:
        if tool_name in PRODUCTION_SENSITIVE_TOOLS:
            # Block sensitive operations on production without explicit confirmation
            print("🚨 BLOCKED: Sensitive operation on production branch!", file=sys.stderr)
            print("Use the neon-db-expert subagent with explicit production confirmation.", file=sys.stderr)
            sys.exit(2)  # Block the operation
        else:
            print("⚠️  WARNING: Operating on production branch", file=sys.stderr)
            return False, "Production branch operation (allowed)"

    return False, "Branch usage validated"

def should_redirect_to_subagent(tool_name, params):
    """Determine if operation should be redirected to neon-db-expert subagent"""
    # Complex operations that benefit from subagent expertise
    complex_operations = [
        "mcp__Neon__prepare_database_migration",
        "mcp__Neon__prepare_query_tuning",
        "mcp__Neon__run_sql_transaction"
    ]

    # Operations on production branch
    if params.get("branchId") == HEAD_SHAKERS_CONFIG["production_branch"]:
        return True, "Production operations should use neon-db-expert subagent"

    # Complex operations
    if tool_name in complex_operations:
        return True, f"Complex operation {tool_name} recommended for neon-db-expert subagent"

    return False, "Operation can proceed directly"

def main():
    """Main validation logic"""
    try:
        # Read tool call data from stdin
        input_data = json.load(sys.stdin)

        tool_name = input_data.get("tool_name", "")
        original_params = input_data.get("tool_input", {}).copy()
        params = input_data.get("tool_input", {})

        # Only process Neon MCP tools
        if not tool_name.startswith("mcp__Neon__"):
            sys.exit(0)  # Allow non-Neon tools to pass through

        # Check if tool is allowed
        if tool_name not in HEAD_SHAKERS_CONFIG["allowed_tools"]:
            print(f"⚠️  Warning: {tool_name} not in standard tool list", file=sys.stderr)

        # Apply validations
        modifications = []

        # Validate project ID
        modified, reason = validate_project_id(params)
        if modified:
            modifications.append(reason)

        # Validate database name
        modified, reason = validate_database_name(params)
        if modified:
            modifications.append(reason)

        # Validate branch usage (may block operation)
        modified, reason = validate_branch_usage(tool_name, params)
        if modified:
            modifications.append(reason)

        # Check if should redirect to subagent
        should_redirect, redirect_reason = should_redirect_to_subagent(tool_name, params)

        # Log validation decision
        decision_type = "VALIDATION"
        action_taken = "ALLOWED"

        if modifications:
            decision_type = "MODIFICATION"
            action_taken = f"MODIFIED: {', '.join(modifications)}"

        if should_redirect:
            decision_type = "RECOMMENDATION"
            action_taken = f"SUGGEST_SUBAGENT: {redirect_reason}"
            print(f"💡 RECOMMENDATION: {redirect_reason}", file=sys.stderr)

        log_validation_decision(decision_type, tool_name, original_params, params, action_taken)

        # Update the tool input with validated parameters
        input_data["tool_input"] = params

        # Output the potentially modified tool call
        json.dump(input_data, sys.stdout, indent=2)

        # Exit successfully (allow operation to proceed)
        sys.exit(0)

    except Exception as e:
        print(f"Validation error: {e}", file=sys.stderr)

        # Log error but don't block operation
        try:
            log_validation_decision("ERROR", tool_name if 'tool_name' in locals() else "unknown",
                                  original_params if 'original_params' in locals() else {},
                                  {}, f"Validation script error: {e}")
        except:
            pass

        # Allow operation to proceed despite validation error
        if 'input_data' in locals():
            json.dump(input_data, sys.stdout, indent=2)
        sys.exit(0)

if __name__ == "__main__":
    main()