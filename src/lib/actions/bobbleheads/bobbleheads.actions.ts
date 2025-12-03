'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

import type { ActionResponse } from '@/lib/utils/action-response';

import {
  ACTION_NAMES,
  CONFIG,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { BobbleheadsFacade, type CreateBobbleheadResult } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { TagsFacade } from '@/lib/facades/tags/tags.facade';
import { createRateLimitMiddleware } from '@/lib/middleware/rate-limit.middleware';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { actionSuccess } from '@/lib/utils/action-response';
import { createInternalError } from '@/lib/utils/error-builders';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import { withActionErrorHandling } from '@/lib/utils/sentry-server/breadcrumbs.server';
import {
  createBobbleheadWithPhotosSchema,
  deleteBobbleheadPhotoSchema,
  deleteBobbleheadSchema,
  reorderBobbleheadPhotosSchema,
  updateBobbleheadPhotoMetadataSchema,
  updateBobbleheadWithPhotosSchema,
} from '@/lib/validations/bobbleheads.validation';
import { getUserIdAsync } from '@/utils/auth-utils';

export const createBobbleheadWithPhotosAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.CREATE,
    isTransactionRequired: true,
  })
  .use(
    createRateLimitMiddleware(
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.BOBBLEHEAD_CREATE.REQUESTS,
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.BOBBLEHEAD_CREATE.WINDOW,
    ),
  )
  .inputSchema(createBobbleheadWithPhotosSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<CreateBobbleheadResult>> => {
    const { photos, ...bobbleheadData } = createBobbleheadWithPhotosSchema.parse(ctx.sanitizedInput);

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.BOBBLEHEADS.CREATE,
        contextData: bobbleheadData,
        contextType: SENTRY_CONTEXTS.BOBBLEHEAD_DATA,
        input: parsedInput,
        operation: OPERATIONS.BOBBLEHEADS.CREATE_WITH_PHOTOS,
        userId: ctx.userId,
      },
      async () => {
        const result = await BobbleheadsFacade.createWithPhotosAsync(
          bobbleheadData,
          photos,
          ctx.userId,
          ctx.db,
        );

        if (!result) {
          throw createInternalError(ERROR_MESSAGES.BOBBLEHEAD.CREATE_FAILED, {
            errorCode: ERROR_CODES.BOBBLEHEADS.CREATE_FAILED,
            operation: OPERATIONS.BOBBLEHEADS.CREATE,
          });
        }

        // Cache invalidation is handled by the facade

        return actionSuccess(result);
      },
    );
  });

export const deleteBobbleheadAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.DELETE,
    isTransactionRequired: true,
  })
  .inputSchema(deleteBobbleheadSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<null>> => {
    const bobbleheadData = deleteBobbleheadSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, bobbleheadData);

    try {
      const deletedBobblehead = await BobbleheadsFacade.deleteAsync(bobbleheadData, ctx.userId, dbInstance);

      if (!deletedBobblehead) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.BOBBLEHEADS.DELETE_FAILED,
          ERROR_MESSAGES.BOBBLEHEAD.DELETE_FAILED,
          { ctx, operation: OPERATIONS.BOBBLEHEADS.DELETE_WITH_PHOTOS },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          bobblehead: deletedBobblehead,
          hasPhotos: Boolean(deletedBobblehead),
        },
        level: SENTRY_LEVELS.INFO,
        message: `Deleted bobblehead: ${deletedBobblehead.name} with Cloudinary photo cleanup`,
      });

      // Cache invalidation is handled by the facade

      return actionSuccess(null);
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.DELETE,
        },
        operation: OPERATIONS.BOBBLEHEADS.DELETE_WITH_PHOTOS,
        userId: ctx.userId,
      });
    }
  });

export const updateBobbleheadWithPhotosAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE,
    isTransactionRequired: true,
  })
  .use(
    createRateLimitMiddleware(
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.BOBBLEHEAD_CREATE.REQUESTS,
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.BOBBLEHEAD_CREATE.WINDOW,
    ),
  )
  .inputSchema(updateBobbleheadWithPhotosSchema)
  .action(
    async ({
      ctx,
      parsedInput,
    }): Promise<
      ActionResponse<{
        bobblehead: unknown;
        photos: Array<unknown>;
        tags: Array<unknown>;
      }>
    > => {
      const { id, photos, tags, ...bobbleheadData } = updateBobbleheadWithPhotosSchema.parse(
        ctx.sanitizedInput,
      );
      const userId = ctx.userId;

      Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, { ...bobbleheadData, id });

      try {
        const updatedBobblehead = await BobbleheadsFacade.updateAsync(
          { id, ...bobbleheadData },
          userId,
          ctx.db,
        );

        if (!updatedBobblehead) {
          throw new ActionError(
            ErrorType.INTERNAL,
            ERROR_CODES.BOBBLEHEADS.UPDATE_FAILED,
            ERROR_MESSAGES.BOBBLEHEAD.UPDATE_FAILED,
            { ctx, operation: OPERATIONS.BOBBLEHEADS.UPDATE },
            false,
            500,
          );
        }

        // if photos are provided, process new photos via facade
        // (facade handles filtering, Cloudinary moves, and cache invalidation)
        let uploadedPhotos: Array<unknown> = [];
        if (photos && photos.length > 0) {
          uploadedPhotos = await BobbleheadsFacade.addPhotosToExistingBobbleheadAsync(
            updatedBobblehead.id,
            updatedBobblehead.collectionId,
            photos,
            userId,
            ctx.db,
          );
        }

        // process tags if provided
        let updatedTags: Array<unknown> = [];
        if (tags && tags.length > 0) {
          try {
            // remove existing tags and add new ones
            await TagsFacade.removeAllFromBobblehead(updatedBobblehead.id, userId);

            // create or get existing tags for the user
            const tagPromises = tags.map(async (tagName) => {
              const existingTag = await TagsFacade.getOrCreateByName(tagName, userId, ctx.db);
              return existingTag;
            });

            const tagRecords = await Promise.all(tagPromises);
            const tagIds = tagRecords.filter(Boolean).map((tag) => tag!.id);

            // attach tags to the bobblehead
            if (tagIds.length > 0) {
              await TagsFacade.attachToBobblehead(updatedBobblehead.id, tagIds, userId, ctx.db);
              updatedTags = tagRecords.filter(Boolean);
            }
          } catch (tagError) {
            // if tag processing fails, we still want to keep the update
            console.error('Tag processing failed:', tagError);
            Sentry.captureException(tagError);
          }
        }

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            bobblehead: updatedBobblehead,
            photosCount: uploadedPhotos.length,
            tagsCount: updatedTags.length,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Updated bobblehead: ${updatedBobblehead.name} with ${uploadedPhotos.length} photos and ${updatedTags.length} tags`,
        });

        // Cache invalidation is handled by the facades (updateAsync and addPhotosToExistingBobbleheadAsync)

        return actionSuccess({
          bobblehead: updatedBobblehead,
          photos: uploadedPhotos,
          tags: updatedTags,
        });
      } catch (error) {
        return handleActionError(error, {
          input: parsedInput,
          metadata: { actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE },
          operation: OPERATIONS.BOBBLEHEADS.UPDATE,
          userId,
        });
      }
    },
  );

const getBobbleheadPhotosSchema = z.object({
  bobbleheadId: z.string(),
});

export const getBobbleheadPhotosAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.GET_PHOTOS_BY_BOBBLEHEAD,
  })
  .inputSchema(getBobbleheadPhotosSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<Array<unknown>>> => {
    const { bobbleheadId } = getBobbleheadPhotosSchema.parse(ctx.sanitizedInput);
    const userId = (await getUserIdAsync()) ?? undefined;

    try {
      const photos = await BobbleheadsFacade.getBobbleheadPhotos(bobbleheadId, userId ?? undefined, ctx.db);

      return actionSuccess(photos);
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: 'getBobbleheadPhotos' },
        operation: OPERATIONS.BOBBLEHEADS.GET_PHOTOS,
        userId,
      });
    }
  });

export const deleteBobbleheadPhotoAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.DELETE_PHOTO,
    isTransactionRequired: true,
  })
  .inputSchema(deleteBobbleheadPhotoSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<unknown>> => {
    const photoData = deleteBobbleheadPhotoSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, photoData);

    try {
      // get all photos for the bobblehead before deletion to determine if we need to promote a new primary
      const allPhotos = await BobbleheadsFacade.getBobbleheadPhotos(photoData.bobbleheadId, userId, ctx.db);

      const photoToDelete = allPhotos.find((p) => p.id === photoData.photoId);

      if (!photoToDelete) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.BOBBLEHEADS.DELETE_FAILED,
          ERROR_MESSAGES.BOBBLEHEAD.DELETE_FAILED,
          { ctx, operation: OPERATIONS.BOBBLEHEADS.DELETE_PHOTO },
          false,
          404,
        );
      }

      const wasPrimaryPhoto = photoToDelete.isPrimary;

      // delete the photo
      const deletedPhoto = await BobbleheadsFacade.deletePhotoAsync(photoData, userId, ctx.db);

      if (!deletedPhoto) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.BOBBLEHEADS.DELETE_FAILED,
          ERROR_MESSAGES.BOBBLEHEAD.DELETE_FAILED,
          { ctx, operation: OPERATIONS.BOBBLEHEADS.DELETE_PHOTO },
          false,
          404,
        );
      }

      // get remaining photos after deletion
      const remainingPhotos = allPhotos.filter((p) => p.id !== photoData.photoId);

      // if we deleted the primary photo and there are remaining photos, promote the first one
      if (wasPrimaryPhoto && remainingPhotos.length > 0) {
        // reindex all remaining photos with proper sortOrder and set first as primary
        const photoOrder = remainingPhotos
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((photo, index) => ({
            id: photo.id,
            isPrimary: index === 0,
            sortOrder: index,
          }));

        await BobbleheadsFacade.reorderPhotosAsync(
          {
            bobbleheadId: photoData.bobbleheadId,
            photoOrder,
          },
          userId,
          ctx.db,
        );

        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            bobbleheadId: photoData.bobbleheadId,
            newPrimaryPhotoId: photoOrder[0]?.id,
          },
          level: SENTRY_LEVELS.INFO,
          message: 'Promoted new primary photo after deletion',
        });
      } else if (remainingPhotos.length > 0) {
        // reindex sortOrder for remaining photos even if we didn't delete the primary
        const photoOrder = remainingPhotos
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((photo, index) => ({
            id: photo.id,
            sortOrder: index,
          }));

        await BobbleheadsFacade.reorderPhotosAsync(
          {
            bobbleheadId: photoData.bobbleheadId,
            photoOrder,
          },
          userId,
          ctx.db,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          bobbleheadId: photoData.bobbleheadId,
          photoId: deletedPhoto.id,
          wasPrimaryPhoto,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Deleted photo ${deletedPhoto.id} from bobblehead ${photoData.bobbleheadId}`,
      });

      // Cache invalidation is handled by the facade

      return actionSuccess(deletedPhoto);
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.BOBBLEHEADS.DELETE_PHOTO },
        operation: OPERATIONS.BOBBLEHEADS.DELETE_PHOTO,
        userId,
      });
    }
  });

export const reorderBobbleheadPhotosAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.REORDER_PHOTOS,
    isTransactionRequired: true,
  })
  .use(
    createRateLimitMiddleware(
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.PHOTO_REORDER.REQUESTS,
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.PHOTO_REORDER.WINDOW,
    ),
  )
  .inputSchema(reorderBobbleheadPhotosSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<Array<unknown>>> => {
    const reorderData = reorderBobbleheadPhotosSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, {
      bobbleheadId: reorderData.bobbleheadId,
      photoCount: reorderData.photoOrder.length,
    });

    try {
      const updatedPhotos = await BobbleheadsFacade.reorderPhotosAsync(reorderData, userId, ctx.db);

      if (updatedPhotos.length === 0) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.BOBBLEHEADS.UPDATE_FAILED,
          ERROR_MESSAGES.BOBBLEHEAD.UPDATE_FAILED,
          { ctx, operation: OPERATIONS.BOBBLEHEADS.REORDER_PHOTOS },
          false,
          404,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          bobbleheadId: reorderData.bobbleheadId,
          photosReordered: updatedPhotos.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Reordered ${updatedPhotos.length} photos for bobblehead ${reorderData.bobbleheadId}`,
      });

      // Cache invalidation is handled by the facade

      return actionSuccess(updatedPhotos);
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.BOBBLEHEADS.REORDER_PHOTOS },
        operation: OPERATIONS.BOBBLEHEADS.REORDER_PHOTOS,
        userId,
      });
    }
  });

export const updateBobbleheadPhotoMetadataAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE_PHOTO_METADATA,
    isTransactionRequired: true,
  })
  .use(
    createRateLimitMiddleware(
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.PHOTO_REORDER.REQUESTS,
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.PHOTO_REORDER.WINDOW,
    ),
  )
  .inputSchema(updateBobbleheadPhotoMetadataSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<unknown>> => {
    const metadataData = updateBobbleheadPhotoMetadataSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, {
      bobbleheadId: metadataData.bobbleheadId,
      photoId: metadataData.photoId,
    });

    try {
      const updatedPhoto = await BobbleheadsFacade.updatePhotoMetadataAsync(metadataData, userId, ctx.db);

      if (!updatedPhoto) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.BOBBLEHEADS.UPDATE_FAILED,
          ERROR_MESSAGES.BOBBLEHEAD.UPDATE_FAILED,
          { ctx, operation: OPERATIONS.BOBBLEHEADS.UPDATE_PHOTO_METADATA },
          false,
          404,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          bobbleheadId: metadataData.bobbleheadId,
          photoId: metadataData.photoId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Updated metadata for photo ${metadataData.photoId} in bobblehead ${metadataData.bobbleheadId}`,
      });

      // Cache invalidation is handled by the facade

      return actionSuccess(updatedPhoto);
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE_PHOTO_METADATA },
        operation: OPERATIONS.BOBBLEHEADS.UPDATE_PHOTO_METADATA,
        userId,
      });
    }
  });
