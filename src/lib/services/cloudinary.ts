import type { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

import { v2 as cloudinary } from 'cloudinary';

import { ActionError, ErrorType } from '@/lib/utils/errors';

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

export interface CloudinaryUploadOptions {
  bobbleheadId?: string;
  folder?: string;
  isPrimary?: boolean;
  publicId?: string;
  userId: string;
}

export interface CloudinaryUploadResult {
  metadata: PhotoMetadata;
  publicId: string;
  responsiveUrls: ResponsiveUrlSet;
}

export interface PhotoMetadata {
  altText?: string;
  caption?: string;
  fileSize: number;
  height: number;
  isPrimary: boolean;
  sortOrder: number;
  url: string;
  width: number;
}

export interface ResponsiveUrlSet {
  large: string;
  medium: string;
  original: string;
  thumbnail: string;
}

class CloudinaryError extends ActionError {
  constructor(message: string, originalError?: Error) {
    super(
      ErrorType.EXTERNAL_SERVICE,
      'CLOUDINARY_UPLOAD_FAILED',
      message,
      { originalError: originalError?.message },
      true,
      500,
      originalError,
    );
  }
}

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await cloudinary.uploader.destroy(publicId);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (result.result !== 'ok') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new CloudinaryError(`Failed to delete image: ${result.result}`);
    }
  } catch (error) {
    if (error instanceof CloudinaryError) {
      throw error;
    }
    throw new CloudinaryError('Failed to delete image from Cloudinary', error as Error);
  }
};

// generate signature for upload parameters
export const generateUploadSignature = (paramsToSign: Record<string, any>): string => {
  try {
    return cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);
  } catch (error) {
    throw new CloudinaryError('Failed to generate upload signature', error as Error);
  }
};

// generate signed upload URL for client-side uploads (if needed later)
export const generateSignedUploadUrl = (options: {
  folder: string;
  publicId?: string;
}): {
  signature: string;
  timestamp: number;
  uploadUrl: string;
} => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      folder: options.folder,
      timestamp,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      ...(options.publicId && { public_id: options.publicId }),
    };

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);

    return {
      signature,
      timestamp,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    };
  } catch (error) {
    throw new CloudinaryError('Failed to generate signed upload URL', error as Error);
  }
};

// get optimized URL with custom transformations
export const getOptimizedUrl = (publicId: string, transformations: Record<string, unknown> = {}): string => {
  const defaultTransformations = {
    format: 'auto',
    quality: 'auto',
  };

  return cloudinary.url(publicId, {
    ...defaultTransformations,
    ...transformations,
  });
};

// utility function to check if Cloudinary is properly configured
export const isCloudinaryConfigured = (): boolean => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// upload a single image
export const uploadImage = async (
  file: File,
  options: CloudinaryUploadOptions,
  sortOrder: number = 0,
): Promise<CloudinaryUploadResult> => {
  try {
    validateFile(file);

    const buffer = await fileToBuffer(file);
    const folderPath = generateFolderPath(options.userId, options.bobbleheadId);

    // generate a clean filename
    const fileName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
    const publicId = options.publicId || `${folderPath}/${fileName}_${Date.now()}`;

    // upload to Cloudinary with signed upload
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folderPath,
            public_id: publicId,
            resource_type: 'image',
            signed: true,
            unique_filename: true,
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          },
          (error: undefined | UploadApiErrorResponse, result: undefined | UploadApiResponse) => {
            if (error) {
              reject(new CloudinaryError('Failed to upload image to Cloudinary', error));
            } else if (result) {
              resolve(result);
            } else {
              reject(new CloudinaryError('Unknown error during image upload'));
            }
          },
        )
        .end(buffer);
    });

    // extract metadata and generate responsive URLs
    const metadata = extractMetadata(uploadResult, options, sortOrder);
    const responsiveUrls = generateResponsiveUrls(uploadResult.public_id);

    return {
      metadata,
      publicId: uploadResult.public_id,
      responsiveUrls,
    };
  } catch (error) {
    if (error instanceof CloudinaryError) {
      throw error;
    }
    throw new CloudinaryError('Unexpected error during image upload', error as Error);
  }
};

// upload multiple images
export const uploadMultipleImages = async (
  files: Array<File>,
  options: CloudinaryUploadOptions,
): Promise<Array<CloudinaryUploadResult>> => {
  const results: Array<CloudinaryUploadResult> = [];
  const errors: Array<Error> = [];

  if (!files || files.length === 0) return [];

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadImage(
        files[i]!,
        {
          ...options,
          isPrimary: i === 0 && options.isPrimary !== false, // the first image is primary by default
        },
        i,
      );
      results.push(result);
    } catch (error) {
      errors.push(error as Error);
      // continue with other uploads even if one fails
    }
  }

  if (errors.length === files.length) {
    throw new CloudinaryError(`All uploads failed. First error: ${errors[0]!.message}`, errors[0]);
  }

  if (errors.length > 0) {
    console.warn(`${errors.length} out of ${files.length} uploads failed`, errors);
  }

  return results;
};

// extract metadata from Cloudinary response
export const extractMetadata = (
  uploadResult: UploadApiResponse,
  options: CloudinaryUploadOptions,
  sortOrder: number = 0,
): PhotoMetadata => {
  return {
    fileSize: uploadResult.bytes,
    height: uploadResult.height,
    isPrimary: options.isPrimary ?? false,
    sortOrder,
    url: uploadResult.secure_url,
    width: uploadResult.width,
  };
};

// convert File to buffer for Cloudinary
export const fileToBuffer = async (file: File): Promise<Buffer> => {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

// generate folder path
export const generateFolderPath = (userId: string, bobbleheadId?: string): string => {
  const basePath = `bobbleheads/${userId}`;
  return bobbleheadId ? `${basePath}/${bobbleheadId}` : basePath;
};

// generate responsive URLs
export const generateResponsiveUrls = (publicId: string): ResponsiveUrlSet => {
  return {
    large: cloudinary.url(publicId, {
      crop: 'limit',
      format: 'auto',
      height: 800,
      quality: 'auto',
      width: 800,
    }),
    medium: cloudinary.url(publicId, {
      crop: 'limit',
      format: 'auto',
      height: 400,
      quality: 'auto',
      width: 400,
    }),
    original: cloudinary.url(publicId, {
      format: 'auto',
      quality: 'auto',
    }),
    thumbnail: cloudinary.url(publicId, {
      crop: 'fill',
      format: 'auto',
      gravity: 'face',
      height: 150,
      quality: 'auto',
      width: 150,
    }),
  };
};

export const validateFile = (file: File): void => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (!fileExtension || !ALLOWED_FORMATS.includes(fileExtension)) {
    throw new CloudinaryError(`Invalid file format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new CloudinaryError(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
  }
};
