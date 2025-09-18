import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { bobbleheadPhotos, bobbleheads, bobbleheadTags } from '@/lib/db/schema';
import {
  zodDateString,
  zodDecimal,
  zodMaxString,
  zodMinMaxString,
  zodNullableUUID,
  zodYear,
} from '@/lib/utils/zod.utils';
import { cloudinaryPhotosValidationSchema } from '@/lib/validations/photo-upload.validation';

export const customFieldsSchema = z.record(z.string(), z.string());

export type AddBobbleheadFormSchema = z.input<typeof createBobbleheadWithPhotosSchema>;
export type CustomFields = Array<z.infer<typeof customFieldsSchema>>;
export type DeleteBobblehead = z.infer<typeof deleteBobbleheadSchema>;
export type InsertBobblehead = z.infer<typeof insertBobbleheadSchema>;
export type InsertBobbleheadPhoto = z.infer<typeof insertBobbleheadPhotoSchema>;
export type InsertBobbleheadTag = z.infer<typeof insertBobbleheadTagSchema>;
export type SelectBobblehead = z.infer<typeof selectBobbleheadSchema>;
export type SelectBobbleheadPhoto = z.infer<typeof selectBobbleheadPhotoSchema>;
export type SelectBobbleheadTag = z.infer<typeof selectBobbleheadTagSchema>;
export type UpdateBobbleheadPhoto = z.infer<typeof updateBobbleheadPhotoSchema>;

export const selectBobbleheadPhotoSchema = createSelectSchema(bobbleheadPhotos);
export const insertBobbleheadPhotoSchema = createInsertSchema(bobbleheadPhotos, {
  altText: z.string().min(1).max(SCHEMA_LIMITS.BOBBLEHEAD_PHOTO.ALT_TEXT.MAX).trim().optional(),
  bobbleheadId: z.uuid({ error: 'Bobblehead ID is required' }),
  caption: z.string().max(SCHEMA_LIMITS.BOBBLEHEAD_PHOTO.CAPTION.MAX).trim().optional(),
  fileSize: z.number().min(1).optional(),
  height: z.number().min(1).optional(),
  isPrimary: z.boolean().default(DEFAULTS.BOBBLEHEAD_PHOTO.IS_PRIMARY).optional(),
  sortOrder: z.number().min(0).default(0).optional(),
  url: z.url().min(SCHEMA_LIMITS.BOBBLEHEAD_PHOTO.URL.MIN).max(SCHEMA_LIMITS.BOBBLEHEAD_PHOTO.URL.MAX).trim(),
  width: z.number().min(1).optional(),
}).omit({
  id: true,
  uploadedAt: true,
});

export const deleteBobbleheadSchema = z.object({
  bobbleheadId: z.uuid(),
});
export const updateBobbleheadPhotoSchema = insertBobbleheadPhotoSchema.partial();
export const selectBobbleheadTagSchema = createSelectSchema(bobbleheadTags);
export const insertBobbleheadTagSchema = createInsertSchema(bobbleheadTags).omit({
  createdAt: true,
  id: true,
});

export const selectBobbleheadSchema = createSelectSchema(bobbleheads);
export const insertBobbleheadSchema = createInsertSchema(bobbleheads, {
  acquisitionDate: zodDateString({
    fieldName: 'Acquisition Date',
    isNullable: true,
  }).optional(),
  acquisitionMethod: zodMaxString({
    fieldName: 'Acquisition Method',
    maxLength: SCHEMA_LIMITS.BOBBLEHEAD.ACQUISITION_METHOD.MAX,
  }).optional(),
  category: zodMaxString({
    fieldName: 'Category',
    maxLength: SCHEMA_LIMITS.BOBBLEHEAD.CATEGORY.MAX,
  }).optional(),
  characterName: zodMaxString({
    fieldName: 'Character Name',
    maxLength: SCHEMA_LIMITS.BOBBLEHEAD.CHARACTER_NAME.MAX,
  }).optional(),
  collectionId: z.uuid('Collection is required'),
  currentCondition: z.enum(ENUMS.BOBBLEHEAD.CONDITION).default(DEFAULTS.BOBBLEHEAD.CONDITION),
  customFields: customFieldsSchema
    .array()
    .transform((val) => {
      if (!val || val.length === 0) return null;
      return val;
    })
    .optional(),
  description: zodMaxString({
    fieldName: 'Description',
    maxLength: SCHEMA_LIMITS.BOBBLEHEAD.DESCRIPTION.MAX,
  }).optional(),
  height: zodDecimal({ fieldName: 'Height' }).optional(),
  isFeatured: z.boolean().default(DEFAULTS.BOBBLEHEAD.IS_FEATURED),
  isPublic: z.boolean().default(DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
  manufacturer: zodMaxString({
    fieldName: 'Manufacturer',
    maxLength: SCHEMA_LIMITS.BOBBLEHEAD.MANUFACTURER.MAX,
  }).optional(),
  material: zodMaxString({
    fieldName: 'Material',
    maxLength: SCHEMA_LIMITS.BOBBLEHEAD.MATERIAL.MAX,
  }).optional(),
  name: zodMinMaxString({
    fieldName: 'Name',
    maxLength: SCHEMA_LIMITS.BOBBLEHEAD.NAME.MAX,
    minLength: SCHEMA_LIMITS.BOBBLEHEAD.NAME.MIN,
  }),
  purchaseLocation: zodMaxString({
    fieldName: 'Purchase Location',
    maxLength: SCHEMA_LIMITS.BOBBLEHEAD.PURCHASE_LOCATION.MAX,
  }).optional(),
  purchasePrice: zodDecimal({ fieldName: 'Purchase Price' }).optional(),
  series: zodMaxString({
    fieldName: 'Series',
    maxLength: SCHEMA_LIMITS.BOBBLEHEAD.SERIES.MAX,
  }).optional(),
  status: z.enum(ENUMS.BOBBLEHEAD.STATUS).default(DEFAULTS.BOBBLEHEAD.STATUS),
  subcollectionId: zodNullableUUID('Subcollection ID'),
  weight: zodDecimal({ fieldName: 'Weight' }).optional(),
  year: zodYear({ fieldName: 'Year' }).optional(),
}).omit({
  commentCount: true,
  createdAt: true,
  deletedAt: true,
  id: true,
  isDeleted: true,
  likeCount: true,
  updatedAt: true,
  userId: true,
  viewCount: true,
});
export const createBobbleheadWithPhotosSchema = insertBobbleheadSchema.extend({
  photos: cloudinaryPhotosValidationSchema.default([]),
  tags: z.array(z.string()).default([]).optional(),
});

export const getBobbleheadByIdSchema = z.object({
  id: z.uuid(),
});
