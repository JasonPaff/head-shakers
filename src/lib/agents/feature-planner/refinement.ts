import { query } from '@anthropic-ai/claude-code';
import { promises as fs } from 'fs';
import path from 'path';

import type { StepResult } from './types';

import { FILE_PATHS, ORCHESTRATION_CONFIG, REFINEMENT_CONFIG } from './config';
import {
  createDetailedError,
  isClaudeSuccessResult,
  validateClaudeResult,
  validateFeatureRequest,
} from './validation-utils';

export class RefinementService {
  async refineFeatureRequest(request: string, orchestrationDir: string): Promise<StepResult> {
    const stepStart = Date.now();
    const stepLog = {
      errors: [] as Array<{ error: string; timestamp: string }>,
      metrics: {
        apiCalls: 0,
        apiDuration: 0,
        loadingDuration: 0,
        totalCost: 0,
        totalDuration: 0,
      },
      status: 'in_progress' as 'completed' | 'failed' | 'in_progress',
      timestamps: {
        contextLoadEnd: '',
        contextLoadStart: '',
        promptLoadEnd: '',
        promptLoadStart: '',
        queryEnd: '',
        queryStart: '',
        start: new Date(stepStart).toISOString(),
      },
    };

    try {
      // validate input request
      const validation = validateFeatureRequest(request);
      if (!validation.isValid) {
        stepLog.errors.push({
          error: `Validation failed: ${validation.errors.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
        throw createDetailedError('Feature request validation', {
          errors: validation.errors,
          request: request.substring(0, 100),
          wordCount: validation.wordCount,
        });
      }

      // load prompt template
      stepLog.timestamps.promptLoadStart = new Date().toISOString();
      const promptTemplate = await this.loadPromptTemplate();
      stepLog.timestamps.promptLoadEnd = new Date().toISOString();

      // load project context
      stepLog.timestamps.contextLoadStart = new Date().toISOString();
      const { claudeMd, packageJson } = await this.loadProjectContext();
      stepLog.timestamps.contextLoadEnd = new Date().toISOString();
      stepLog.metrics.loadingDuration = Date.now() - stepStart;

      // substitute template variables
      const customSystemPrompt = this.substituteTemplateVariables(promptTemplate, {
        CLAUDE_MD_CONTENT: claudeMd,
        PACKAGE_JSON_CONTENT: packageJson,
        USER_REQUEST: request,
      });

      // extract the prompt instruction from the template
      const promptInstruction = `Based on the user request and project context provided, generate a refined feature request that will help subsequent analysis stages better understand what needs to be implemented and how it should integrate with the existing codebase. Output ONLY the refined paragraph (100-250 words). No headers, no "Refined Request:" prefix, no analysis - just the single paragraph refinement.`;

      const messages = [];

      stepLog.timestamps.queryStart = new Date().toISOString();
      stepLog.metrics.apiCalls++;

      for await (const message of query({
        options: {
          allowedTools: REFINEMENT_CONFIG.allowedTools,
          customSystemPrompt,
          maxTurns: REFINEMENT_CONFIG.maxTurns,
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
        throw createDetailedError('Claude SDK response parsing', {
          messageCount: messages.length,
          messageTypes: messages.map((m) => m.type),
        });
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
        throw createDetailedError('Claude refinement execution', {
          apiDuration: validatedResult.duration_api_ms,
          cost: validatedResult.total_cost_usd,
          numTurns: validatedResult.num_turns,
          subtype: validatedResult.subtype,
        });
      }

      // type-safe access to success result
      const successResult = validatedResult;
      stepLog.metrics.apiDuration = successResult.duration_api_ms;
      stepLog.metrics.totalCost = successResult.total_cost_usd;

      // validate result content
      if (typeof successResult.result !== 'string') {
        stepLog.errors.push({
          error: `Invalid result type: ${typeof successResult.result}`,
          timestamp: new Date().toISOString(),
        });
        throw createDetailedError('Claude result validation', {
          resultPreview: String(successResult.result).substring(0, 100),
          resultType: typeof successResult.result,
        });
      }

      const refinedRequest = successResult.result.trim();

      if (!refinedRequest) {
        stepLog.errors.push({
          error: 'Empty refined request after trimming',
          timestamp: new Date().toISOString(),
        });
        throw createDetailedError('Claude result content validation', {
          originalLength: successResult.result.length,
          trimmedLength: refinedRequest.length,
        });
      }

      // update final metrics
      stepLog.metrics.totalDuration = Date.now() - stepStart;
      stepLog.status = 'completed';

      // create enhanced log content
      await this.saveEnhancedLog({
        orchestrationDir,
        refinedRequest,
        request,
        stepLog,
        successResult,
        validation,
      });

      return {
        data: refinedRequest,
        isSuccessful: true,
      };
    } catch (error) {
      // update error metrics
      stepLog.status = 'failed';
      stepLog.metrics.totalDuration = Date.now() - stepStart;
      stepLog.errors.push({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      // save error log
      await this.saveErrorLog({
        error: error instanceof Error ? error : new Error('Unknown error'),
        orchestrationDir,
        request,
        stepLog,
        stepStart,
      });

      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isSuccessful: false,
      };
    }
  }

  private calculateDuration(start: string | undefined, end: string | undefined): string {
    if (!start || !end) return 'N/A';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    return `${(duration / 1000).toFixed(3)}s`;
  }

  private async loadProjectContext(): Promise<{ claudeMd: string; packageJson: string }> {
    try {
      const [claudeMd, packageJson] = await Promise.all([
        fs.readFile(path.join(process.cwd(), FILE_PATHS.claudeMd), 'utf-8'),
        fs.readFile(path.join(process.cwd(), FILE_PATHS.packageJson), 'utf-8'),
      ]);
      return { claudeMd, packageJson };
    } catch (error) {
      throw createDetailedError('Loading project context', {
        error: error instanceof Error ? error.message : 'Unknown error',
        files: [FILE_PATHS.claudeMd, FILE_PATHS.packageJson],
      });
    }
  }

  private async loadPromptTemplate(): Promise<string> {
    try {
      const templatePath = path.join(process.cwd(), '.claude', 'commands', 'initial-feature-refinement.md');
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      throw createDetailedError('Loading prompt template', {
        error: error instanceof Error ? error.message : 'Unknown error',
        templatePath: '.claude/commands/initial-feature-refinement.md',
      });
    }
  }

  private async saveEnhancedLog(params: {
    orchestrationDir: string;
    refinedRequest: string;
    request: string;
    stepLog: {
      errors: Array<{ error: string; timestamp: string }>;
      metrics: {
        apiCalls: number;
        apiDuration: number;
        loadingDuration: number;
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
    validation: { errors: string[]; wordCount: number };
  }): Promise<void> {
    const { orchestrationDir, refinedRequest, request, stepLog, successResult, validation } = params;

    const logPath = path.join(orchestrationDir, `${ORCHESTRATION_CONFIG.stepFilePrefix.refinement}.md`);
    const logContent = `# Step 1: Feature Refinement

## Execution Summary

| Metric | Value |
|--------|-------|
| **Status** | ✅ ${stepLog.status} |
| **Total Duration** | ${(stepLog.metrics.totalDuration / 1000).toFixed(2)}s |
| **API Duration** | ${stepLog.metrics.apiDuration}ms |
| **Loading Duration** | ${(stepLog.metrics.loadingDuration / 1000).toFixed(2)}s |
| **Total Cost** | $${stepLog.metrics.totalCost.toFixed(4)} |
| **API Calls** | ${stepLog.metrics.apiCalls} |

## Timestamps

| Phase | Start | End | Duration |
|-------|-------|-----|----------|
| **Total Execution** | ${stepLog.timestamps.start} | ${new Date().toISOString()} | ${(stepLog.metrics.totalDuration / 1000).toFixed(2)}s |
| **Prompt Loading** | ${stepLog.timestamps.promptLoadStart || 'N/A'} | ${stepLog.timestamps.promptLoadEnd || 'N/A'} | ${this.calculateDuration(stepLog.timestamps.promptLoadStart, stepLog.timestamps.promptLoadEnd)} |
| **Context Loading** | ${stepLog.timestamps.contextLoadStart || 'N/A'} | ${stepLog.timestamps.contextLoadEnd || 'N/A'} | ${this.calculateDuration(stepLog.timestamps.contextLoadStart, stepLog.timestamps.contextLoadEnd)} |
| **Claude Query** | ${stepLog.timestamps.queryStart || 'N/A'} | ${stepLog.timestamps.queryEnd || 'N/A'} | ${this.calculateDuration(stepLog.timestamps.queryStart, stepLog.timestamps.queryEnd)} |

## Input Validation

| Check | Result |
|-------|--------|
| **Request Valid** | ✅ |
| **Word Count** | ${validation.wordCount} words |
| **Character Count** | ${request.length} characters |
| **Validation Errors** | ${validation.errors.length === 0 ? 'None' : validation.errors.join(', ')} |

## Original Request

\`\`\`
${request}
\`\`\`

**Statistics:**
- Word Count: ${request.split(/\s+/).length} words
- Character Count: ${request.length} characters

## Refined Feature Request

\`\`\`
${refinedRequest}
\`\`\`

**Statistics:**
- Word Count: ${refinedRequest.split(/\s+/).length} words
- Character Count: ${refinedRequest.length} characters
- Expansion Ratio: ${(refinedRequest.length / request.length).toFixed(2)}x

## Claude API Response

| Metric | Value |
|--------|-------|
| **Total API Cost** | $${successResult.total_cost_usd.toFixed(4)} |
| **API Duration** | ${successResult.duration_api_ms}ms |
| **Total Turns** | ${successResult.num_turns} |
| **Token Usage** | ${JSON.stringify(successResult.usage, null, 2)} |

## Configuration Used

| Setting | Value |
|---------|-------|
| **Max Turns** | ${REFINEMENT_CONFIG.maxTurns} |
| **Allowed Tools** | ${REFINEMENT_CONFIG.allowedTools.join(', ')} |
| **Target Word Range** | ${REFINEMENT_CONFIG.minWords}-${REFINEMENT_CONFIG.maxWords} words |
| **Prompt Template** | .claude/commands/initial-feature-refinement.md |
| **Context Files** | ${FILE_PATHS.claudeMd}, ${FILE_PATHS.packageJson} |

## Processing Log

${stepLog.errors.length > 0 ? `### Errors Encountered\n\n${stepLog.errors.map((e) => `- **${e.timestamp}**: ${e.error}`).join('\n')}` : '✅ No errors encountered during processing'}
`;

    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.writeFile(logPath, logContent);
  }

  private async saveErrorLog(params: {
    error: Error;
    orchestrationDir: string;
    request: string;
    stepLog: {
      errors: Array<{ error: string; timestamp: string }>;
      metrics: Record<string, number>;
      timestamps: Record<string, string>;
    };
    stepStart: number;
  }): Promise<void> {
    const { error, orchestrationDir, request, stepLog, stepStart } = params;

    const logPath = path.join(orchestrationDir, `${ORCHESTRATION_CONFIG.stepFilePrefix.refinement}.md`);
    const errorLog = `# Step 1: Feature Refinement

## Execution Summary

| Metric | Value |
|--------|-------|
| **Status** | ❌ Failed |
| **Duration** | ${((Date.now() - stepStart) / 1000).toFixed(2)}s |
| **Error Type** | ${error.constructor.name} |
| **Timestamp** | ${new Date().toISOString()} |

## Original Request

\`\`\`
${request}
\`\`\`

**Statistics:**
- Word Count: ${request.split(/\s+/).length} words
- Character Count: ${request.length} characters

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

## Configuration Used

| Setting | Value |
|---------|-------|
| **Max Turns** | ${REFINEMENT_CONFIG.maxTurns} |
| **Allowed Tools** | ${REFINEMENT_CONFIG.allowedTools.join(', ')} |
| **Target Word Range** | ${REFINEMENT_CONFIG.minWords}-${REFINEMENT_CONFIG.maxWords} words |
| **Prompt Template** | .claude/commands/initial-feature-refinement.md |

## Troubleshooting Information

- Ensure the prompt template exists at \`.claude/commands/initial-feature-refinement.md\`
- Verify that CLAUDE.md and package.json are present in the project root
- Check that the feature request meets validation requirements (3-100 words)
- Confirm Claude API access and sufficient credits
`;

    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.writeFile(logPath, errorLog).catch(() => {});
  }

  private substituteTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }
}
