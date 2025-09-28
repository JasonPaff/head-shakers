import { z } from 'zod';

/**
 * Validation schemas for feature planner operations
 */

export const refinementSettingsSchema = z.object({
  agentCount: z.number().int().min(1).max(5).default(1),
  agentTimeoutMs: z.number().int().min(15000).max(60000).default(30000),
  includeProjectContext: z.boolean().default(true),
  maxOutputLength: z.number().int().min(100).max(500).default(250),
  refinementStyle: z.enum(['conservative', 'balanced', 'detailed']).default('balanced'),
  technicalDetailLevel: z.enum(['minimal', 'moderate', 'comprehensive']).default('moderate'),
});

export const featureRefinementRequestSchema = z.object({
  options: z
    .object({
      maxRetries: z.number().int().min(1).max(3).optional(),
      shouldFallbackToSimplePrompt: z.boolean().optional(),
      timeoutMs: z.number().int().min(10000).max(45000).optional(),
    })
    .optional(),
  originalRequest: z
    .string()
    .min(5, 'Feature request must be at least 5 characters')
    .max(500, 'Feature request must be 500 characters or less for security')
    .trim()
    .refine(
      (val) => {
        // Basic XSS protection - reject common script patterns
        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /eval\s*\(/i,
          /expression\s*\(/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
      },
      { message: 'Invalid characters detected in feature request' },
    )
    .refine(
      (val) => {
        // reject excessive special characters that might indicate injection attempts
        const specialCharCount = (val.match(/[<>{}[\]\\|`~]/g) || []).length;
        return specialCharCount <= 5;
      },
      { message: 'Too many special characters in feature request' },
    ),
  settings: refinementSettingsSchema.optional(),
});

export const parallelRefinementRequestSchema = z.object({
  originalRequest: z
    .string()
    .min(5, 'Feature request must be at least 5 characters')
    .max(500, 'Feature request must be 500 characters or less for security')
    .trim(),
  settings: refinementSettingsSchema,
});

export const featureRefinementResponseSchema = z.object({
  error: z.string().max(200).optional(),
  isSuccess: z.boolean(),
  refinedRequest: z.string().max(1000),
  retryCount: z.number().int().min(0).max(10).optional(),
});

export const refinementResultSchema = z.object({
  agentId: z.string(),
  error: z.string().max(200).optional(),
  executionTimeMs: z.number().int().min(0),
  isSuccess: z.boolean(),
  refinedRequest: z.string().max(1000),
  wordCount: z.number().int().min(0),
});

export const parallelRefinementResponseSchema = z.object({
  executionTimeMs: z.number().int().min(0),
  isSuccess: z.boolean(),
  results: z.array(refinementResultSchema),
  settings: refinementSettingsSchema,
  successCount: z.number().int().min(0),
  totalAgents: z.number().int().min(1).max(5),
});

export type FeatureRefinementRequest = z.infer<typeof featureRefinementRequestSchema>;
export type FeatureRefinementResponse = z.infer<typeof featureRefinementResponseSchema>;
export type ParallelRefinementRequest = z.infer<typeof parallelRefinementRequestSchema>;
export type ParallelRefinementResponse = z.infer<typeof parallelRefinementResponseSchema>;
export type RefinementResult = z.infer<typeof refinementResultSchema>;
export type RefinementSettings = z.infer<typeof refinementSettingsSchema>;
