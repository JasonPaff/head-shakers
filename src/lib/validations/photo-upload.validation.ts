import z from 'zod';

import { CONFIG } from '@/lib/constants';

// file validation schema for client-side validation
export const fileValidationSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z
    .number()
    .max(
      CONFIG.FILE_UPLOAD.MAX_SIZE,
      `File size must be less than ${CONFIG.FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`,
    ),
  type: z
    .string()
    .refine(
      (type): type is (typeof CONFIG.FILE_UPLOAD.ALLOWED_TYPES)[number] =>
        CONFIG.FILE_UPLOAD.ALLOWED_TYPES.includes(type as (typeof CONFIG.FILE_UPLOAD.ALLOWED_TYPES)[number]),
      `File type must be one of: ${CONFIG.FILE_UPLOAD.ALLOWED_TYPES.join(', ')}`,
    ),
});

export const validatePhotosOnClient = (
  files: Array<File> | FileList,
): {
  invalid: Array<{ errors: Array<string>; file: File }>;
  valid: Array<File>;
} => {
  const fileArray = Array.from(files);
  const valid: Array<File> = [];
  const invalid: Array<{ errors: Array<string>; file: File }> = [];

  for (const file of fileArray) {
    const result = fileValidationSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (result.success) {
      valid.push(file);
    } else {
      invalid.push({
        errors: [result.error.message],
        file,
      });
    }
  }

  return { invalid, valid };
};

// cloudinary photo validation schemas
export const cloudinaryPhotoSchema = z.object({
  altText: z.string().max(255).optional(),
  bytes: z.number().positive(),
  caption: z.string().max(500).optional(),
  format: z.string(),
  height: z.number().positive(),
  id: z.string(),
  isPrimary: z.boolean().default(false),
  originalFilename: z.string(),
  publicId: z.string(),
  sortOrder: z.number().min(0).default(0),
  uploadedAt: z.string(),
  url: z.url(),
  width: z.number().positive(),
});

export const cloudinaryPhotosValidationSchema = z
  .array(cloudinaryPhotoSchema)
  .max(
    CONFIG.CONTENT.MAX_PHOTOS_PER_BOBBLEHEAD,
    `Maximum ${CONFIG.CONTENT.MAX_PHOTOS_PER_BOBBLEHEAD} photos allowed`,
  )
  .optional();
