'use server';

import 'server-only';

import type { BobbleheadRecord } from '@/lib/queries/bobbleheads/bobbleheads.query';
import type { ActionResponse } from '@/lib/utils/action-response';

import {
  ACTION_NAMES,
  CONFIG,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_CONTEXTS,
} from '@/lib/constants';
import { BobbleheadsFacade, type CreateBobbleheadResult } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { TagsFacade } from '@/lib/facades/tags/tags.facade';
import { createRateLimitMiddleware } from '@/lib/middleware/rate-limit.middleware';
import { actionSuccess } from '@/lib/utils/action-response';
import { createInternalError, createNotFoundError } from '@/lib/utils/error-builders';
import { authActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import {
  actionBreadcrumb,
  captureFacadeWarning,
  withActionBreadcrumbs,
  withActionErrorHandling,
} from '@/lib/utils/sentry-server/breadcrumbs.server';
import {
  batchDeleteBobbleheadsSchema,
  batchUpdateBobbleheadFeatureSchema,
  createBobbleheadWithPhotosSchema,
  deleteBobbleheadPhotoSchema,
  deleteBobbleheadSchema,
  getBobbleheadPhotosSchema,
  reorderBobbleheadPhotosSchema,
  updateBobbleheadFeatureSchema,
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

        return actionSuccess(result, 'Bobblehead created successfully!');
      },
    );
  });

export const deleteBobbleheadAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.DELETE,
    isTransactionRequired: true,
  })
  .inputSchema(deleteBobbleheadSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<BobbleheadRecord | null>> => {
    const bobbleheadData = deleteBobbleheadSchema.parse(ctx.sanitizedInput);

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.BOBBLEHEADS.DELETE,
        contextData: bobbleheadData,
        contextType: SENTRY_CONTEXTS.BOBBLEHEAD_DATA,
        input: parsedInput,
        operation: OPERATIONS.BOBBLEHEADS.DELETE_WITH_PHOTOS,
        userId: ctx.userId,
      },
      async () => {
        const deletedBobblehead = await BobbleheadsFacade.deleteAsync(bobbleheadData, ctx.userId, ctx.db);

        if (!deletedBobblehead) {
          throw createInternalError(ERROR_MESSAGES.BOBBLEHEAD.DELETE_FAILED, {
            errorCode: ERROR_CODES.BOBBLEHEADS.DELETE_FAILED,
            operation: OPERATIONS.BOBBLEHEADS.DELETE_WITH_PHOTOS,
          });
        }

        return actionSuccess(deletedBobblehead, 'Bobblehead deleted successfully!');
      },
      {
        includeResultSummary: () => ({
          bobbleheadId: bobbleheadData.bobbleheadId,
        }),
      },
    );
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

      return withActionErrorHandling(
        {
          actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE,
          contextData: { ...bobbleheadData, id },
          contextType: SENTRY_CONTEXTS.BOBBLEHEAD_DATA,
          input: parsedInput,
          operation: OPERATIONS.BOBBLEHEADS.UPDATE,
          userId,
        },
        async () => {
          const updatedBobblehead = await BobbleheadsFacade.updateAsync(
            { id, ...bobbleheadData },
            userId,
            ctx.db,
          );

          if (!updatedBobblehead) {
            throw createInternalError(ERROR_MESSAGES.BOBBLEHEAD.UPDATE_FAILED, {
              errorCode: ERROR_CODES.BOBBLEHEADS.UPDATE_FAILED,
              operation: OPERATIONS.BOBBLEHEADS.UPDATE,
            });
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
              await TagsFacade.removeAllFromBobbleheadAsync(updatedBobblehead.id, userId);

              // create or get existing tags for the user
              const tagPromises = tags.map(async (tagName) => {
                const existingTag = await TagsFacade.getOrCreateByNameAsync(tagName, userId, ctx.db);
                return existingTag;
              });

              const tagRecords = await Promise.all(tagPromises);
              const tagIds = tagRecords.filter(Boolean).map((tag) => tag!.id);

              // attach tags to the bobblehead
              if (tagIds.length > 0) {
                await TagsFacade.attachToBobbleheadAsync(updatedBobblehead.id, tagIds, userId, ctx.db);
                updatedTags = tagRecords.filter(Boolean);
              }
            } catch (tagError) {
              // if tag processing fails, we still want to keep the update
              captureFacadeWarning(tagError, 'TagsFacade', 'process_tags', {
                bobbleheadId: updatedBobblehead.id,
                tagsAttempted: tags.length,
              });
            }
          }

          actionBreadcrumb(`Updated bobblehead: ${updatedBobblehead.name}`, {
            bobbleheadId: updatedBobblehead.id,
            photosCount: uploadedPhotos.length,
            tagsCount: updatedTags.length,
          });

          return actionSuccess(
            {
              bobblehead: updatedBobblehead,
              photos: uploadedPhotos,
              tags: updatedTags,
            },
            'Bobblehead updated successfully!',
          );
        },
        {
          includeResultSummary: (result) => ({
            bobbleheadId: id,
            photosCount: result.data?.photos?.length ?? 0,
            tagsCount: result.data?.tags?.length ?? 0,
          }),
        },
      );
    },
  );

export const getBobbleheadPhotosAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.GET_PHOTOS_BY_BOBBLEHEAD,
  })
  .inputSchema(getBobbleheadPhotosSchema)
  .action(async ({ ctx }): Promise<ActionResponse<Array<unknown>>> => {
    const { bobbleheadId } = getBobbleheadPhotosSchema.parse(ctx.sanitizedInput);
    const userId = (await getUserIdAsync()) ?? undefined;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.BOBBLEHEADS.GET_PHOTOS_BY_BOBBLEHEAD,
        operation: OPERATIONS.BOBBLEHEADS.GET_PHOTOS,
        userId,
      },
      async () => {
        const photos = await BobbleheadsFacade.getBobbleheadPhotosAsync(
          bobbleheadId,
          userId ?? undefined,
          ctx.db,
        );

        return actionSuccess(photos, 'Photos retrieved successfully!');
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadId,
          photosCount: result.data?.length ?? 0,
        }),
      },
    );
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

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.BOBBLEHEADS.DELETE_PHOTO,
        contextData: photoData,
        contextType: SENTRY_CONTEXTS.BOBBLEHEAD_DATA,
        input: parsedInput,
        operation: OPERATIONS.BOBBLEHEADS.DELETE_PHOTO,
        userId,
      },
      async () => {
        // get all photos for the bobblehead before deletion to determine if we need to promote a new primary
        const allPhotos = await BobbleheadsFacade.getBobbleheadPhotosAsync(
          photoData.bobbleheadId,
          userId,
          ctx.db,
        );

        const photoToDelete = allPhotos.find((p: { id: string }) => p.id === photoData.photoId);

        if (!photoToDelete) {
          throw createNotFoundError('Photo', photoData.photoId, {
            bobbleheadId: photoData.bobbleheadId,
            errorCode: ERROR_CODES.BOBBLEHEADS.DELETE_FAILED,
            operation: OPERATIONS.BOBBLEHEADS.DELETE_PHOTO,
          });
        }

        const wasPrimaryPhoto = photoToDelete.isPrimary;

        // delete the photo
        const deletedPhoto = await BobbleheadsFacade.deletePhotoAsync(photoData, userId, ctx.db);

        if (!deletedPhoto) {
          throw createNotFoundError('Photo', photoData.photoId, {
            bobbleheadId: photoData.bobbleheadId,
            errorCode: ERROR_CODES.BOBBLEHEADS.DELETE_FAILED,
            operation: OPERATIONS.BOBBLEHEADS.DELETE_PHOTO,
          });
        }

        // get remaining photos after deletion
        const remainingPhotos = allPhotos.filter((p: { id: string }) => p.id !== photoData.photoId);

        // if we deleted the primary photo and there are remaining photos, promote the first one
        if (wasPrimaryPhoto && remainingPhotos.length > 0) {
          // reindex all remaining photos with proper sortOrder and set first as primary
          const photoOrder = remainingPhotos
            .sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder)
            .map((photo: { id: string }, index: number) => ({
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

          actionBreadcrumb('Promoted new primary photo after deletion', {
            bobbleheadId: photoData.bobbleheadId,
            newPrimaryPhotoId: photoOrder[0]?.id,
          });
        } else if (remainingPhotos.length > 0) {
          // reindex sortOrder for remaining photos even if we didn't delete the primary
          const photoOrder = remainingPhotos
            .sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder)
            .map((photo: { id: string }, index: number) => ({
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

        return actionSuccess(deletedPhoto, 'Photo deleted successfully!');
      },
      {
        includeResultSummary: () => ({
          bobbleheadId: photoData.bobbleheadId,
          photoId: photoData.photoId,
        }),
      },
    );
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

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.BOBBLEHEADS.REORDER_PHOTOS,
        contextData: {
          bobbleheadId: reorderData.bobbleheadId,
          photoCount: reorderData.photoOrder.length,
        },
        contextType: SENTRY_CONTEXTS.BOBBLEHEAD_DATA,
        input: parsedInput,
        operation: OPERATIONS.BOBBLEHEADS.REORDER_PHOTOS,
        userId,
      },
      async () => {
        const updatedPhotos = await BobbleheadsFacade.reorderPhotosAsync(reorderData, userId, ctx.db);

        if (updatedPhotos.length === 0) {
          throw createNotFoundError('Photos', reorderData.bobbleheadId, {
            errorCode: ERROR_CODES.BOBBLEHEADS.UPDATE_FAILED,
            operation: OPERATIONS.BOBBLEHEADS.REORDER_PHOTOS,
          });
        }

        return actionSuccess(updatedPhotos, 'Photos reordered successfully!');
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadId: reorderData.bobbleheadId,
          photosReordered: result.data?.length ?? 0,
        }),
      },
    );
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

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE_PHOTO_METADATA,
        contextData: {
          bobbleheadId: metadataData.bobbleheadId,
          photoId: metadataData.photoId,
        },
        contextType: SENTRY_CONTEXTS.BOBBLEHEAD_DATA,
        input: parsedInput,
        operation: OPERATIONS.BOBBLEHEADS.UPDATE_PHOTO_METADATA,
        userId,
      },
      async () => {
        const updatedPhoto = await BobbleheadsFacade.updatePhotoMetadataAsync(metadataData, userId, ctx.db);

        if (!updatedPhoto) {
          throw createNotFoundError('Photo', metadataData.photoId, {
            bobbleheadId: metadataData.bobbleheadId,
            errorCode: ERROR_CODES.BOBBLEHEADS.UPDATE_FAILED,
            operation: OPERATIONS.BOBBLEHEADS.UPDATE_PHOTO_METADATA,
          });
        }

        return actionSuccess(updatedPhoto, 'Photo metadata updated successfully!');
      },
      {
        includeResultSummary: () => ({
          bobbleheadId: metadataData.bobbleheadId,
          photoId: metadataData.photoId,
        }),
      },
    );
  });

export const updateBobbleheadFeatureAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE_FEATURE,
    isTransactionRequired: true,
  })
  .inputSchema(updateBobbleheadFeatureSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<unknown>> => {
    const data = updateBobbleheadFeatureSchema.parse(ctx.sanitizedInput);

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE_FEATURE,
        contextData: {
          bobbleheadId: data.id,
          isFeatured: data.isFeatured,
          userId: ctx.userId,
        },
        contextType: SENTRY_CONTEXTS.BOBBLEHEAD_DATA,
        input: parsedInput,
        operation: OPERATIONS.BOBBLEHEADS.UPDATE_FEATURED,
        userId: ctx.userId,
      },
      async () => {
        const result = await BobbleheadsFacade.updateFeaturedAsync(
          data.id,
          data.isFeatured,
          ctx.userId,
          ctx.db,
        );

        if (!result) {
          throw createNotFoundError('Bobblehead', data.id, {
            errorCode: ERROR_CODES.BOBBLEHEADS.UPDATE_FAILED,
            operation: OPERATIONS.BOBBLEHEADS.UPDATE_FEATURED,
          });
        }

        return actionSuccess(
          { bobblehead: result },
          `Bobblehead ${data.isFeatured ? 'featured' : 'unfeatured'} successfully!`,
        );
      },
      {
        includeResultSummary: () => ({
          bobbleheadId: data.id,
          isFeatured: data.isFeatured,
        }),
      },
    );
  });

export const batchUpdateBobbleheadFeatureAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.BATCH_UPDATE_FEATURE,
    isTransactionRequired: true,
  })
  .inputSchema(batchUpdateBobbleheadFeatureSchema)
  .action(
    async ({ ctx, parsedInput }): Promise<ActionResponse<{ bobbleheads: Array<unknown>; count: number }>> => {
      const data = batchUpdateBobbleheadFeatureSchema.parse(ctx.sanitizedInput);

      return withActionErrorHandling(
        {
          actionName: ACTION_NAMES.BOBBLEHEADS.BATCH_UPDATE_FEATURE,
          contextData: {
            bobbleheadCount: data.ids.length,
            isFeatured: data.isFeatured,
            userId: ctx.userId,
          },
          contextType: SENTRY_CONTEXTS.BOBBLEHEAD_DATA,
          input: parsedInput,
          operation: OPERATIONS.BOBBLEHEADS.BATCH_UPDATE_FEATURED,
          userId: ctx.userId,
        },
        async () => {
          const result = await BobbleheadsFacade.batchUpdateFeaturedAsync(
            data.ids,
            data.isFeatured,
            ctx.userId,
            ctx.db,
          );

          return actionSuccess(
            { bobbleheads: result, count: result.length },
            `Batch ${data.isFeatured ? 'featured' : 'unfeatured'} ${result.length} bobbleheads successfully!`,
          );
        },
        {
          includeResultSummary: (r) => ({
            count: r.data?.count ?? 0,
            isFeatured: data.isFeatured,
          }),
        },
      );
    },
  );

export const batchDeleteBobbleheadsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.DELETE_BULK,
    isTransactionRequired: true,
  })
  .inputSchema(batchDeleteBobbleheadsSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<{ count: number }>> => {
    const data = batchDeleteBobbleheadsSchema.parse(ctx.sanitizedInput);

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.BOBBLEHEADS.DELETE_BULK,
        contextData: {
          bobbleheadCount: data.ids.length,
          userId: ctx.userId,
        },
        contextType: SENTRY_CONTEXTS.BOBBLEHEAD_DATA,
        input: parsedInput,
        operation: OPERATIONS.BOBBLEHEADS.BATCH_DELETE,
        userId: ctx.userId,
      },
      async () => {
        const result = await BobbleheadsFacade.batchDeleteAsync(data.ids, ctx.userId, ctx.db);

        return actionSuccess({ count: result.count }, `Deleted ${result.count} bobbleheads successfully!`);
      },
      {
        includeResultSummary: (r) => ({
          count: r.data?.count ?? 0,
        }),
      },
    );
  });
