import type { z } from 'zod';

import { formOptions } from '@tanstack/form-core';

import type { updateBobbleheadWithPhotosSchema } from '@/lib/validations/bobbleheads.validation';

import { DEFAULTS } from '@/lib/constants';

export type EditBobbleheadFormSchema = z.input<typeof updateBobbleheadWithPhotosSchema>;

export const editItemFormOptions = formOptions({
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
    id: '',
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
    tags: [],
    weight: '',
    year: '',
  } as EditBobbleheadFormSchema,
});
