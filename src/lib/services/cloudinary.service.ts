/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument */
import { v2 as cloudinary } from 'cloudinary';

import type { CloudinaryPhoto } from '@/types/cloudinary.types';

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  secure: true,
});

export class CloudinaryService {
  /**
   * Clean up temporary photos that are older than specified hours
   * @param tempFolder - The temporary folder path
   * @param hoursOld - Delete photos older than this many hours (default: 24)
   */
  static async cleanupTempPhotos(tempFolder: string, hoursOld: number = 24): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hoursOld);

      // search for old assets in the temp folder
      const searchResult = await cloudinary.search
        .expression(`folder:${tempFolder} AND created_at<${cutoffDate.toISOString()}`)
        .max_results(100)
        .execute();

      if (searchResult.resources && searchResult.resources.length > 0) {
        // @ts-expect-error ignoring type issue from cloudinary
        const publicIds = searchResult.resources.map((resource: unknown) => resource.public_id);
        await CloudinaryService.deletePhotos(publicIds);
        console.log(`Cleaned up ${publicIds.length} old temporary photos`);
      }
    } catch (error) {
      console.error('Failed to cleanup temp photos:', error);
    }
  }

  /**
   * Delete photos from Cloudinary
   * @param publicIds - Array of Cloudinary public IDs to delete
   * @returns Success status for each deletion
   */
  static async deletePhotos(publicIds: string[]): Promise<Array<{ publicId: string; success: boolean }>> {
    const deletionResults = await Promise.all(
      publicIds.map(async (publicId) => {
        try {
          const result = await cloudinary.uploader.destroy(publicId, {
            invalidate: true,
            resource_type: 'image',
          });

          return {
            publicId,
            success: result.result === 'ok',
          };
        } catch (error) {
          console.error(`Failed to delete photo ${publicId}:`, error);
          return {
            publicId,
            success: false,
          };
        }
      }),
    );

    return deletionResults;
  }

  /**
   * Generate optimized URL for a Cloudinary image
   * @param publicId - The Cloudinary public ID
   * @param transformations - Transformation options
   * @returns Optimized URL
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
   * Move photos from temporary folder to permanent location
   * @param photos - Array of photos with their Cloudinary public IDs
   * @param targetFolder - The permanent folder path
   * @returns Updated photos with new public IDs and URLs
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

          // use cloudinary's rename API to move the asset
          const result = await cloudinary.uploader.rename(photo.publicId, newPublicId, {
            invalidate: true, // invalidate CDN cache
            overwrite: false, // don't overwrite if exists
            resource_type: 'image',
          });

          return {
            newPublicId: result.public_id,
            newUrl: result.secure_url,
            oldPublicId: photo.publicId,
          };
        } catch (error) {
          console.error(`Failed to move photo ${photo.publicId}:`, error);
          // if the move fails, return original values
          return {
            newPublicId: photo.publicId,
            newUrl: photo.url,
            oldPublicId: photo.publicId,
          };
        }
      }),
    );

    return movedPhotos;
  }
}
