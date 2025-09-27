import { query } from '@anthropic-ai/claude-code';
import { promises as fs } from 'fs';
import path from 'path';

import type { StepResult } from './types';

import { isClaudeSuccessResult, validateClaudeResult } from './validation-utils';

interface ProjectContext {
  architecture: {
    authSystem: string;
    database: string;
    framework: string;
    stateManagement: string[];
    styling: string;
  };
  codebase: {
    formatting: string;
    isTypeCheckingEnabled: boolean;
    linting: string;
    testingFramework: string;
  };
  documentation: {
    claudeMd: string;
    packageInfo: Record<string, unknown>;
    readme: string;
  };
  infrastructure: {
    caching: string;
    deployment: string;
    monitoring: string;
    realtime: string;
  };
  patterns: {
    componentStructure: string;
    hasServerActions: boolean;
    isTypeSafetyEnabled: boolean;
    routingPattern: string;
  };
}

export class PlanGenerationService {
  async generateImplementationPlan(
    refinedRequest: string,
    discoveredFiles: string[],
    contextData: ProjectContext,
    orchestrationDir: string,
  ): Promise<StepResult> {
    const stepStart = Date.now();
    const stepLog = {
      errors: [] as Array<{ error: string; timestamp: string }>,
      metrics: {
        apiCalls: 0,
        apiDuration: 0,
        totalCost: 0,
        totalDuration: 0,
      },
      status: 'in_progress' as 'completed' | 'failed' | 'in_progress',
      timestamps: {
        promptStart: '',
        queryEnd: '',
        queryStart: '',
        start: new Date(stepStart).toISOString(),
      },
    };

    try {
      // build comprehensive prompt for plan generation
      stepLog.timestamps.promptStart = new Date().toISOString();
      const systemPrompt = this.buildSystemPrompt(refinedRequest, discoveredFiles, contextData);

      const promptInstruction = `Based on the refined feature request, discovered files, and project context, generate a comprehensive implementation plan that follows the Head Shakers project patterns.

The plan should include:
1. Analysis summary with file discovery results
2. Detailed step-by-step implementation with specific file modifications
3. What/Why/Confidence structure for each step
4. Specific validation commands based on the project setup
5. Measurable success criteria
6. Quality gates and testing requirements

Format the response as a detailed markdown implementation plan similar to professional project documentation.`;

      const messages = [];

      stepLog.timestamps.queryStart = new Date().toISOString();
      stepLog.metrics.apiCalls++;

      for await (const message of query({
        options: {
          allowedTools: ['Read'],
          customSystemPrompt: systemPrompt,
          maxTurns: 3,
        },
        prompt: promptInstruction,
      })) {
        messages.push(message);
      }

      stepLog.timestamps.queryEnd = new Date().toISOString();

      // find and validate the result message
      const resultMessage = messages.find((m) => m.type === 'result');
      if (!resultMessage) {
        stepLog.errors.push({
          error: `No result message found. Message count: ${messages.length}`,
          timestamp: new Date().toISOString(),
        });
        throw new Error(`No result message found`);
      }

      // validate the Claude result structure
      const validatedResult = validateClaudeResult(resultMessage);

      if (!isClaudeSuccessResult(validatedResult)) {
        stepLog.errors.push({
          error: `Claude execution failed with subtype: ${validatedResult.subtype}`,
          timestamp: new Date().toISOString(),
        });
        stepLog.metrics.apiDuration = validatedResult.duration_api_ms;
        stepLog.metrics.totalCost = validatedResult.total_cost_usd;
        throw new Error(`Claude plan generation failed: ${validatedResult.subtype}`);
      }

      const successResult = validatedResult;
      stepLog.metrics.apiDuration = successResult.duration_api_ms;
      stepLog.metrics.totalCost = successResult.total_cost_usd;

      if (typeof successResult.result !== 'string') {
        stepLog.errors.push({
          error: `Invalid result type: ${typeof successResult.result}`,
          timestamp: new Date().toISOString(),
        });
        throw new Error(`Invalid result type: ${typeof successResult.result}`);
      }

      const implementationPlan = successResult.result.trim();

      if (!implementationPlan) {
        stepLog.errors.push({
          error: 'Empty implementation plan after trimming',
          timestamp: new Date().toISOString(),
        });
        throw new Error('Empty implementation plan');
      }

      // update final metrics
      stepLog.metrics.totalDuration = Date.now() - stepStart;
      stepLog.status = 'completed';

      // save enhanced step log
      await this.saveStepLog({
        discoveredFiles,
        implementationPlan,
        orchestrationDir,
        refinedRequest,
        stepLog,
        successResult,
      });

      return {
        data: implementationPlan,
        isSuccessful: true,
      };
    } catch (error) {
      stepLog.status = 'failed';
      stepLog.metrics.totalDuration = Date.now() - stepStart;
      stepLog.errors.push({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      // save error log
      await this.saveErrorLog({
        contextData,
        discoveredFiles,
        error: error instanceof Error ? error : new Error('Unknown error'),
        orchestrationDir,
        refinedRequest,
        stepLog,
        stepStart,
      });

      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isSuccessful: false,
      };
    }
  }

  private buildSystemPrompt(refinedRequest: string, discoveredFiles: string[], contextData: ProjectContext): string {
    return `You are an expert software architect creating implementation plans for the Head Shakers bobblehead collection platform.

# Project Context

## Architecture
- Framework: ${contextData.architecture.framework}
- Authentication: ${contextData.architecture.authSystem}
- Database: ${contextData.architecture.database}
- Styling: ${contextData.architecture.styling}
- State Management: ${contextData.architecture.stateManagement.join(', ')}

## Development Patterns
- Server Actions: ${contextData.patterns.hasServerActions ? 'Yes' : 'No'}
- Type Safety: ${contextData.patterns.isTypeSafetyEnabled ? 'Yes' : 'No'}
- Component Structure: ${contextData.patterns.componentStructure}
- Routing: ${contextData.patterns.routingPattern}

## Infrastructure
- Deployment: ${contextData.infrastructure.deployment}
- Monitoring: ${contextData.infrastructure.monitoring}
- Caching: ${contextData.infrastructure.caching}
- Real-time: ${contextData.infrastructure.realtime}

## Code Quality
- Testing: ${contextData.codebase.testingFramework}
- Linting: ${contextData.codebase.linting}
- Formatting: ${contextData.codebase.formatting}
- Type Checking: ${contextData.codebase.isTypeCheckingEnabled ? 'Yes' : 'No'}

# Feature Request

${refinedRequest}

# Discovered Files (${discoveredFiles.length})

${discoveredFiles.map((file, index) => `${index + 1}. ${file}`).join('\n')}

# Instructions

Create a detailed implementation plan that:
1. References specific discovered files in implementation steps
2. Follows the project's architectural patterns
3. Includes proper validation commands for this project
4. Provides step-by-step file modifications
5. Includes comprehensive testing strategy
6. Follows the quality standards and conventions

The plan should be professional, detailed, and actionable - similar to enterprise software project documentation.`;
  }

  private async saveErrorLog(params: {
    contextData: ProjectContext;
    discoveredFiles: string[];
    error: Error;
    orchestrationDir: string;
    refinedRequest: string;
    stepLog: {
      errors: Array<{ error: string; timestamp: string }>;
      metrics: Record<string, number>;
      timestamps: Record<string, string>;
    };
    stepStart: number;
  }): Promise<void> {
    const { contextData, discoveredFiles, error, orchestrationDir, refinedRequest, stepLog, stepStart } = params;

    const logPath = path.join(orchestrationDir, '03-implementation-planning.md');
    const errorLog = `# Step 3: Implementation Planning

## Execution Summary

| Metric | Value |
|--------|-------|
| **Status** | ❌ Failed |
| **Duration** | ${((Date.now() - stepStart) / 1000).toFixed(2)}s |
| **Error Type** | ${error.constructor.name} |
| **Timestamp** | ${new Date().toISOString()} |

## Input Context

### Refined Request
${refinedRequest}

### Discovered Files (${discoveredFiles.length})
${discoveredFiles.map((f, i) => `${i + 1}. ${f}`).join('\n')}

### Project Architecture
- Framework: ${contextData.architecture.framework}
- Database: ${contextData.architecture.database}
- Authentication: ${contextData.architecture.authSystem}

## Error Details

\`\`\`
${error.message}
\`\`\`

${error.stack ? `### Stack Trace\n\n\`\`\`\n${error.stack}\n\`\`\`` : ''}

## Processing Timeline

${Object.entries(stepLog.timestamps)
  .filter(([, value]) => value)
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join('\n')}

## Error Log

${stepLog.errors.map((e) => `- **${e.timestamp}**: ${e.error}`).join('\n')}

## Troubleshooting Information

- Ensure Claude API access and sufficient credits
- Verify all discovered files exist and are accessible
- Check that project context data is properly formatted
- Confirm that the refined request meets quality requirements
`;

    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.writeFile(logPath, errorLog).catch(() => {});
  }

  private async saveStepLog(params: {
    discoveredFiles: string[];
    implementationPlan: string;
    orchestrationDir: string;
    refinedRequest: string;
    stepLog: {
      errors: Array<{ error: string; timestamp: string }>;
      metrics: {
        apiCalls: number;
        apiDuration: number;
        totalCost: number;
        totalDuration: number;
      };
      status: string;
      timestamps: Record<string, string>;
    };
    successResult: {
      duration_api_ms: number;
      num_turns: number;
      total_cost_usd: number;
      usage: Record<string, number>;
    };
  }): Promise<void> {
    const { discoveredFiles, implementationPlan, orchestrationDir, refinedRequest, stepLog, successResult } = params;

    const logPath = path.join(orchestrationDir, '03-implementation-planning.md');
    const logContent = `# Step 3: Implementation Planning

## Execution Summary

| Metric | Value |
|--------|-------|
| **Status** | ✅ ${stepLog.status} |
| **Total Duration** | ${(stepLog.metrics.totalDuration / 1000).toFixed(2)}s |
| **API Duration** | ${stepLog.metrics.apiDuration}ms |
| **Total Cost** | $${stepLog.metrics.totalCost.toFixed(4)} |
| **API Calls** | ${stepLog.metrics.apiCalls} |

## Input Context

### Refined Request
${refinedRequest}

### Discovered Files (${discoveredFiles.length})
${discoveredFiles.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## Generated Implementation Plan

${implementationPlan}

## Claude API Response

| Metric | Value |
|--------|-------|
| **Total API Cost** | $${successResult.total_cost_usd.toFixed(4)} |
| **API Duration** | ${successResult.duration_api_ms}ms |
| **Total Turns** | ${successResult.num_turns} |
| **Token Usage** | ${JSON.stringify(successResult.usage, null, 2)} |

## Processing Log

${stepLog.errors.length > 0 ? `### Errors Encountered\n\n${stepLog.errors.map((e) => `- **${e.timestamp}**: ${e.error}`).join('\n')}` : '✅ No errors encountered during processing'}
`;

    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.writeFile(logPath, logContent);
  }
}
