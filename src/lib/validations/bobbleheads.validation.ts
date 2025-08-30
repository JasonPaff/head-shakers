import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { bobbleheadPhotos, bobbleheads, bobbleheadTags } from '@/lib/db/schema';

export const customFieldsSchema = z.record(z.string(), z.any()).optional();

export type CustomFields = z.infer<typeof customFieldsSchema>;

export const selectBobbleheadPhotoSchema = createSelectSchema(bobbleheadPhotos);
export const insertBobbleheadPhotoSchema = createInsertSchema(bobbleheadPhotos, {
  altText: z.string().min(1).max(SCHEMA_LIMITS.BOBBLEHEAD_PHOTO.ALT_TEXT.MAX).trim().optional(),
  bobbleheadId: z.uuid({ error: 'bobbleheadId is required' }),
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

export const updateBobbleheadPhotoSchema = insertBobbleheadPhotoSchema.partial();
export const selectBobbleheadTagSchema = createSelectSchema(bobbleheadTags);
export const insertBobbleheadTagSchema = createInsertSchema(bobbleheadTags).omit({
  createdAt: true,
  id: true,
});

export const selectBobbleheadSchema = createSelectSchema(bobbleheads);
export const insertBobbleheadSchema = createInsertSchema(bobbleheads, {
  acquisitionDate: z.date().optional(),
  acquisitionMethod: z.string().min(1).max(SCHEMA_LIMITS.BOBBLEHEAD.ACQUISITION_METHOD.MAX).trim().optional(),
  category: z.string().min(1).max(SCHEMA_LIMITS.BOBBLEHEAD.CATEGORY.MAX).trim().optional(),
  characterName: z.string().min(1).max(SCHEMA_LIMITS.BOBBLEHEAD.CHARACTER_NAME.MAX).trim().optional(),
  collectionId: z.uuid({ error: 'collectionId is required' }).trim(),
  currentCondition: z.enum(ENUMS.BOBBLEHEAD.CONDITION).default(DEFAULTS.BOBBLEHEAD.CONDITION).optional(),
  customFields: customFieldsSchema,
  description: z.string().max(SCHEMA_LIMITS.BOBBLEHEAD.DESCRIPTION.MAX).trim().optional(),
  // TODO: add transform to number
  height: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .trim()
    .optional(),
  isFeatured: z.boolean().default(DEFAULTS.BOBBLEHEAD.IS_FEATURED).optional(),
  isPublic: z.boolean().default(DEFAULTS.BOBBLEHEAD.IS_PUBLIC).optional(),
  manufacturer: z.string().min(1).max(SCHEMA_LIMITS.BOBBLEHEAD.MANUFACTURER.MAX).trim().optional(),
  material: z.string().min(1).max(SCHEMA_LIMITS.BOBBLEHEAD.MATERIAL.MAX).trim().optional(),
  name: z.string().min(SCHEMA_LIMITS.BOBBLEHEAD.NAME.MIN).max(SCHEMA_LIMITS.BOBBLEHEAD.NAME.MAX).trim(),
  purchaseLocation: z.string().min(1).max(SCHEMA_LIMITS.BOBBLEHEAD.PURCHASE_LOCATION.MAX).optional(),
  // TODO: add transform to number
  purchasePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  series: z.string().min(1).max(SCHEMA_LIMITS.BOBBLEHEAD.SERIES.MAX).trim().optional(),
  status: z.enum(ENUMS.BOBBLEHEAD.STATUS).default(DEFAULTS.BOBBLEHEAD.STATUS).optional(),
  subCollectionId: z.uuid().trim().optional(),
  userId: z.uuid({ error: 'userId is required' }).trim(),
  // TODO: add transform to number
  weight: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  year: z
    .number()
    .min(1800)
    .max(new Date().getFullYear() + 1)
    .optional(),
}).omit({
  commentCount: true,
  createdAt: true,
  deletedAt: true,
  id: true,
  isDeleted: true,
  likeCount: true,
  updatedAt: true,
  viewCount: true,
});

export const updateBobbleheadSchema = insertBobbleheadSchema.partial();
export const publicBobbleheadSchema = selectBobbleheadSchema.omit({
  deletedAt: true,
  isDeleted: true,
});

export type InsertBobblehead = z.infer<typeof insertBobbleheadSchema>;
export type InsertBobbleheadPhoto = z.infer<typeof insertBobbleheadPhotoSchema>;
export type InsertBobbleheadTag = z.infer<typeof insertBobbleheadTagSchema>;
export type PublicBobblehead = z.infer<typeof publicBobbleheadSchema>;
export type SelectBobblehead = z.infer<typeof selectBobbleheadSchema>;
export type SelectBobbleheadPhoto = z.infer<typeof selectBobbleheadPhotoSchema>;
export type SelectBobbleheadTag = z.infer<typeof selectBobbleheadTagSchema>;
export type UpdateBobblehead = z.infer<typeof updateBobbleheadSchema>;
export type UpdateBobbleheadPhoto = z.infer<typeof updateBobbleheadPhotoSchema>;

export const getBobbleheadByIdSchema = z.object({
  id: z.uuid(),
});

export const getBobbleheadsByCollectionSchema = z.object({
  collectionId: z.uuid().trim(),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
});

export const getBobbleheadsByUserSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
  userId: z.uuid().trim(),
});

export const searchBobbleheadsSchema = z.object({
  filters: z
    .object({
      category: z.string().min(1).max(SCHEMA_LIMITS.BOBBLEHEAD.CATEGORY.MAX).trim().optional(),
      collectionId: z.uuid().optional(),
      manufacturer: z.string().min(1).max(SCHEMA_LIMITS.BOBBLEHEAD.MANUFACTURER.MAX).trim().optional(),
      maxYear: z
        .number()
        .min(1800)
        .max(new Date().getFullYear() + 1)
        .optional(),
      minYear: z
        .number()
        .min(1800)
        .max(new Date().getFullYear() + 1)
        .optional(),
      status: z.enum(ENUMS.BOBBLEHEAD.STATUS).optional(),
      userId: z.uuid().trim().optional(),
    })
    .optional()
    .default({}),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
  searchTerm: z.string().min(1).max(255).trim().optional(),
});

export const deleteBobbleheadSchema = z.object({
  id: z.uuid().trim(),
});

export const deleteBobbleheadsSchema = z.object({
  ids: z.array(z.uuid().trim()).min(1),
});

export const reorderPhotosSchema = z.object({
  bobbleheadId: z.uuid().trim(),
  updates: z
    .array(
      z.object({
        id: z.uuid().trim(),
        sortOrder: z.number().min(0),
      }),
    )
    .min(1),
});

export const addTagToBobbleheadSchema = z.object({
  bobbleheadId: z.uuid().trim(),
  tagId: z.uuid().trim(),
});

export const removeTagFromBobbleheadSchema = z.object({
  bobbleheadId: z.uuid().trim(),
  tagId: z.uuid().trim(),
});

export const deleteBobbleheadPhotoSchema = z.object({
  bobbleheadId: z.uuid().trim(),
  id: z.uuid().trim(),
});

export type AddTagToBobblehead = z.infer<typeof addTagToBobbleheadSchema>;
export type DeleteBobblehead = z.infer<typeof deleteBobbleheadSchema>;
export type DeleteBobbleheadPhoto = z.infer<typeof deleteBobbleheadPhotoSchema>;
export type DeleteBobbleheads = z.infer<typeof deleteBobbleheadsSchema>;
export type GetBobbleheadById = z.infer<typeof getBobbleheadByIdSchema>;
export type GetBobbleheadsByCollection = z.infer<typeof getBobbleheadsByCollectionSchema>;
export type GetBobbleheadsByUser = z.infer<typeof getBobbleheadsByUserSchema>;
export type RemoveTagFromBobblehead = z.infer<typeof removeTagFromBobbleheadSchema>;
export type ReorderPhotos = z.infer<typeof reorderPhotosSchema>;
export type SearchBobbleheads = z.infer<typeof searchBobbleheadsSchema>;
