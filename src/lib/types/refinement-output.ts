import { z } from 'zod';

/**
 * Structured output format for feature refinement
 */
export const refinementOutputSchema = z.object({
  assumptions: z.array(z.string()).describe('Assumptions made during refinement'),
  confidence: z
    .enum(['high', 'medium', 'low'])
    .describe('Confidence level in the refinement quality'),
  estimatedScope: z
    .enum(['small', 'medium', 'large'])
    .describe('Estimated scope of the feature'),
  focus: z.string().describe('Primary focus area of this refinement'),
  keyRequirements: z
    .array(z.string())
    .min(1)
    .describe('List of key requirements identified'),
  refinedRequest: z
    .string()
    .min(50)
    .describe('Clear, detailed description of the feature request'),
  risks: z.array(z.string()).describe('Potential risks or concerns identified'),
  technicalComplexity: z
    .enum(['high', 'medium', 'low'])
    .describe('Estimated technical complexity'),
});

export type RefinementOutput = z.infer<typeof refinementOutputSchema>;

/**
 * Parse and validate refinement output from JSON string
 */
export const parseRefinementOutput = (jsonString: string): RefinementOutput => {
  try {
    const parsed: unknown = JSON.parse(jsonString);
    return refinementOutputSchema.parse(parsed);
  } catch (error) {
    throw new Error(
      `Failed to parse refinement output: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

/**
 * Extract JSON from markdown code blocks if present
 */
export const extractJsonFromMarkdown = (text: string): string => {
  // Try to extract JSON from markdown code blocks
  const jsonBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonBlockMatch?.[1]) {
    return jsonBlockMatch[1].trim();
  }

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch?.[0]) {
    return jsonMatch[0];
  }

  return text;
};
