import type { z } from 'zod';

import { formOptions } from '@tanstack/form-core';

import type { featureSuggestionAgentInputSchema } from '@/lib/validations/feature-planner.validation';

export const suggestionAgentFormOptions = formOptions({
  defaultValues: {
    agentId: '',
    focus: '',
    name: '',
    role: '',
    systemPrompt: '',
    temperature: 1.0,
    tools: ['Read', 'Grep', 'Glob'],
  } as z.input<typeof featureSuggestionAgentInputSchema>,
});
