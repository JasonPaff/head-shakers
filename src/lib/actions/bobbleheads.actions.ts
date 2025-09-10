'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { $path } from 'next-typesafe-url';
import { revalidatePath } from 'next/cache';

import {
  ACTION_NAMES,
  CONFIG,
  ERROR_MESSAGES,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { createRateLimitMiddleware } from '@/lib/middleware/rate-limit.middleware';
import { CloudinaryService } from '@/lib/services/cloudinary.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import {
  createBobbleheadWithPhotosSchema,
  deleteBobbleheadSchema,
} from '@/lib/validations/bobbleheads.validation';

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
    const { photos, ...bobbleheadData } = createBobbleheadWithPhotosSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, bobbleheadData);

    try {
      const newBobblehead = await BobbleheadsFacade.createAsync(bobbleheadData, userId, ctx.tx);

      if (!newBobblehead) {
        throw new ActionError(
          ErrorType.INTERNAL,
          'BOBBLEHEAD_CREATE_FAILED',
          ERROR_MESSAGES.BOBBLEHEAD.CREATE_FAILED,
          { ctx, operation: 'create_bobblehead' },
          false,
          500,
        );
      }

      // if photos are provided, create database records for them
      let uploadedPhotos: Array<unknown> = [];
      if (photos && photos.length > 0) {
        try {
          // move photos from temp folder to permanent location in Cloudinary
          const permanentFolder = `users/${userId}/collections/${newBobblehead.collectionId}/bobbleheads/${newBobblehead.id}`;
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

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          bobblehead: newBobblehead,
          photosCount: uploadedPhotos.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Created bobblehead: ${newBobblehead.name} with ${uploadedPhotos.length} photos`,
      });

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
          'BOBBLEHEAD_DELETE_FAILED',
          ERROR_MESSAGES.BOBBLEHEAD.DELETE_FAILED,
          { ctx, operation: 'delete_bobblehead' },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          bobblehead: deletedBobblehead,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Deleted bobblehead: ${deletedBobblehead.name}`,
      });

      // TODO: if the bobblehead or its parent collection/subcollection is on
      //  the featured page then the featured page cache should be revalidated too

      revalidatePath(
        $path({
          route: '/dashboard/collection',
        }),
      );
      revalidatePath(
        $path({
          route: '/collections/[collectionId]',
          routeParams: { collectionId: deletedBobblehead.id },
        }),
      );

      if (deletedBobblehead.subcollectionId) {
        revalidatePath(
          $path({
            route: '/collections/[collectionId]',
            routeParams: { collectionId: deletedBobblehead.id },
          }),
        );
      }
      return {
        data: null,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.DELETE,
        },
        operation: 'delete_collection',
        userId: ctx.userId,
      });
    }
  });
