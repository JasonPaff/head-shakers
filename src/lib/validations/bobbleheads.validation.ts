import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { bobbleheadPhotos, bobbleheads, bobbleheadTags } from '@/lib/db/schema';

export const customFieldsSchema = z.record(z.string(), z.any()).optional();

export type CustomFields = z.infer<typeof customFieldsSchema>;

export const selectBobbleheadPhotoSchema = createSelectSchema(bobbleheadPhotos);
export const insertBobbleheadPhotoSchema = createInsertSchema(bobbleheadPhotos, {
  altText: z.string().min(1).max(255).optional(),
  bobbleheadId: z.number().min(1),
  caption: z.string().max(500).optional(),
  fileSize: z.number().min(1).optional(),
  height: z.number().min(1).optional(),
  isPrimary: z.boolean().default(false).optional(),
  sortOrder: z.number().min(0).default(0).optional(),
  url: z.url(),
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
  acquisitionMethod: z.string().min(1).max(50).optional(),
  category: z.string().min(1).max(50).optional(),
  characterName: z.string().min(1).max(100).optional(),
  collectionId: z.uuid().min(1, { message: 'collectionId is required' }),
  currentCondition: z.enum(['mint', 'excellent', 'good', 'fair', 'poor']).default('excellent'),
  customFields: customFieldsSchema,
  description: z.string().max(1000).optional(),
  height: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  isFeatured: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  manufacturer: z.string().min(1).max(100).optional(),
  material: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200),
  purchaseLocation: z.string().min(1).max(100).optional(),
  purchasePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  series: z.string().min(1).max(100).optional(),
  status: z.enum(['owned', 'for_trade', 'for_sale', 'sold', 'wishlist']).default('owned'),
  subCollectionId: z.uuid().optional(),
  userId: z.uuid().min(1, { message: 'userId is required' }),
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
