#!/usr/bin/env bun
/**
 * ESLint auto-fixer for Claude Code.
 * Runs ESLint --fix on edited JS/TS files after Edit/Write operations.
 */
import { execSync } from 'child_process';

interface ToolData {
  tool_input?: {
    file_path?: string;
  };
  tool_response?: {
    success?: boolean;
  };
}

async function main() {
  try {
    // Read JSON data from stdin (correct pattern per Claude Code docs)
    let inputData = '';
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    const data: ToolData = JSON.parse(inputData);
    const filePath = data.tool_input?.file_path;
    const toolSucceeded = data.tool_response?.success !== false;

    // Only run ESLint if the tool succeeded and file is a JS/TS file
    if (!toolSucceeded || !filePath) {
      process.exit(0);
    }

    if (/\.(js|jsx|ts|tsx)$/.test(filePath)) {
      // Run ESLint --fix on the file
      execSync(`npx eslint --fix "${filePath}"`, {
        stdio: 'inherit',
        cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
      });
    }

    process.exit(0);
  } catch (error) {
    // Silently ignore errors to avoid blocking the workflow
    // ESLint errors (syntax issues, etc.) shouldn't prevent Claude from continuing
    process.exit(0);
  }
}

main();
