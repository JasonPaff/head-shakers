#!/usr/bin/env node
/**
 * Neon Database Validation Hook for Head Shakers Project
 *
 * This hook intercepts Neon MCP tool calls to ensure:
 * 1. Correct project ID is always used
 * 2. The default database name is applied when missing
 * 3. Appropriate branch selection (development vs production)
 * 4. Safety checks for production operations
 * 5. Logging of all validation decisions
 *
 * Usage: Called automatically by Claude Code PreToolUse hook
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Promisify fs methods for async/await usage
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const appendFile = promisify(fs.appendFile);
const stat = promisify(fs.stat);

// Head Shakers Project Configuration
interface HeadShakersConfig {
  allowed_tools: Array<string>;
  database_name: string;
  development_branch: string;
  production_branch: string;
  project_id: string;
}

const HEAD_SHAKERS_CONFIG: HeadShakersConfig = {
  project_id: 'misty-boat-49919732',
  database_name: 'head-shakers',
  development_branch: 'br-dark-forest-adf48tll',
  production_branch: 'br-square-bread-ad4brhpk', // 'br-dry-forest-adjaydda',
  allowed_tools: [
    'mcp__Neon__list_projects',
    'mcp__Neon__describe_project',
    'mcp__Neon__run_sql',
    'mcp__Neon__run_sql_transaction',
    'mcp__Neon__describe_table_schema',
    'mcp__Neon__get_database_tables',
    'mcp__Neon__create_branch',
    'mcp__Neon__describe_branch',
    'mcp__Neon__delete_branch',
    'mcp__Neon__prepare_database_migration',
    'mcp__Neon__complete_database_migration',
    'mcp__Neon__prepare_query_tuning',
    'mcp__Neon__complete_query_tuning',
    'mcp__Neon__list_slow_queries',
    'mcp__Neon__explain_sql_statement',
    'mcp__Neon__get_connection_string',
    'mcp__Neon__reset_from_parent',
  ],
};

// Production operations that require extra caution
const PRODUCTION_SENSITIVE_TOOLS = [
  'mcp__Neon__list_projects',
  'mcp__Neon__describe_project',
  'mcp__Neon__run_sql',
  'mcp__Neon__run_sql_transaction',
  'mcp__Neon__describe_table_schema',
  'mcp__Neon__get_database_tables',
  'mcp__Neon__create_branch',
  'mcp__Neon__describe_branch',
  'mcp__Neon__delete_branch',
  'mcp__Neon__prepare_database_migration',
  'mcp__Neon__complete_database_migration',
  'mcp__Neon__prepare_query_tuning',
  'mcp__Neon__complete_query_tuning',
  'mcp__Neon__list_slow_queries',
  'mcp__Neon__explain_sql_statement',
  'mcp__Neon__get_connection_string',
  'mcp__Neon__reset_from_parent',
];

interface ToolCallData {
  tool_name: string;
  tool_input: Record<string, any>;
}

interface ValidationResult {
  modified: boolean;
  reason: string;
}

/**
 * Log validation decisions for audit and optimization
 */
async function logValidationDecision(
  decisionType: string,
  toolName: string,
  originalParams: Record<string, any>,
  modifiedParams: Record<string, any>,
  actionTaken: string,
): Promise<void> {
  try {
    // Create logs directory with current date
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
    const logDir = path.join('docs', today, 'database');

    await mkdir(logDir, { recursive: true });

    const logFile = path.join(logDir, 'validation-log.md');
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const logEntry = `
            ## ${timestamp} - ${decisionType}
            - **Tool**: ${toolName}
            - **Action**: ${actionTaken}
            - **Original Params**: ${JSON.stringify(originalParams, null, 2)}
            - **Modified Params**: ${JSON.stringify(modifiedParams, null, 2)}
`;

    // Check if the file exists and is empty to write header
    let shouldWriteHeader = false;
    try {
      const stats = await stat(logFile);
      shouldWriteHeader = stats.size === 0;
    } catch {
      shouldWriteHeader = true; // File doesn't exist
    }

    if (shouldWriteHeader) {
      const header = `# Neon Database Validation Log - ${today}\n\n`;
      await writeFile(logFile, header + logEntry, 'utf-8');
    } else {
      await appendFile(logFile, logEntry, 'utf-8');
    }
  } catch (error) {
    console.error(`Warning: Could not write to validation log: ${error}`);
  }
}

/**
 * Ensure the correct project ID is used
 */
function validateProjectId(params: Record<string, any>): ValidationResult {
  if (!('projectId' in params)) {
    params.projectId = HEAD_SHAKERS_CONFIG.project_id;
    return { modified: true, reason: 'Added missing project ID' };
  } else if (params.projectId !== HEAD_SHAKERS_CONFIG.project_id) {
    params.projectId = HEAD_SHAKERS_CONFIG.project_id;
    return { modified: true, reason: 'Corrected project ID to Head Shakers project' };
  }
  return { modified: false, reason: 'Project ID already correct' };
}

/**
 * Apply the default database name when missing
 */
function validateDatabaseName(params: Record<string, any>): ValidationResult {
  if (!('databaseName' in params) && !('database' in params)) {
    params.databaseName = HEAD_SHAKERS_CONFIG.database_name;
    return { modified: true, reason: 'Added default database name' };
  }
  return { modified: false, reason: 'Database name already specified' };
}

/**
 * Validate branch selection and warn about production usage
 */
function validateBranchUsage(toolName: string, params: Record<string, any>): ValidationResult {
  const branchId = params.branchId || '';

  // If no branch specified, default to development
  if (!branchId) {
    params.branchId = HEAD_SHAKERS_CONFIG.development_branch;
    return { modified: true, reason: 'Defaulted to development branch' };
  }

  // Check for production branch usage
  if (branchId === HEAD_SHAKERS_CONFIG.production_branch) {
    if (PRODUCTION_SENSITIVE_TOOLS.includes(toolName)) {
      // Block sensitive operations on production without explicit confirmation
      console.error('🚨 BLOCKED: Sensitive operation on production branch!');
      console.error('Use the neon-db-expert subagent with explicit production confirmation.');
      process.exit(2); // Block the operation
    } else {
      console.error('⚠️  WARNING: Operating on production branch');
      return { modified: false, reason: 'Production branch operation (allowed)' };
    }
  }

  return { modified: false, reason: 'Branch usage validated' };
}

/**
 * Determine if operation should be redirected to neon-db-expert subagent
 */
function shouldRedirectToSubagent(toolName: string, params: Record<string, any>): ValidationResult {
  // Complex operations that benefit from subagent expertise
  const complexOperations = [
    'mcp__Neon__prepare_database_migration',
    'mcp__Neon__prepare_query_tuning',
    'mcp__Neon__run_sql_transaction',
  ];

  // Operations on production branch
  if (params.branchId === HEAD_SHAKERS_CONFIG.production_branch) {
    return { modified: true, reason: 'Production operations should use neon-db-expert subagent' };
  }

  // Complex operations
  if (complexOperations.includes(toolName)) {
    return {
      modified: true,
      reason: `Complex operation ${toolName} recommended for neon-db-expert subagent`,
    };
  }

  return { modified: false, reason: 'Operation can proceed directly' };
}

/**
 * Main validation logic
 */
async function main(): Promise<void> {
  try {
    // Read tool call data from stdin
    let inputData = '';

    // Read from stdin in Node.js
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    const toolCallData: ToolCallData = JSON.parse(inputData);
    const toolName = toolCallData.tool_name || '';
    const originalParams = { ...toolCallData.tool_input };
    const params = toolCallData.tool_input || {};

    // Only process Neon MCP tools
    if (!toolName.startsWith('mcp__Neon__')) {
      process.exit(0); // Allow non-Neon tools to pass through
    }

    // Check if tool is allowed
    if (!HEAD_SHAKERS_CONFIG.allowed_tools.includes(toolName)) {
      console.error(`⚠️  Warning: ${toolName} not in standard tool list`);
    }

    // Apply validations
    const modifications: string[] = [];

    // Validate project ID
    let result = validateProjectId(params);
    if (result.modified) {
      modifications.push(result.reason);
    }

    // Validate database name
    result = validateDatabaseName(params);
    if (result.modified) {
      modifications.push(result.reason);
    }

    // Validate branch usage (may block operation)
    result = validateBranchUsage(toolName, params);
    if (result.modified) {
      modifications.push(result.reason);
    }

    // Check if should redirect to subagent
    const shouldRedirect = shouldRedirectToSubagent(toolName, params);

    // Log validation decision
    let decisionType = 'VALIDATION';
    let actionTaken = 'ALLOWED';

    if (modifications.length > 0) {
      decisionType = 'MODIFICATION';
      actionTaken = `MODIFIED: ${modifications.join(', ')}`;
    }

    if (shouldRedirect.modified) {
      decisionType = 'RECOMMENDATION';
      actionTaken = `SUGGEST_SUBAGENT: ${shouldRedirect.reason}`;
      console.error(`💡 RECOMMENDATION: ${shouldRedirect.reason}`);
    }

    await logValidationDecision(decisionType, toolName, originalParams, params, actionTaken);

    // Update the tool input with validated parameters
    toolCallData.tool_input = params;

    // Output the potentially modified tool call
    console.log(JSON.stringify(toolCallData, null, 2));

    // Exit successfully (allow operation to proceed)
    process.exit(0);
  } catch (error) {
    console.error(`Validation error: ${error}`);

    // Log error but don't block operation
    try {
      const toolName = 'unknown';
      const originalParams = {};
      await logValidationDecision('ERROR', toolName, originalParams, {}, `Validation script error: ${error}`);
    } catch {
      // Ignore logging errors
    }

    // Allow operation to proceed despite validation error
    try {
      const inputData = JSON.parse(process.argv[2] || '{}');
      console.log(JSON.stringify(inputData, null, 2));
    } catch {
      console.log('{}');
    }
    process.exit(0);
  }
}

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
