import type { z } from 'zod';

import { formOptions } from '@tanstack/form-core';

import type { suggestFeatureInputSchema } from '@/lib/validations/feature-planner.validation';

export const featureSuggestionFormOptions = formOptions({
  defaultValues: {
    additionalContext: '',
    featureType: 'enhancement',
    pageOrComponent: '',
    priorityLevel: 'medium',
  } as z.input<typeof suggestFeatureInputSchema>,
});
