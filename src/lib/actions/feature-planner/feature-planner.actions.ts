'use server';

import 'server-only';
import { query } from '@anthropic-ai/claude-code';

import { ACTION_NAMES } from '@/lib/constants';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { parallelRefinementRequestSchema } from '@/lib/validations/feature-planner.validation';

export const refineFeatureRequestAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.FEATURE_PLANNER.PARALLEL_REFINE_REQUEST,
  })
  .inputSchema(parallelRefinementRequestSchema)
  .action(async ({ ctx }) => {
    const { originalRequest, settings } = parallelRefinementRequestSchema.parse(ctx.sanitizedInput);

    let refinedRequest: string = '';

    for await (const message of query({
      options: {
        abortController: new AbortController(),
        allowedTools: ['Read'],
        model: 'claude-sonnet-4-20250514',
        permissionMode: 'bypassPermissions',
      },
      prompt: `Use the initial feature refinement agent to refine the following request: "${originalRequest}"
          CRITICAL: Output ONLY the refined paragraph. No headers, no prefixes like "Refined Request:", 
            no bullet points, no markdown formatting beyond the paragraph text. Just output the single 
            refined paragraph that adds essential technical context from the Head Shakers project stack.`,
    })) {
      if (message.type === 'result' && message.subtype === 'success') {
        console.log('Raw agent response:', message.result);

        let cleaned = message.result.trim();

        cleaned = cleaned
          .replace(/^(Refined Request:|Here is the refined request:|The refined request is:)/i, '')
          .trim();

        // remove any headers or Markdown formatting
        cleaned = cleaned.replace(/^#+\s*/gm, '').trim();
        // remove bullet points or numbered lists at the start
        cleaned = cleaned.replace(/^[\-\*\d\.]\s*/gm, '').trim();
        // take only the first paragraph if multiple paragraphs exist
        const firstParagraph = cleaned.split('\n\n')[0] ?? '';

        refinedRequest = firstParagraph.trim();
        console.log('Cleaned refined request:', refinedRequest);
      }
    }

    return {
      refinedRequest,
    };
  });
