import type { z } from 'zod';

import { formOptions } from '@tanstack/form-core';

import type { insertFeaturedContentSchema } from '@/lib/validations/system.validation';

import { DEFAULTS } from '@/lib/constants';

export const featuredContentFormOptions = formOptions({
  defaultValues: {
    contentId: '',
    contentType: 'collection',
    curatorNotes: '',
    description: '',
    endDate: undefined,
    featureType: 'editor_pick',
    imageUrl: '/placeholder.jpg',
    isActive: DEFAULTS.FEATURED_CONTENT.IS_ACTIVE,
    metadata: {},
    priority: '',
    sortOrder: '',
    startDate: undefined,
    title: '',
    viewCount: 0,
  } as z.input<typeof insertFeaturedContentSchema>,
});
