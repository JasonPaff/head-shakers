import { query } from '@anthropic-ai/claude-code';
import { promises as fs } from 'fs';
import path from 'path';

import type { StepResult } from './types';

export class RefinementService {
  async refineFeatureRequest(
    request: string,
    orchestrationDir: string,
  ): Promise<StepResult> {
    const stepStart = Date.now();

    try {
      // Use Claude Code SDK to refine the feature request
      const messages = [];

      for await (const message of query({
        options: {
          allowedTools: ['Read'],
          customSystemPrompt: `You are a feature refinement agent for the Head Shakers bobblehead collection platform.

First, read CLAUDE.md and package.json to understand the project context, architecture, and available technologies.

Then refine the user's basic feature request into a detailed, single paragraph that:

REQUIREMENTS:
- Expands the basic request into 200-400 words
- Preserves ALL original concepts and intent
- Adds relevant technical implementation details based on project context
- Explains HOW it fits the existing architecture and patterns
- Uses project-specific technologies and patterns found in the files
- Outputs ONLY a single flowing paragraph with NO headers, bullets, or sections

Focus on WHAT will be implemented and HOW it integrates with the existing codebase.`,
          maxTurns: 3,
        },
        prompt: `Refine this feature request: "${request}"`,
      })) {
        messages.push(message);
      }

      const result = messages.find(m => m.type === 'result');
      if (!result || result.subtype !== 'success') {
        throw new Error('Failed to get successful refinement from Claude');
      }

      const refinedRequest = result.result.trim();

      // Save step log
      const logPath = path.join(orchestrationDir, '01-feature-refinement.md');
      const logContent = `# Step 1: Feature Refinement

**Started:** ${new Date(stepStart).toISOString()}
**Duration:** ${((Date.now() - stepStart) / 1000).toFixed(2)}s
**Status:** Success

## Original Request

${request}
**Word Count:** ${request.split(/\s+/).length} words

## Refined Feature Request

${refinedRequest}
**Word Count:** ${refinedRequest.split(/\s+/).length} words

## Claude Response Summary

- Total API Cost: $${result.total_cost_usd.toFixed(4)}
- API Duration: ${result.duration_api_ms}ms
- Total Turns: ${result.num_turns}
- Tokens Used: ${JSON.stringify(result.usage)}
`;

      await fs.writeFile(logPath, logContent);

      return {
        data: refinedRequest,
        isSuccessful: true,
      };
    } catch (error) {
      // Save error log
      const logPath = path.join(orchestrationDir, '01-feature-refinement.md');
      const errorLog = `# Step 1: Feature Refinement

**Started:** ${new Date(stepStart).toISOString()}
**Duration:** ${((Date.now() - stepStart) / 1000).toFixed(2)}s
**Status:** Failed

## Original Request

${request}

## Error Details

${error instanceof Error ? error.message : 'Unknown error'}
`;

      await fs.writeFile(logPath, errorLog).catch(() => {});

      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isSuccessful: false,
      };
    }
  }
}