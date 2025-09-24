import { query } from '@anthropic-ai/claude-code';
import { promises as fs } from 'fs';
import path from 'path';

import type { StepResult } from './types';

import { ORCHESTRATION_CONFIG, REFINEMENT_CONFIG } from './config';
import {
  createDetailedError,
  isClaudeSuccessResult,
  validateClaudeResult,
  validateFeatureRequest,
} from './validation-utils';

export class RefinementService {
  async refineFeatureRequest(request: string, orchestrationDir: string): Promise<StepResult> {
    const stepStart = Date.now();

    try {
      // validate input feature request
      const validation = validateFeatureRequest(request);
      if (!validation.isValid) {
        throw createDetailedError('Feature request validation', {
          errors: validation.errors,
          request: request.substring(0, 100), // Truncate for logging
          wordCount: validation.wordCount,
        });
      }

      const messages = [];

      for await (const message of query({
        options: {
          allowedTools: REFINEMENT_CONFIG.allowedTools,
          customSystemPrompt: `You are a feature refinement agent for the Head Shakers bobblehead collection platform.

First, read ${ORCHESTRATION_CONFIG.stepFilePrefix.refinement.replace('01-', '')} and package.json to understand the project context, architecture, and available technologies.

Then refine the user's basic feature request into a detailed, single paragraph that:

REQUIREMENTS:
- Expands the basic request into ${REFINEMENT_CONFIG.minWords}-${REFINEMENT_CONFIG.maxWords} words
- Preserves ALL original concepts and intent
- Adds relevant technical implementation details based on project context
- Focus on minimum viable implementation to deliver core value
- Explains HOW it fits the existing architecture and patterns
- Uses project-specific technologies and patterns found in the files
- Outputs ONLY a single flowing paragraph with NO headers, bullets, or sections

Focus on WHAT will be implemented and HOW it integrates with the existing codebase.`,
          maxTurns: REFINEMENT_CONFIG.maxTurns,
        },
        prompt: `Refine this feature request: "${request}"`,
      })) {
        messages.push(message);
      }

      // find and validate the result message
      const resultMessage = messages.find((m) => m.type === 'result');
      if (!resultMessage) {
        throw createDetailedError('Claude SDK response parsing', {
          messageCount: messages.length,
          messageTypes: messages.map((m) => m.type),
        });
      }

      // validate the Claude result structure
      const validatedResult = validateClaudeResult(resultMessage);

      if (!isClaudeSuccessResult(validatedResult)) {
        throw createDetailedError('Claude refinement execution', {
          apiDuration: validatedResult.duration_api_ms,
          cost: validatedResult.total_cost_usd,
          numTurns: validatedResult.num_turns,
          subtype: validatedResult.subtype,
        });
      }

      // type-safe access to success result
      const successResult = validatedResult;

      // validate result content
      if (typeof successResult.result !== 'string') {
        throw createDetailedError('Claude result validation', {
          resultPreview: String(successResult.result).substring(0, 100),
          resultType: typeof successResult.result,
        });
      }

      const refinedRequest = successResult.result.trim();

      if (!refinedRequest) {
        throw createDetailedError('Claude result content validation', {
          originalLength: successResult.result.length,
          trimmedLength: refinedRequest.length,
        });
      }

      // save step log
      const logPath = path.join(orchestrationDir, `${ORCHESTRATION_CONFIG.stepFilePrefix.refinement}.md`);
      const logContent = `# Step 1: Feature Refinement

**Started:** ${new Date(stepStart).toISOString()}
**Duration:** ${((Date.now() - stepStart) / 1000).toFixed(2)}s
**Status:** Success

## Input Validation

- Original request valid: ✅
- Word count: ${validation.wordCount} words
- Validation errors: ${validation.errors.length === 0 ? 'None' : validation.errors.join(', ')}

## Original Request

${request}
**Word Count:** ${request.split(/\s+/).length} words

## Refined Feature Request

${refinedRequest}
**Word Count:** ${refinedRequest.split(/\s+/).length} words

## Claude Response Summary

- Total API Cost: $${successResult.total_cost_usd.toFixed(4)}
- API Duration: ${successResult.duration_api_ms}ms
- Total Turns: ${successResult.num_turns}
- Tokens Used: ${JSON.stringify(successResult.usage)}

## Configuration Used

- Max Turns: ${REFINEMENT_CONFIG.maxTurns}
- Allowed Tools: ${REFINEMENT_CONFIG.allowedTools.join(', ')}
- Target Word Range: ${REFINEMENT_CONFIG.minWords}-${REFINEMENT_CONFIG.maxWords} words
`;

      await fs.writeFile(logPath, logContent);

      return {
        data: refinedRequest,
        isSuccessful: true,
      };
    } catch (error) {
      // enhanced error logging
      const errorDetails = error instanceof Error ? error.message : 'Unknown error';
      const logPath = path.join(orchestrationDir, `${ORCHESTRATION_CONFIG.stepFilePrefix.refinement}.md`);
      const errorLog = `# Step 1: Feature Refinement

**Started:** ${new Date(stepStart).toISOString()}
**Duration:** ${((Date.now() - stepStart) / 1000).toFixed(2)}s
**Status:** Failed

## Original Request

${request}

## Configuration Used

- Max Turns: ${REFINEMENT_CONFIG.maxTurns}
- Allowed Tools: ${REFINEMENT_CONFIG.allowedTools.join(', ')}
- Target Word Range: ${REFINEMENT_CONFIG.minWords}-${REFINEMENT_CONFIG.maxWords} words

## Error Details

${errorDetails}

## Troubleshooting Information

- Error Type: ${error instanceof Error ? error.constructor.name : 'Unknown'}
- Timestamp: ${new Date().toISOString()}
- Request Length: ${request.length} characters
- Request Word Count: ${request.split(/\s+/).length} words
`;

      await fs.writeFile(logPath, errorLog).catch(() => {});

      return {
        error: errorDetails,
        isSuccessful: false,
      };
    }
  }
}
