import { z } from 'zod';

export const featurePlanningInputSchema = z.object({
  featureRequest: z
    .string()
    .min(10, 'Feature request must be at least 10 characters')
    .max(1000, 'Feature request must be less than 1000 characters')
    .trim()
    .refine((value) => !/[<>]/.test(value), 'Feature request cannot contain HTML tags')
    .describe('A description of the feature to be planned'),
  skipRefinement: z.boolean().optional().describe('Whether to skip the refinement step'),
});

export const featureRefinementInputSchema = z.object({
  featureRequest: z
    .string()
    .min(10, 'Feature request must be at least 10 characters')
    .max(1000, 'Feature request must be less than 1000 characters')
    .trim()
    .refine((value) => !/[<>]/.test(value), 'Feature request cannot contain HTML tags')
    .describe('A description of the feature to be refined'),
});

export const featurePlanningResultSchema = z.object({
  discoveredFiles: z.array(z.string()).optional(),
  error: z.string().optional(),
  executionTime: z.number().optional(),
  implementationPlan: z.string().optional(),
  isSuccessful: z.boolean(),
  orchestrationPath: z.string().optional(),
  planPath: z.string().optional(),
  refinedRequest: z.string().optional(),
});

export const featureRefinementResultSchema = z.object({
  error: z.string().optional(),
  isSuccessful: z.boolean(),
  refinedRequest: z.string().optional(),
});

export type FeaturePlanningInput = z.infer<typeof featurePlanningInputSchema>;
export type FeaturePlanningResult = z.infer<typeof featurePlanningResultSchema>;
export type FeatureRefinementInput = z.infer<typeof featureRefinementInputSchema>;
export type FeatureRefinementResult = z.infer<typeof featureRefinementResultSchema>;
