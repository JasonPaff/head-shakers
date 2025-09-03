'use server';

import * as Sentry from '@sentry/nextjs';
import { $path } from 'next-typesafe-url';
import { revalidatePath } from 'next/cache';

import type { PhotoWithMetadata } from '@/components/ui/photo-upload';

import { processPhotosFromFormData } from '@/lib/actions/photo-upload.actions';
import {
  ACTION_NAMES,
  ERROR_MESSAGES,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { createRateLimitMiddleware } from '@/lib/middleware/rate-limit.middleware';
import {
  addTagToBobbleheadAsync,
  createBobbleheadPhotoAsync,
  deleteBobbleheadAsync,
  deleteBobbleheadPhotoAsync,
  deleteBobbleheadsAsync,
  getBobbleheadByIdAsync,
  removeTagFromBobbleheadAsync,
  reorderBobbleheadPhotosAsync,
  updateBobbleheadAsync,
  updateBobbleheadPhotoAsync,
} from '@/lib/queries/bobbleheads.queries';
import { BobbleheadService } from '@/lib/services/bobbleheads.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import {
  addTagToBobbleheadSchema,
  createBobbleheadWithPhotosSchema,
  deleteBobbleheadPhotoSchema,
  deleteBobbleheadSchema,
  deleteBobbleheadsSchema,
  getBobbleheadByIdSchema,
  insertBobbleheadPhotoSchema,
  insertBobbleheadSchema,
  removeTagFromBobbleheadSchema,
  reorderPhotosSchema,
  updateBobbleheadPhotoSchema,
  updateBobbleheadSchema,
} from '@/lib/validations/bobbleheads.validation';

// create operations
export const createBobbleheadAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.CREATE,
    isTransactionRequired: true,
  })
  .use(createRateLimitMiddleware(5, 60))
  .inputSchema(insertBobbleheadSchema)
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = insertBobbleheadSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, sanitizedData);

    try {
      // create bobblehead
      const newBobblehead = await BobbleheadService.createAsync(
        {
          ...sanitizedData,
        },
        userId,
        ctx.tx,
      );

      if (!newBobblehead) {
        throw new ActionError(
          ErrorType.INTERNAL,
          'BOBBLEHEAD_CREATE_FAILED',
          ERROR_MESSAGES.BOBBLEHEAD.CREATE_FAILED,
          { operation: 'create_bobblehead', userId },
          false,
          500,
        );
      }

      // add business logic breadcrumb
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: newBobblehead,
        level: SENTRY_LEVELS.INFO,
        message: `Created bobblehead: ${newBobblehead.name}`,
      });

      // revalidate cache
      revalidatePath(
        $path({
          route: '/collections/[collectionId]',
          routeParams: {
            collectionId: parsedInput.collectionId,
          },
        }),
      );

      return {
        data: newBobblehead,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.CREATE,
        },
        operation: 'create_bobblehead',
        userId,
      });
    }
  });

export const createBobbleheadWithPhotosAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.CREATE,
    isTransactionRequired: true,
  })
  .use(createRateLimitMiddleware(5, 60))
  .inputSchema(createBobbleheadWithPhotosSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { photos, photosMetadata, ...bobbleheadData } = createBobbleheadWithPhotosSchema.parse(
      ctx.sanitizedInput,
    );
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, bobbleheadData);

    try {
      // first create the bobblehead without photos
      const newBobblehead = await BobbleheadService.createAsync(bobbleheadData, userId, ctx.tx);

      if (!newBobblehead) {
        throw new ActionError(
          ErrorType.INTERNAL,
          'BOBBLEHEAD_CREATE_FAILED',
          ERROR_MESSAGES.BOBBLEHEAD.CREATE_FAILED,
          { operation: 'create_bobblehead', userId },
          false,
          500,
        );
      }

      // if photos are provided, process and upload them
      let uploadedPhotos: Array<unknown> = [];
      if (photos && photos.length > 0) {
        try {
          // convert File objects with metadata
          const photosWithMetadata: Array<PhotoWithMetadata> = photos.map((file, index) => ({
            altText: photosMetadata?.[index]?.altText || '',
            caption: photosMetadata?.[index]?.caption || '',
            file: file,
            id: `temp-${index}`,
            isPrimary: photosMetadata?.[index]?.isPrimary || index === 0,
            preview: URL.createObjectURL(file),
            sortOrder: photosMetadata?.[index]?.sortOrder || index,
          }));

          const photoRecords = await processPhotosFromFormData(photosWithMetadata, newBobblehead.id, userId);

          // insert photos into database
          if (photoRecords.length > 0) {
            uploadedPhotos = await Promise.all(
              photoRecords.map((record) => BobbleheadService.addPhotoAsync(record, ctx.tx)),
            );
          }
        } catch (photoError) {
          // TODO: notify user about partial failure?
          // if photo upload fails, we still want to keep the bobblehead
          console.error('Photo upload failed:', photoError);
          Sentry.captureException(photoError);
        }
      }

      // add business logic breadcrumb
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          bobblehead: newBobblehead,
          photosCount: uploadedPhotos.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Created bobblehead: ${newBobblehead.name} with ${uploadedPhotos.length} photos`,
      });

      // revalidate cache
      revalidatePath(
        $path({
          route: '/collections/[collectionId]',
          routeParams: {
            collectionId: parsedInput.collectionId,
          },
        }),
      );

      return {
        data: {
          bobblehead: newBobblehead,
          photos: uploadedPhotos,
        },
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.BOBBLEHEADS.CREATE },
        operation: 'create_bobblehead_with_photos',
        userId,
      });
    }
  });

// update operations
export const updateBobbleheadAction = authActionClient
  .use(createRateLimitMiddleware(60, 60))
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE,
  })
  .inputSchema(updateBobbleheadSchema.extend({ id: getBobbleheadByIdSchema.shape.id }))
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const userId = ctx.userId;
    const { id, ...updateData } = sanitizedData;

    try {
      // verify ownership
      const existing = await getBobbleheadByIdAsync(id, ctx.db);
      if (!existing || existing.length === 0) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          'BOBBLEHEAD_NOT_FOUND',
          ERROR_MESSAGES.BOBBLEHEAD.NOT_FOUND,
          { bobbleheadId: id },
          false,
          404,
        );
      }

      if (existing[0]?.userId !== userId) {
        throw new ActionError(
          ErrorType.AUTHORIZATION,
          'BOBBLEHEAD_UPDATE_UNAUTHORIZED',
          ERROR_MESSAGES.BOBBLEHEAD.UPDATE_UNAUTHORIZED,
          { bobbleheadId: id, userId },
          false,
          403,
        );
      }

      const updatedBobblehead = await updateBobbleheadAsync(id, updateData, userId, ctx.tx);

      if (!updatedBobblehead || updatedBobblehead.length === 0) {
        throw new ActionError(
          ErrorType.INTERNAL,
          'BOBBLEHEAD_UPDATE_FAILED',
          ERROR_MESSAGES.BOBBLEHEAD.UPDATE_FAILED,
          { bobbleheadId: id, userId },
          false,
          500,
        );
      }

      // Revalidate cache
      revalidatePath(
        $path({
          route: '/collections/[collectionId]',
          routeParams: {
            collectionId: existing[0].collectionId,
          },
        }),
      );

      return {
        data: updatedBobblehead[0],
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE,
        },
        operation: 'update_bobblehead',
        userId,
      });
    }
  });

// delete operations
export const deleteBobbleheadAction = authActionClient
  .use(createRateLimitMiddleware(30, 60))
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.DELETE,
    isTransactionRequired: true,
  })
  .inputSchema(deleteBobbleheadSchema)
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const userId = ctx.userId;

    try {
      // verify ownership before deletion
      const existing = await getBobbleheadByIdAsync(sanitizedData.id, ctx.db);
      if (!existing || existing.length === 0) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          'BOBBLEHEAD_NOT_FOUND',
          ERROR_MESSAGES.BOBBLEHEAD.NOT_FOUND,
          { bobbleheadId: sanitizedData.id },
          false,
          404,
        );
      }

      if (existing[0]?.userId !== userId) {
        throw new ActionError(
          ErrorType.AUTHORIZATION,
          'BOBBLEHEAD_DELETE_UNAUTHORIZED',
          ERROR_MESSAGES.BOBBLEHEAD.DELETE_UNAUTHORIZED,
          { bobbleheadId: sanitizedData.id, userId },
          false,
          403,
        );
      }

      const deletedBobblehead = await deleteBobbleheadAsync(sanitizedData.id, userId, ctx.tx);

      if (!deletedBobblehead || deletedBobblehead.length === 0) {
        throw new ActionError(
          ErrorType.INTERNAL,
          'BOBBLEHEAD_DELETE_FAILED',
          ERROR_MESSAGES.BOBBLEHEAD.DELETE_FAILED,
          { bobbleheadId: sanitizedData.id, userId },
          false,
          500,
        );
      }

      // revalidate cache
      revalidatePath(
        $path({
          route: '/collections/[collectionId]',
          routeParams: {
            collectionId: existing[0].collectionId,
          },
        }),
      );

      return {
        data: { deleted: true },
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.DELETE,
        },
        operation: 'delete_bobblehead',
        userId,
      });
    }
  });

export const deleteBobbleheadsAction = authActionClient
  .use(createRateLimitMiddleware(10, 60))
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.DELETE_BULK,
    isTransactionRequired: true,
  })
  .inputSchema(deleteBobbleheadsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const userId = ctx.userId;

    try {
      const deletedBobbleheads = await deleteBobbleheadsAsync(sanitizedData.ids, userId, ctx.tx);

      if (!deletedBobbleheads || deletedBobbleheads.length === 0) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          'BOBBLEHEADS_NOT_FOUND',
          'No bobbleheads found to delete or access denied',
          { bobbleheadIds: sanitizedData.ids, userId },
          false,
          404,
        );
      }

      // revalidate cache for all affected collections
      const collectionIds = [...new Set(deletedBobbleheads.map((b) => b.collectionId))];
      for (const collectionId of collectionIds) {
        revalidatePath(
          $path({
            route: '/collections/[collectionId]',
            routeParams: { collectionId },
          }),
        );
      }

      return {
        data: { deletedCount: deletedBobbleheads.length },
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.DELETE_BULK,
        },
        operation: 'delete_bobbleheads_bulk',
        userId,
      });
    }
  });

// photo operations
export const uploadBobbleheadPhotoAction = authActionClient
  .use(createRateLimitMiddleware(30, 60))
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.UPLOAD_PHOTO,
    isTransactionRequired: true,
  })
  .inputSchema(insertBobbleheadPhotoSchema)
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const userId = ctx.userId;

    try {
      // verify bobblehead ownership
      const bobblehead = await getBobbleheadByIdAsync(sanitizedData.bobbleheadId, ctx.db);
      if (!bobblehead || bobblehead.length === 0) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          'BOBBLEHEAD_NOT_FOUND',
          ERROR_MESSAGES.BOBBLEHEAD.NOT_FOUND,
          { bobbleheadId: sanitizedData.bobbleheadId },
          false,
          404,
        );
      }

      if (bobblehead[0]?.userId !== userId) {
        throw new ActionError(
          ErrorType.AUTHORIZATION,
          'BOBBLEHEAD_PHOTO_UPLOAD_UNAUTHORIZED',
          'You can only upload photos to your own bobbleheads',
          { bobbleheadId: sanitizedData.bobbleheadId, userId },
          false,
          403,
        );
      }

      const newPhoto = await createBobbleheadPhotoAsync(sanitizedData, ctx.tx);

      if (!newPhoto || newPhoto.length === 0) {
        throw new ActionError(
          ErrorType.INTERNAL,
          'BOBBLEHEAD_PHOTO_UPLOAD_FAILED',
          'Failed to upload photo',
          { bobbleheadId: sanitizedData.bobbleheadId, userId },
          false,
          500,
        );
      }

      return {
        data: newPhoto[0],
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.UPLOAD_PHOTO,
        },
        operation: 'upload_bobblehead_photo',
        userId,
      });
    }
  });

export const updateBobbleheadPhotoAction = authActionClient
  .use(createRateLimitMiddleware(60, 60))
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE_PHOTO,
    isTransactionRequired: true,
  })
  .inputSchema(updateBobbleheadPhotoSchema.extend({ id: getBobbleheadByIdSchema.shape.id }))
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const userId = ctx.userId;
    const { id, ...updateData } = sanitizedData;

    try {
      const updatedPhoto = await updateBobbleheadPhotoAsync(id, updateData, ctx.tx);

      if (!updatedPhoto || updatedPhoto.length === 0) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          'BOBBLEHEAD_PHOTO_NOT_FOUND',
          'Photo not found or access denied',
          { photoId: id, userId },
          false,
          404,
        );
      }

      return {
        data: updatedPhoto[0],
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE_PHOTO,
        },
        operation: 'update_bobblehead_photo',
        userId,
      });
    }
  });

export const deleteBobbleheadPhotoAction = authActionClient
  .use(createRateLimitMiddleware(60, 60))
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.DELETE_PHOTO,
    isTransactionRequired: true,
  })
  .inputSchema(deleteBobbleheadPhotoSchema)
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const userId = ctx.userId;

    try {
      // verify bobblehead ownership
      const bobblehead = await getBobbleheadByIdAsync(sanitizedData.bobbleheadId, ctx.db);
      if (!bobblehead || bobblehead.length === 0 || bobblehead[0]?.userId !== userId) {
        throw new ActionError(
          ErrorType.AUTHORIZATION,
          'BOBBLEHEAD_PHOTO_DELETE_UNAUTHORIZED',
          'You can only delete photos from your own bobbleheads',
          { bobbleheadId: sanitizedData.bobbleheadId, userId },
          false,
          403,
        );
      }

      const deletedPhoto = await deleteBobbleheadPhotoAsync(
        sanitizedData.id,
        sanitizedData.bobbleheadId,
        ctx.tx,
      );

      if (!deletedPhoto || deletedPhoto.length === 0) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          'BOBBLEHEAD_PHOTO_NOT_FOUND',
          'Photo not found',
          { bobbleheadId: sanitizedData.bobbleheadId, photoId: sanitizedData.id },
          false,
          404,
        );
      }

      return {
        data: { deleted: true },
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.DELETE_PHOTO,
        },
        operation: 'delete_bobblehead_photo',
        userId,
      });
    }
  });

export const reorderBobbleheadPhotosAction = authActionClient
  .use(createRateLimitMiddleware(30, 60))
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.REORDER_PHOTOS,
    isTransactionRequired: true,
  })
  .inputSchema(reorderPhotosSchema)
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const userId = ctx.userId;

    try {
      // verify bobblehead ownership
      const bobblehead = await getBobbleheadByIdAsync(sanitizedData.bobbleheadId, ctx.db);
      if (!bobblehead || bobblehead.length === 0 || bobblehead[0]?.userId !== userId) {
        throw new ActionError(
          ErrorType.AUTHORIZATION,
          'BOBBLEHEAD_PHOTO_REORDER_UNAUTHORIZED',
          'You can only reorder photos on your own bobbleheads',
          { bobbleheadId: sanitizedData.bobbleheadId, userId },
          false,
          403,
        );
      }

      const reorderedPhotos = await reorderBobbleheadPhotosAsync(
        sanitizedData.updates,
        sanitizedData.bobbleheadId,
        ctx.tx,
      );

      return {
        data: reorderedPhotos,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.REORDER_PHOTOS,
        },
        operation: 'reorder_bobblehead_photos',
        userId,
      });
    }
  });

// Tag operations
export const addTagToBobbleheadAction = authActionClient
  .use(createRateLimitMiddleware(60, 60))
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.ADD_TAG,
    isTransactionRequired: true,
  })
  .inputSchema(addTagToBobbleheadSchema)
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const userId = ctx.userId;

    try {
      // verify bobblehead ownership
      const bobblehead = await getBobbleheadByIdAsync(sanitizedData.bobbleheadId, ctx.db);
      if (!bobblehead || bobblehead.length === 0 || bobblehead[0]?.userId !== userId) {
        throw new ActionError(
          ErrorType.AUTHORIZATION,
          'BOBBLEHEAD_TAG_ADD_UNAUTHORIZED',
          'You can only add tags to your own bobbleheads',
          { bobbleheadId: sanitizedData.bobbleheadId, userId },
          false,
          403,
        );
      }

      const tagAssignment = await addTagToBobbleheadAsync(
        sanitizedData.bobbleheadId,
        sanitizedData.tagId,
        ctx.tx,
      );

      return {
        data: tagAssignment[0] || { alreadyExists: true },
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.ADD_TAG,
        },
        operation: 'add_tag_to_bobblehead',
        userId,
      });
    }
  });

export const removeTagFromBobbleheadAction = authActionClient
  .use(createRateLimitMiddleware(60, 60))
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.REMOVE_TAG,
    isTransactionRequired: true,
  })
  .inputSchema(removeTagFromBobbleheadSchema)
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const userId = ctx.userId;

    try {
      // verify bobblehead ownership
      const bobblehead = await getBobbleheadByIdAsync(sanitizedData.bobbleheadId, ctx.db);
      if (!bobblehead || bobblehead.length === 0 || bobblehead[0]?.userId !== userId) {
        throw new ActionError(
          ErrorType.AUTHORIZATION,
          'BOBBLEHEAD_TAG_REMOVE_UNAUTHORIZED',
          'You can only remove tags from your own bobbleheads',
          { bobbleheadId: sanitizedData.bobbleheadId, userId },
          false,
          403,
        );
      }

      const removedTag = await removeTagFromBobbleheadAsync(
        sanitizedData.bobbleheadId,
        sanitizedData.tagId,
        ctx.tx,
      );

      if (!removedTag || removedTag.length === 0) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          'TAG_ASSIGNMENT_NOT_FOUND',
          'Tag assignment not found',
          { bobbleheadId: sanitizedData.bobbleheadId, tagId: sanitizedData.tagId },
          false,
          404,
        );
      }

      return {
        data: { removed: true },
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.REMOVE_TAG,
        },
        operation: 'remove_tag_from_bobblehead',
        userId,
      });
    }
  });
