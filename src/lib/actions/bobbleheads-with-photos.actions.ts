import * as Sentry from '@sentry/nextjs';
import { $path } from 'next-typesafe-url';
import { revalidatePath } from 'next/cache';
import z from 'zod';

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
import { BobbleheadService } from '@/lib/services/bobbleheads.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { createBobbleheadWithPhotosSchema } from '@/lib/validations/bobbleheads.validation';

// create the bobblehead with photos
export const createBobbleheadWithPhotosAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.CREATE,
    isTransactionRequired: true,
  })
  .use(createRateLimitMiddleware(5, 60))
  .inputSchema(
    createBobbleheadWithPhotosSchema.extend({
      photosMetadata: z
        .array(
          z.object({
            altText: z.string().optional(),
            caption: z.string().optional(),
            isPrimary: z.boolean().default(false),
            sortOrder: z.number().default(0),
          }),
        )
        .optional(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const { photos, photosMetadata, ...bobbleheadData } = parsedInput;
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
            file,
            id: `temp-${index}`,
            isPrimary: photosMetadata?.[index]?.isPrimary || index === 0,
            preview: '',
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
