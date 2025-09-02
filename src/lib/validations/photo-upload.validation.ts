import z from 'zod';

import { CONFIG } from '@/lib/constants';

export type BatchPhotoUpload = z.infer<typeof batchPhotoUploadSchema>;
export type FileValidation = z.infer<typeof fileValidationSchema>;
export type NativeBatchPhotoUpload = z.infer<typeof nativeBatchPhotoUploadSchema>;
export type NativeFileValidation = z.infer<typeof nativeFileValidationSchema>;
export type NativePhotosValidation = z.infer<typeof nativePhotosValidationSchema>;
export type NativePhotoUpload = z.infer<typeof nativePhotoUploadSchema>;
export type PhotoDelete = z.infer<typeof photoDeleteSchema>;
export type PhotoReorder = z.infer<typeof photoReorderSchema>;
export type PhotosValidation = z.infer<typeof photosValidationSchema>;
export type PhotoUpdate = z.infer<typeof photoUpdateSchema>;
export type PhotoUpload = z.infer<typeof photoUploadSchema>;
export type PhotoUploadMetadata = z.infer<typeof photoUploadMetadataSchema>;

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

// extended file validation schema that accepts native File objects
export const nativeFileValidationSchema = z.instanceof(File)
  .refine(
    (file) => file.size <= CONFIG.FILE_UPLOAD.MAX_SIZE,
    `File size must be less than ${CONFIG.FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`,
  )
  .refine(
    (file): file is File & { type: (typeof CONFIG.FILE_UPLOAD.ALLOWED_TYPES)[number] } =>
      CONFIG.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type as (typeof CONFIG.FILE_UPLOAD.ALLOWED_TYPES)[number]),
    `File type must be one of: ${CONFIG.FILE_UPLOAD.ALLOWED_TYPES.join(', ')}`,
  );

// array of files validation for simplified file objects
export const photosValidationSchema = z
  .array(fileValidationSchema)
  .max(
    CONFIG.CONTENT.MAX_PHOTOS_PER_BOBBLEHEAD,
    `Maximum ${CONFIG.CONTENT.MAX_PHOTOS_PER_BOBBLEHEAD} photos allowed`,
  )
  .optional();

// array of native File objects validation
export const nativePhotosValidationSchema = z
  .array(nativeFileValidationSchema)
  .max(
    CONFIG.CONTENT.MAX_PHOTOS_PER_BOBBLEHEAD,
    `Maximum ${CONFIG.CONTENT.MAX_PHOTOS_PER_BOBBLEHEAD} photos allowed`,
  )
  .optional();

// photo upload metadata schema
export const photoUploadMetadataSchema = z.object({
  altText: z.string().max(255).optional(),
  bobbleheadId: z.uuid().optional(), // Optional during creation
  caption: z.string().max(500).optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().min(0).default(0),
});

// complete photo upload schema combining file and metadata
export const photoUploadSchema = z.object({
  file: fileValidationSchema,
  metadata: photoUploadMetadataSchema,
});

// photo upload schema for native File objects
export const nativePhotoUploadSchema = z.object({
  file: nativeFileValidationSchema,
  metadata: photoUploadMetadataSchema,
});

// batch photo upload schema
export const batchPhotoUploadSchema = z.object({
  bobbleheadId: z.uuid(),
  photos: z.array(photoUploadSchema).min(1).max(CONFIG.CONTENT.MAX_PHOTOS_PER_BOBBLEHEAD),
  userId: z.uuid(),
});

// batch photo upload schema for native File objects
export const nativeBatchPhotoUploadSchema = z.object({
  bobbleheadId: z.uuid(),
  photos: z.array(nativePhotoUploadSchema).min(1).max(CONFIG.CONTENT.MAX_PHOTOS_PER_BOBBLEHEAD),
  userId: z.uuid(),
});

// photo reorder schema
export const photoReorderSchema = z.object({
  bobbleheadId: z.uuid(),
  photoUpdates: z
    .array(
      z.object({
        id: z.uuid(),
        sortOrder: z.number().min(0),
      }),
    )
    .min(1),
});

// photo update schema (for captions, alt text, etc.)
export const photoUpdateSchema = z.object({
  altText: z.string().max(255).optional(),
  caption: z.string().max(500).optional(),
  id: z.uuid(),
  isPrimary: z.boolean().optional(),
});

// photo deletion schema
export const photoDeleteSchema = z.object({
  bobbleheadId: z.uuid(),
  id: z.uuid(),
});

export const validatePhotosOnClient = (
  files: Array<File> | FileList,
): {
  invalid: Array<{ errors: Array<string>; file: File }>;
  valid: Array<File>;
} => {
  const fileArray = Array.from(files);
  const valid: Array<File> = [];
  const invalid: Array<{ errors: string[]; file: File }> = [];

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
