'use server';

/* eslint-disable no-useless-catch */
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import type { PhotoWithMetadata } from '@/components/ui/photo-upload';
import type { InsertBobbleheadPhoto } from '@/lib/validations/bobbleheads.validation';

import { ACTION_NAMES } from '@/lib/constants';
import { bobbleheadPhotos } from '@/lib/db/schema';
import { deleteImage, uploadMultipleImages } from '@/lib/services/cloudinary';
import { authActionClient } from '@/lib/utils/next-safe-action';
import {
  batchPhotoUploadSchema,
  photoDeleteSchema,
  photoReorderSchema,
  photoUpdateSchema,
} from '@/lib/validations/photo-upload.validation';

// upload photos for a bobblehead
export const uploadPhotosAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.UPLOAD_PHOTOS,
    isTransactionRequired: true,
  })
  .inputSchema(batchPhotoUploadSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { bobbleheadId, photos: photoUploads } = parsedInput;

    try {
      // upload all photos to Cloudinary
      const files = photoUploads.map((upload) => upload.file);
      const cloudinaryResults = await uploadMultipleImages(files, {
        bobbleheadId,
        userId: ctx.userId,
      });

      // prepare database records
      const photoRecords: Array<InsertBobbleheadPhoto> = cloudinaryResults.map((result, index) => {
        const metadata = photoUploads[index]!.metadata;
        return {
          altText: metadata.altText,
          bobbleheadId,
          caption: metadata.caption,
          fileSize: result.metadata.fileSize,
          height: result.metadata.height,
          isPrimary: metadata.isPrimary,
          sortOrder: metadata.sortOrder,
          url: result.metadata.url,
          width: result.metadata.width,
        };
      });

      // insert photos into database
      const insertedPhotos = await ctx.db.insert(bobbleheadPhotos).values(photoRecords).returning();

      // revalidate relevant paths
      revalidatePath(`/items/${bobbleheadId}`);
      revalidatePath('/dashboard');

      return {
        message: `Successfully uploaded ${insertedPhotos.length} photos`,
        photos: insertedPhotos,
        uploadResults: cloudinaryResults,
      };
    } catch (error) {
      throw error;
    }
  });

// delete a photo
export const deletePhotoAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.DELETE_PHOTO,
    isTransactionRequired: true,
  })
  .inputSchema(photoDeleteSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { bobbleheadId, id } = parsedInput;

    try {
      // Get the photo from the database first
      const photo = await ctx.db.query.bobbleheadPhotos.findFirst({
        where: eq(bobbleheadPhotos.id, id),
      });

      if (!photo) {
        throw new Error('Photo not found');
      }

      // verify ownership through bobblehead
      const bobblehead = await ctx.db.query.bobbleheads.findFirst({
        where: (bobbleheads, { and, eq }) =>
          and(eq(bobbleheads.id, bobbleheadId), eq(bobbleheads.userId, ctx.userId)),
      });

      if (!bobblehead) {
        throw new Error('Bobblehead not found or access denied');
      }

      // extract public_id from Cloudinary URL
      const urlParts = photo.url.split('/');
      const publicIdWithExtension = urlParts.slice(-3).join('/'); // folder/subfolder/filename.ext
      const publicId = publicIdWithExtension.split('.')[0]; // Remove extension

      // delete the photo from Cloudinary
      await deleteImage(publicId!);

      // delete from database
      await ctx.db.delete(bobbleheadPhotos).where(eq(bobbleheadPhotos.id, id));

      // revalidate relevant paths
      revalidatePath(`/items/${bobbleheadId}`);
      revalidatePath('/dashboard');

      return {
        message: 'Photo deleted successfully',
        photoId: id,
      };
    } catch (error) {
      throw error;
    }
  });

// update photo metadata (caption, alt text, etc.)
export const updatePhotoAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE_PHOTO,
    isTransactionRequired: false,
  })
  .inputSchema(photoUpdateSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { altText, caption, id, isPrimary } = parsedInput;

    try {
      // get photo with bobblehead info for ownership check
      const photo = await ctx.db.query.bobbleheadPhotos.findFirst({
        where: eq(bobbleheadPhotos.id, id),
        with: {
          bobblehead: true,
        },
      });

      if (!photo) {
        throw new Error('Photo not found');
      }

      if (photo.bobblehead.userId !== ctx.userId) {
        throw new Error('Access denied');
      }

      // if setting as primary, unset other primary photos for this bobblehead
      if (isPrimary === true) {
        await ctx.db
          .update(bobbleheadPhotos)
          .set({ isPrimary: false })
          .where(eq(bobbleheadPhotos.bobbleheadId, photo.bobbleheadId));
      }

      // update the photo
      const updatedPhoto = await ctx.db
        .update(bobbleheadPhotos)
        .set({
          altText: altText !== undefined ? altText : undefined,
          caption: caption !== undefined ? caption : undefined,
          isPrimary: isPrimary !== undefined ? isPrimary : undefined,
        })
        .where(eq(bobbleheadPhotos.id, id))
        .returning();

      // revalidate relevant paths
      revalidatePath(`/items/${photo.bobbleheadId}`);
      revalidatePath('/dashboard');

      return {
        message: 'Photo updated successfully',
        photo: updatedPhoto[0],
      };
    } catch (error) {
      throw error;
    }
  });

// reorder photos
export const reorderPhotosAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.REORDER_PHOTOS,
    isTransactionRequired: true,
  })
  .inputSchema(photoReorderSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { bobbleheadId, photoUpdates } = parsedInput;

    try {
      // verify ownership
      const bobblehead = await ctx.db.query.bobbleheads.findFirst({
        where: (bobbleheads, { and, eq }) =>
          and(eq(bobbleheads.id, bobbleheadId), eq(bobbleheads.userId, ctx.userId)),
      });

      if (!bobblehead) {
        throw new Error('Bobblehead not found or access denied');
      }

      // update sort orders in batch
      const updatePromises = photoUpdates.map((update) =>
        ctx.db
          .update(bobbleheadPhotos)
          .set({ sortOrder: update.sortOrder })
          .where(eq(bobbleheadPhotos.id, update.id)),
      );

      await Promise.all(updatePromises);

      // revalidate relevant paths
      revalidatePath(`/items/${bobbleheadId}`);
      revalidatePath('/dashboard');

      return {
        message: 'Photos reordered successfully',
        updates: photoUpdates,
      };
    } catch (error) {
      throw error;
    }
  });

// helper function to process photos from form data
export async function processPhotosFromFormData(
  photos: PhotoWithMetadata[],
  bobbleheadId: string,
  userId: string,
): Promise<InsertBobbleheadPhoto[]> {
  if (photos.length === 0) {
    return [];
  }

  try {
    // upload to Cloudinary
    const files = photos.map((p) => p.file);
    const cloudinaryResults = await uploadMultipleImages(files, {
      bobbleheadId,
      userId,
    });

    // convert to database records
    const photoRecords: InsertBobbleheadPhoto[] = cloudinaryResults.map((result, index) => {
      const photo = photos[index]!;
      return {
        altText: photo.altText,
        bobbleheadId,
        caption: photo.caption,
        fileSize: result.metadata.fileSize,
        height: result.metadata.height,
        isPrimary: photo.isPrimary,
        sortOrder: photo.sortOrder,
        url: result.metadata.url,
        width: result.metadata.width,
      };
    });

    return photoRecords;
  } catch (error) {
    throw new Error(`Failed to process photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
