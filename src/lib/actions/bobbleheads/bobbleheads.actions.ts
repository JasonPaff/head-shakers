'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

import {
  ACTION_NAMES,
  CloudinaryPathBuilder,
  CONFIG,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { TagsFacade } from '@/lib/facades/tags/tags.facade';
import { createRateLimitMiddleware } from '@/lib/middleware/rate-limit.middleware';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CloudinaryService } from '@/lib/services/cloudinary.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import {
  createBobbleheadWithPhotosSchema,
  deleteBobbleheadSchema,
} from '@/lib/validations/bobbleheads.validation';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

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
  .action(async ({ ctx, parsedInput }) => {
    const { photos, tags, ...bobbleheadData } = createBobbleheadWithPhotosSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, bobbleheadData);

    try {
      const newBobblehead = await BobbleheadsFacade.createAsync(bobbleheadData, userId, ctx.tx);

      if (!newBobblehead) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.BOBBLEHEADS.CREATE_FAILED,
          ERROR_MESSAGES.BOBBLEHEAD.CREATE_FAILED,
          { ctx, operation: OPERATIONS.BOBBLEHEADS.CREATE },
          false,
          500,
        );
      }

      // if photos are provided, create database records for them
      let uploadedPhotos: Array<unknown> = [];
      if (photos && photos.length > 0) {
        try {
          // move photos from temp folder to permanent location in Cloudinary
          const permanentFolder = CloudinaryPathBuilder.bobbleheadPath(
            userId,
            newBobblehead.collectionId,
            newBobblehead.id,
          );
          const movedPhotos = await CloudinaryService.movePhotosToPermFolder(
            photos.map((photo) => ({
              publicId: photo.publicId,
              url: photo.url,
            })),
            permanentFolder,
          );

          // create a map of old publicId to new values for a quick lookup
          const movedPhotosMap = new Map(
            movedPhotos.map((moved) => [
              moved.oldPublicId,
              { newPublicId: moved.newPublicId, newUrl: moved.newUrl },
            ]),
          );

          // update photo records with new URLs and public IDs
          const photoRecords = photos.map((photo) => {
            const movedPhoto = movedPhotosMap.get(photo.publicId);
            return {
              altText: photo.altText,
              bobbleheadId: newBobblehead.id,
              caption: photo.caption,
              fileSize: photo.bytes,
              height: photo.height,
              isPrimary: photo.isPrimary,
              sortOrder: photo.sortOrder,
              url: movedPhoto?.newUrl || photo.url, // use new URL if the move succeeded
              width: photo.width,
            };
          });

          // insert photos into the database with permanent URLs
          uploadedPhotos = await Promise.all(
            photoRecords.map((record) => BobbleheadsFacade.addPhotoAsync(record, ctx.tx)),
          );

          // clean up any temp photos that failed to move
          const failedMoves = movedPhotos.filter((m) => m.oldPublicId === m.newPublicId);
          if (failedMoves.length > 0) {
            console.warn(`Failed to move ${failedMoves.length} photos to permanent location`);
            Sentry.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
              data: { failedMoves },
              level: SENTRY_LEVELS.WARNING,
              message: 'Some photos failed to move to permanent location',
            });
          }
        } catch (photoError) {
          // if photo processing fails, we still want to keep the bobblehead,
          // but we should log this for debugging
          console.error('Photo processing failed:', photoError);
          Sentry.captureException(photoError);

          // still try to save photos with temp URLs as fallback
          try {
            const photoRecords = photos.map((photo) => ({
              altText: photo.altText,
              bobbleheadId: newBobblehead.id,
              caption: photo.caption,
              fileSize: photo.bytes,
              height: photo.height,
              isPrimary: photo.isPrimary,
              sortOrder: photo.sortOrder,
              url: photo.url,
              width: photo.width,
            }));

            uploadedPhotos = await Promise.all(
              photoRecords.map((record) => BobbleheadsFacade.addPhotoAsync(record, ctx.tx)),
            );
          } catch (fallbackError) {
            console.error('Fallback photo save also failed:', fallbackError);
            Sentry.captureException(fallbackError);
          }
        }
      }

      // process tags if provided
      let createdTags: Array<unknown> = [];
      if (tags && tags.length > 0) {
        try {
          // create or get existing tags for the user
          const tagPromises = tags.map(async (tagName) => {
            const existingTag = await TagsFacade.getOrCreateByName(tagName, userId, ctx.tx);
            return existingTag;
          });

          const tagRecords = await Promise.all(tagPromises);
          const tagIds = tagRecords.filter(Boolean).map((tag) => tag!.id);

          // attach tags to the bobblehead
          if (tagIds.length > 0) {
            await TagsFacade.attachToBobblehead(newBobblehead.id, tagIds, userId, ctx.tx);
            createdTags = tagRecords.filter(Boolean);
          }
        } catch (tagError) {
          // iff tag processing fails, we still want to keep the bobblehead
          console.error('Tag processing failed:', tagError);
          Sentry.captureException(tagError);
        }
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          bobblehead: newBobblehead,
          photosCount: uploadedPhotos.length,
          tagsCount: createdTags.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Created bobblehead: ${newBobblehead.name} with ${uploadedPhotos.length} photos and ${createdTags.length} tags`,
      });

      CacheRevalidationService.revalidateCollectionFeaturedContent(newBobblehead.collectionId);
      CacheRevalidationService.revalidateBobbleheadFeaturedContent(newBobblehead.id);
      CacheRevalidationService.revalidateDashboard({ userId: ctx.userId });

      return {
        data: {
          bobblehead: newBobblehead,
          photos: uploadedPhotos,
          tags: createdTags,
        },
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.BOBBLEHEADS.CREATE },
        operation: OPERATIONS.BOBBLEHEADS.CREATE_WITH_PHOTOS,
        userId,
      });
    }
  });

export const deleteBobbleheadAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.DELETE,
    isTransactionRequired: true,
  })
  .inputSchema(deleteBobbleheadSchema)
  .action(async ({ ctx, parsedInput }) => {
    const bobbleheadData = deleteBobbleheadSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

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

      CacheRevalidationService.revalidateBobbleheadFeaturedContent(deletedBobblehead.id);
      CacheRevalidationService.revalidateCollectionFeaturedContent(deletedBobblehead.collectionId);
      CacheRevalidationService.revalidateDashboard({ userId: ctx.userId });

      return {
        data: null,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.BOBBLEHEADS.DELETE,
        },
        operation: OPERATIONS.BOBBLEHEADS.DELETE_WITH_PHOTOS,
        userId: ctx.userId,
      });
    }
  });

const getBobbleheadPhotosSchema = z.object({
  bobbleheadId: z.string(),
});

export const getBobbleheadPhotosAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.GET_PHOTOS_BY_BOBBLEHEAD,
  })
  .inputSchema(getBobbleheadPhotosSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { bobbleheadId } = getBobbleheadPhotosSchema.parse(ctx.sanitizedInput);
    const userId = (await getOptionalUserId()) ?? undefined;

    try {
      const photos = await BobbleheadsFacade.getBobbleheadPhotos(bobbleheadId, userId ?? undefined, ctx.db);

      return {
        data: photos,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: 'getBobbleheadPhotos' },
        operation: OPERATIONS.BOBBLEHEADS.GET_PHOTOS,
        userId,
      });
    }
  });
