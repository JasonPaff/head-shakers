import { z } from 'zod';

export const featureSuggestionAgentSchema = z.object({
  agentId: z.string(),
  agentType: z.literal('feature-suggestion'),
  createdAt: z.date(),
  focus: z.string(),
  isActive: z.boolean(),
  name: z.string(),
  role: z.string(),
  systemPrompt: z.string(),
  temperature: z.number().min(0).max(2),
  tools: z.array(z.enum(['Read', 'Grep', 'Glob'])),
  updatedAt: z.date(),
  userId: z.string(),
});

export type FeatureSuggestionAgent = z.infer<typeof featureSuggestionAgentSchema>;
