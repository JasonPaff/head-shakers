import type { z } from 'zod';

import { formOptions } from '@tanstack/form-core';

import type { insertFeaturedContentSchema } from '@/lib/validations/system.validation';

import { DEFAULTS } from '@/lib/constants';

export const featuredContentFormOptions = formOptions({
  defaultValues: {
    contentId: '',
    contentType: DEFAULTS.FEATURED_CONTENT.CONTENT_TYPE,
    curatorNotes: '',
    description: '',
    endDate: undefined,
    featureType: 'editor_pick',
    imageUrl: '/placeholder.jpg',
    isActive: DEFAULTS.FEATURED_CONTENT.IS_ACTIVE,
    priority: DEFAULTS.FEATURED_CONTENT.PRIORITY.toString(),
    sortOrder: DEFAULTS.FEATURED_CONTENT.SORT_ORDER.toString(),
    startDate: undefined,
    title: '',
    viewCount: 0,
  } as z.input<typeof insertFeaturedContentSchema>,
});
