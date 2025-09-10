/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */
import { v2 as cloudinary } from 'cloudinary';

import type { ServiceErrorContext } from '@/lib/utils/error-types';
import type { CloudinaryPhoto } from '@/types/cloudinary.types';

import { circuitBreakers } from '@/lib/utils/circuit-breaker-registry';
import { createServiceError } from '@/lib/utils/error-builders';
import { withServiceRetry } from '@/lib/utils/retry';

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  secure: true,
});

export class CloudinaryService {
  /**
   * delete photos from Cloudinary by extracting public IDs from URLs
   * @param urls - array of Cloudinary URLs to delete
   * @returns results of deletion operations including URL context
   */
  static async deletePhotosByUrls(
    urls: Array<string>,
  ): Promise<Array<{ error?: string; publicId: null | string; success: boolean; url: string }>> {
    if (urls.length === 0) {
      return [];
    }

    // extract public IDs from URLs
    const urlToPublicIdMap = new Map<string, string>();
    const validPublicIds: Array<string> = [];

    for (const url of urls) {
      const publicId = this.extractPublicIdFromUrl(url);
      if (publicId) {
        urlToPublicIdMap.set(publicId, url);
        validPublicIds.push(publicId);
      }
    }

    if (validPublicIds.length === 0) {
      return urls.map((url) => ({
        error: 'Could not extract public ID from URL',
        publicId: null,
        success: false,
        url,
      }));
    }

    // delete the photos
    const deletionResults = await this.deletePhotosFromCloudinary(validPublicIds);

    // map results back to URLs
    const urlResults = urls.map((url) => {
      const publicId = this.extractPublicIdFromUrl(url);
      if (!publicId) {
        return {
          error: 'Could not extract public ID from URL',
          publicId: null,
          success: false,
          url,
        };
      }

      const deletionResult = deletionResults.find((r) => r.publicId === publicId);
      return {
        error: deletionResult?.error,
        publicId,
        success: deletionResult?.success || false,
        url,
      };
    });

    return urlResults;
  }

  /**
   * delete multiple photos from Cloudinary by their public IDs
   * @param publicIds - array of Cloudinary public IDs to delete
   * @returns results of deletion operations
   */
  static async deletePhotosFromCloudinary(
    publicIds: Array<string>,
  ): Promise<Array<{ error?: string; publicId: string; success: boolean }>> {
    if (publicIds.length === 0) {
      return [];
    }

    const circuitBreaker = circuitBreakers.externalService('cloudinary-delete');
    
    try {
      const result = await circuitBreaker.execute(async () => {
        // use Cloudinary's batch delete API with retry logic
        const retryResult = await withServiceRetry(
          () => cloudinary.api.delete_resources(publicIds, {
            resource_type: 'image',
          }),
          'cloudinary',
          {
            maxAttempts: 3,
            operationName: 'cloudinary-batch-delete'
          }
        );
        
        return retryResult.result;
      });

      // transform the result to our expected format
      return publicIds.map((publicId) => {
        const deletionResult = result.result.deleted?.[publicId];
        const wasSuccessful = deletionResult === 'deleted';

        return {
          error: wasSuccessful ? undefined : `Failed to delete: ${deletionResult || 'unknown error'}`,
          publicId,
          success: wasSuccessful,
        };
      });
    } catch (error) {
      console.error('Batch delete from Cloudinary failed:', error);

      // return failure for all public IDs
      return publicIds.map((publicId) => ({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        publicId,
        success: false,
      }));
    }
  }

  /**
   * extract Cloudinary public ID from a Cloudinary URL
   * @param url - the Cloudinary secure URL
   * @returns the public ID or null if extraction fails
   */
  static extractPublicIdFromUrl(url: string): null | string {
    try {
      // cloudinary URLs follow the pattern: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
      const urlPattern = /\/image\/upload\/(?:v\d+\/)?(?:[^/]+\/)*([^/.]+(?:\/[^/.]+)*)/;
      const match = url.match(urlPattern);
      return match?.[1] || null;
    } catch (error) {
      console.error(`Failed to extract public ID from URL ${url}:`, error);
      return null;
    }
  }

  /**
   * generate optimized URL for a Cloudinary image
   * @param publicId - the Cloudinary public ID
   * @param transformations - transformation options
   * @returns optimized URL
   */
  static getOptimizedUrl(
    publicId: string,
    transformations: {
      crop?: string;
      format?: string;
      gravity?: string;
      height?: number;
      quality?: string;
      width?: number;
    } = {},
  ): string {
    return cloudinary.url(publicId, {
      crop: transformations.crop || 'fill',
      format: transformations.format || 'auto',
      gravity: transformations.gravity || 'auto',
      height: transformations.height || 800,
      quality: transformations.quality || 'auto:good',
      secure: true,
      width: transformations.width || 800,
    });
  }

  /**
   * move photos from temporary folder to permanent location
   * @param photos - array of photos with their Cloudinary public IDs
   * @param targetFolder - the permanent folder path
   * @returns updated photos with new public IDs and URLs
   */
  static async movePhotosToPermFolder(
    photos: Array<Pick<CloudinaryPhoto, 'publicId' | 'url'>>,
    targetFolder: string,
  ): Promise<Array<{ newPublicId: string; newUrl: string; oldPublicId: string }>> {
    const movedPhotos = await Promise.all(
      photos.map(async (photo) => {
        try {
          // extract the filename from the current public ID
          const filename = photo.publicId.split('/').pop() || `photo-${Date.now()}`;
          const newPublicId = `${targetFolder}/${filename}`;

          const circuitBreaker = circuitBreakers.upload('cloudinary-rename');
          
          const result = await circuitBreaker.execute(async () => {
            // use cloudinary's rename API with retry logic
            const retryResult = await withServiceRetry(
              () => cloudinary.uploader.rename(photo.publicId, newPublicId, {
                invalidate: true, // invalidate CDN cache
                overwrite: false, // don't overwrite if exists
                resource_type: 'image',
              }),
              'cloudinary',
              {
                maxAttempts: 3,
                operationName: 'cloudinary-rename'
              }
            );
            
            return retryResult.result;
          });

          return {
            newPublicId: result.result.public_id,
            newUrl: result.result.secure_url,
            oldPublicId: photo.publicId,
          };
        } catch (error) {
          const context: ServiceErrorContext = {
            endpoint: 'rename',
            isRetryable: true,
            method: 'movePhotosToPermFolder',
            operation: 'movePhoto',
            service: 'cloudinary',
          };
          throw createServiceError(context, error);
        }
      }),
    );

    return movedPhotos;
  }
}
