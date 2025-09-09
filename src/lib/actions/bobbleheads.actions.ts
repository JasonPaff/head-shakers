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
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads-facade';
import { createRateLimitMiddleware } from '@/lib/middleware/rate-limit.middleware';
import { CloudinaryService } from '@/lib/services/cloudinary.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { createBobbleheadWithPhotosSchema } from '@/lib/validations/bobbleheads.validation';

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
      // first create the bobblehead
      const newBobblehead = await BobbleheadsFacade.createAsync(bobbleheadData, userId, ctx.tx);

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
