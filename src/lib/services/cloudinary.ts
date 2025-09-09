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

// generate signature for upload parameters
export const generateUploadSignature = (paramsToSign: Record<string, unknown>): string => {
  try {
    return cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);
  } catch (error) {
    throw new CloudinaryError('Failed to generate upload signature', error as Error);
  }
};
