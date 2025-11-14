/**
 * Cloudinary-related type definitions for photo uploads and management
 */
import type { CloudinaryUploadWidgetResults } from 'next-cloudinary';

// our internal photo representation from Cloudinary data
export interface CloudinaryPhoto {
  altText?: string;
  blobUrl?: string; // local blob URL for optimistic preview
  bytes: number;
  // user-defined metadata
  caption?: string;
  format: string;
  height: number;
  id: string; // temporary ID for frontend use (temp-{timestamp}-{random}) or UUID for persisted
  isPrimary: boolean;
  isUploading?: boolean; // optimistic upload state
  originalFilename: string;
  publicId: string; // cloudinary public_id
  sortOrder: number;
  uploadedAt: string;
  uploadError?: string; // error message if upload failed
  uploadProgress?: number; // upload progress percentage (0-100)
  url: string; // secure_url from Cloudinary
  width: number;
}

// individual file upload tracking
export interface FileUploadProgress {
  bytesUploaded: number;
  error?: string;
  filename: string;
  isComplete: boolean;
  isFailed: boolean;
  retryCount: number;
  startTime: number;
  totalBytes: number;
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
  fileProgress: Map<string, FileUploadProgress>;
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

// re-export type guards for convenience
export { isPersistedPhoto, isTempPhoto } from '@/lib/utils/photo-transform.utils';
