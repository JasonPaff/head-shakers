import type { z } from 'zod';

import { formOptions } from '@tanstack/form-core';

import type { insertBobbleheadSchema } from '@/lib/validations/bobbleheads.validation';

import { DEFAULTS } from '@/lib/constants';

export const addItemFormOptions = formOptions({
  defaultValues: {
    acquisitionDate: '',
    acquisitionMethod: '',
    category: '',
    characterName: '',
    collectionId: '',
    currentCondition: DEFAULTS.BOBBLEHEAD.CONDITION,
    customFields: [],
    description: '',
    height: '',
    isFeatured: DEFAULTS.BOBBLEHEAD.IS_FEATURED,
    isPublic: DEFAULTS.BOBBLEHEAD.IS_PUBLIC,
    manufacturer: '',
    material: '',
    name: '',
    photos: [] as File[],
    purchaseLocation: '',
    purchasePrice: '',
    series: '',
    status: DEFAULTS.BOBBLEHEAD.STATUS,
    subCollectionId: '',
    weight: '',
    year: '',
  } as z.input<typeof insertBobbleheadSchema> & { photos: File[] },
});
