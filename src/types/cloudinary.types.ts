/**
 * Cloudinary-related type definitions for photo uploads and management
 */
import type { CloudinaryUploadWidgetResults } from 'next-cloudinary';

// error types for upload failures
export interface CloudinaryError {
  http_code?: number;
  message: string;
  name: string;
}

// our internal photo representation from Cloudinary data
export interface CloudinaryPhoto {
  altText?: string;
  bytes: number;
  // user-defined metadata
  caption?: string;
  format: string;
  height: number;
  id: string; // temporary ID for frontend use
  isPrimary: boolean;
  originalFilename: string;
  publicId: string; // cloudinary public_id
  sortOrder: number;
  uploadedAt: string;
  url: string; // secure_url from Cloudinary
  width: number;
}

// photo metadata that users can edit
export interface PhotoMetadata {
  altText?: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
}

// upload state for UI feedback
export interface PhotoUploadState {
  error?: string;
  isUploading: boolean;
  progress?: number;
  totalCount: number;
  uploadedCount: number;
}

// transform CloudinaryUploadResult to our internal format
export function transformCloudinaryResult(
  result: CloudinaryUploadWidgetResults,
  metadata: Partial<PhotoMetadata> = {},
): CloudinaryPhoto {
  if (!result?.info || typeof result?.info === 'string') {
    throw new Error('Invalid Cloudinary upload result');
  }

  return {
    altText: metadata.altText || '',
    bytes: result.info.bytes,
    caption: metadata.caption || '',
    format: result.info.format,
    height: result.info.height,
    id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    isPrimary: metadata.isPrimary || false,
    originalFilename: result.info.original_filename,
    publicId: result.info.public_id,
    sortOrder: metadata.sortOrder || 0,
    uploadedAt: result.info.created_at,
    url: result.info.secure_url,
    width: result.info.width,
  };
}
