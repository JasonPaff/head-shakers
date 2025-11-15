/**
 * Photo Transformation Utilities
 *
 * Provides bidirectional transformation between database BobbleheadPhoto format
 * and client-side CloudinaryPhoto format. Handles all edge cases including
 * null values, missing fields, and temporary vs persisted photo identification.
 */

import type { InsertBobbleheadPhoto } from '@/lib/validations/bobbleheads.validation';
import type { CloudinaryPhoto } from '@/types/cloudinary.types';

import {
  extractFormatFromCloudinaryUrl,
  extractPublicIdFromCloudinaryUrl,
} from '@/lib/utils/cloudinary.utils';

/**
 * Database photo type matching bobbleheadPhotos schema
 */
interface BobbleheadPhoto {
  altText: null | string;
  bobbleheadId: string;
  caption: null | string;
  fileSize: null | number;
  height: null | number;
  id: string;
  isPrimary: boolean;
  sortOrder: number;
  uploadedAt: Date;
  url: string;
  width: null | number;
}

/**
 * Transform database BobbleheadPhoto to client CloudinaryPhoto format
 *
 * Converts database photo record to the format expected by the CloudinaryPhotoUpload
 * component. Handles all nullable fields by providing sensible defaults.
 *
 * @param photo - Database photo record from bobblehead_photos table
 * @returns CloudinaryPhoto formatted for client-side photo management
 *
 * @example
 * ```ts
 * const dbPhoto = await db.query.bobbleheadPhotos.findFirst();
 * const cloudinaryPhoto = transformDatabasePhotoToCloudinary(dbPhoto);
 * // Use in form: form.setFieldValue('photos', [cloudinaryPhoto]);
 * ```
 */
export const transformDatabasePhotoToCloudinary = (photo: BobbleheadPhoto): CloudinaryPhoto => {
  const publicId = extractPublicIdFromCloudinaryUrl(photo.url);
  const format = extractFormatFromCloudinaryUrl(photo.url);

  // Handle uploadedAt - it might be a Date object or already a string (from server action serialization)
  const uploadedAtString =
    typeof photo.uploadedAt === 'string' ? photo.uploadedAt : photo.uploadedAt.toISOString();

  return {
    altText: photo.altText || '',
    bytes: photo.fileSize || 0,
    caption: photo.caption || '',
    format: (format as 'heic' | 'jpeg' | 'jpg' | 'png' | 'webp') || 'jpg',
    height: photo.height || 0,
    id: photo.id,
    isPrimary: photo.isPrimary,
    originalFilename: '',
    publicId: publicId || photo.url,
    sortOrder: photo.sortOrder,
    uploadedAt: uploadedAtString,
    url: photo.url,
    width: photo.width || 0,
  };
};

/**
 * Transform client CloudinaryPhoto to database InsertBobbleheadPhoto format
 *
 * Converts client-side photo representation to the format required for database
 * insertion. Handles temporary photos (with 'temp-' prefixed IDs) vs persisted
 * photos (with UUID IDs) appropriately.
 *
 * @param photo - CloudinaryPhoto from client-side photo management
 * @param bobbleheadId - UUID of the parent bobblehead record
 * @returns InsertBobbleheadPhoto formatted for database insertion
 *
 * @example
 * ```ts
 * const cloudinaryPhoto: CloudinaryPhoto = { ... };
 * const dbPhoto = transformCloudinaryPhotoToDatabase(cloudinaryPhoto, bobbleheadId);
 * await db.insert(bobbleheadPhotos).values(dbPhoto);
 * ```
 */
export const transformCloudinaryPhotoToDatabase = (
  photo: CloudinaryPhoto,
  bobbleheadId: string,
): InsertBobbleheadPhoto => {
  return {
    altText: photo.altText || undefined,
    bobbleheadId,
    caption: photo.caption || undefined,
    fileSize: photo.bytes > 0 ? photo.bytes : undefined,
    height: photo.height > 0 ? photo.height : undefined,
    isPrimary: photo.isPrimary,
    sortOrder: photo.sortOrder,
    url: photo.url,
    width: photo.width > 0 ? photo.width : undefined,
  };
};

/**
 * Type guard to check if photo has been persisted to database
 *
 * Distinguishes between newly uploaded photos (temporary IDs) and photos that
 * have been saved to the database (UUID IDs). Temporary IDs follow the pattern
 * 'temp-{timestamp}-{random}' while persisted photos use standard UUIDs.
 *
 * @param photo - CloudinaryPhoto to check
 * @returns true if photo has a UUID (persisted), false if temp ID (not yet saved)
 *
 * @example
 * ```ts
 * const photo: CloudinaryPhoto = { id: 'temp-1234567890-abc123', ... };
 * if (isPersistedPhoto(photo)) {
 *   // Safe to update in database
 *   await updatePhoto(photo);
 * } else {
 *   // Must insert as new record
 *   await insertPhoto(photo);
 * }
 * ```
 */
export const isPersistedPhoto = (photo: CloudinaryPhoto): boolean => {
  return !photo.id.startsWith('temp-');
};

/**
 * Type guard to check if photo is temporary (not yet persisted)
 *
 * Inverse of isPersistedPhoto. Identifies newly uploaded photos that haven't
 * been saved to the database yet. These photos have temporary IDs prefixed
 * with 'temp-' and require insertion rather than update operations.
 *
 * @param photo - CloudinaryPhoto to check
 * @returns true if photo has temp ID (not saved), false if UUID (persisted)
 *
 * @example
 * ```ts
 * const photos = form.getFieldValue('photos');
 * const newPhotos = photos.filter(isTempPhoto);
 * const existingPhotos = photos.filter(isPersistedPhoto);
 *
 * await db.insert(bobbleheadPhotos).values(
 *   newPhotos.map(p => transformCloudinaryPhotoToDatabase(p, bobbleheadId))
 * );
 * ```
 */
export const isTempPhoto = (photo: CloudinaryPhoto): boolean => {
  return photo.id.startsWith('temp-');
};
