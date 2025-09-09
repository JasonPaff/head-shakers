/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
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
