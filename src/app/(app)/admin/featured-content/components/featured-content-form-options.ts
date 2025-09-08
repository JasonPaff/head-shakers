import { formOptions } from '@tanstack/form-core';

import { DEFAULTS } from '@/lib/constants';

export const featuredContentFormOptions = formOptions({
  defaultValues: {
    contentId: '',
    contentType: 'collection' as const,
    curatorNotes: '',
    description: '',
    endDate: undefined,
    featureType: 'editor_pick' as const,
    imageUrl: undefined as string | undefined,
    isActive: DEFAULTS.FEATURED_CONTENT.IS_ACTIVE,
    metadata: {} as Record<string, unknown>,
    priority: 0,
    sortOrder: DEFAULTS.FEATURED_CONTENT.SORT_ORDER,
    startDate: undefined,
    title: '',
    viewCount: 0,
  },
});
