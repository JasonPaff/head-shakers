import { formOptions } from '@tanstack/form-core';

import type { AddBobbleheadFormSchema } from '@/lib/validations/bobbleheads.validation';

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
    photos: [],
    purchaseLocation: '',
    purchasePrice: '',
    series: '',
    status: DEFAULTS.BOBBLEHEAD.STATUS,
    subcollectionId: '',
    tags: [],
    weight: '',
    year: '',
  } as AddBobbleheadFormSchema,
});
