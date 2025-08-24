import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { bobbleheadPhotos, bobbleheads, bobbleheadTags } from '@/lib/db/schema';

export const customFieldsSchema = z.record(z.string(), z.any()).optional();

export type CustomFields = z.infer<typeof customFieldsSchema>;

export const selectBobbleheadPhotoSchema = createSelectSchema(bobbleheadPhotos);
export const insertBobbleheadPhotoSchema = createInsertSchema(bobbleheadPhotos, {
  altText: z.string().min(1).max(255).optional(),
  caption: z.string().max(500).optional(),
  fileSize: z.number().min(1).optional(),
  height: z.number().min(1).optional(),
  url: z.url(),
  width: z.number().min(1).optional(),
}).omit({
  bobbleheadId: true,
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
  acquisitionMethod: z.string().min(1).max(50).optional(),
  category: z.string().min(1).max(50).optional(),
  characterName: z.string().min(1).max(100).optional(),
  currentCondition: z.enum(['mint', 'excellent', 'good', 'fair', 'poor']).default('excellent'),
  customFields: customFieldsSchema,
  description: z.string().max(1000).optional(),
  height: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
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
  userId: true,
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
