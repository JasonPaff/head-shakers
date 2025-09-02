/* eslint-disable react-snob/require-boolean-prefix-is */
import type { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

import { v2 as cloudinary } from 'cloudinary';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type CloudinaryUploadOptions,
  deleteImage,
  extractMetadata,
  fileToBuffer,
  generateFolderPath,
  generateResponsiveUrls,
  generateSignedUploadUrl,
  getOptimizedUrl,
  isCloudinaryConfigured,
  uploadImage,
  uploadMultipleImages,
  validateFile,
} from '@/lib/services/cloudinary';
import { ActionError, ErrorType } from '@/lib/utils/errors';

// mock the cloudinary module
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      destroy: vi.fn(),
      upload_stream: vi.fn(),
    },
    url: vi.fn(),
    utils: {
      api_sign_request: vi.fn(),
    },
  },
}));

describe('Cloudinary Service', () => {
  // test fixtures
  const mockFile = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' });
  const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
  const invalidTypeFile = new File(['test'], 'test.txt', { type: 'text/plain' });
  const invalidExtensionFile = new File(['test'], 'test.bmp', { type: 'image/bmp' });

  const mockUploadResponse: UploadApiResponse = {
    access_control: [],
    access_mode: 'public',
    asset_id: 'asset123',
    bytes: 152048,
    context: {},
    created_at: '2024-01-01T00:00:00Z',
    etag: 'abc123',
    format: 'jpg',
    height: 600,
    metadata: {},
    moderation: [],
    original_filename: 'test-image',
    pages: 1,
    placeholder: false,
    public_id: 'bobbleheads/user123/test_12345',
    resource_type: 'image',
    secure_url: 'https://res.cloudinary.com/test/image/upload/v1/test.jpg',
    signature: 'signature123',
    tags: [],
    type: 'upload',
    url: 'http://res.cloudinary.com/test/image/upload/v1/test.jpg',
    version: 1234567890,
    version_id: 'version123',
    width: 800,
  };

  const mockUploadError: UploadApiErrorResponse = {
    http_code: 400,
    message: 'Upload failed',
    name: 'Error',
  };

  const mockUploadOptions: CloudinaryUploadOptions = {
    bobbleheadId: 'bobblehead456',
    isPrimary: false,
    userId: 'user123',
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Set up environment variables
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-api-key';
    process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
    process.env.CLOUDINARY_UPLOAD_PRESET = 'test-preset';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    describe('isCloudinaryConfigured', () => {
      it('should return true when all environment variables are set', () => {
        expect(isCloudinaryConfigured()).toBe(true);
      });

      it('should return false when cloud name is missing', () => {
        delete process.env.CLOUDINARY_CLOUD_NAME;
        expect(isCloudinaryConfigured()).toBe(false);
      });

      it('should return false when API key is missing', () => {
        delete process.env.CLOUDINARY_API_KEY;
        expect(isCloudinaryConfigured()).toBe(false);
      });

      it('should return false when API secret is missing', () => {
        delete process.env.CLOUDINARY_API_SECRET;
        expect(isCloudinaryConfigured()).toBe(false);
      });
    });
  });

  describe('Utility Functions', () => {
    describe('validateFile', () => {
      it('should accept valid image files', () => {
        expect(() => validateFile(mockFile)).not.toThrow();

        const pngFile = new File(['test'], 'test.png', { type: 'image/png' });
        expect(() => validateFile(pngFile)).not.toThrow();

        const webpFile = new File(['test'], 'test.webp', { type: 'image/webp' });
        expect(() => validateFile(webpFile)).not.toThrow();
      });

      it('should reject files with invalid extensions', () => {
        expect(() => validateFile(invalidExtensionFile)).toThrow(ActionError);
        expect(() => validateFile(invalidExtensionFile)).toThrow(/Invalid file format/);
      });

      it('should reject files with invalid types', () => {
        expect(() => validateFile(invalidTypeFile)).toThrow(ActionError);
        expect(() => validateFile(invalidTypeFile)).toThrow(/Invalid file format/);
      });

      it('should reject files exceeding size limit', () => {
        expect(() => validateFile(largeFile)).toThrow(ActionError);
        expect(() => validateFile(largeFile)).toThrow(/File size exceeds 10MB limit/);
      });

      it('should handle files without extensions', () => {
        const noExtFile = new File(['test'], 'test', { type: 'image/jpeg' });
        expect(() => validateFile(noExtFile)).toThrow(/Invalid file format/);
      });
    });

    describe('fileToBuffer', () => {
      it('should convert File to Buffer', async () => {
        const buffer = await fileToBuffer(mockFile);
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.toString()).toBe('test content');
      });

      it('should handle empty files', async () => {
        const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
        const buffer = await fileToBuffer(emptyFile);
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBe(0);
      });
    });

    describe('generateFolderPath', () => {
      it('should generate path with user ID only', () => {
        const path = generateFolderPath('user123');
        expect(path).toBe('bobbleheads/user123');
      });

      it('should generate path with user ID and bobblehead ID', () => {
        const path = generateFolderPath('user123', 'bobblehead456');
        expect(path).toBe('bobbleheads/user123/bobblehead456');
      });

      it('should handle special characters in IDs', () => {
        const path = generateFolderPath('user-123_test', 'bobblehead.456');
        expect(path).toBe('bobbleheads/user-123_test/bobblehead.456');
      });
    });

    describe('extractMetadata', () => {
      it('should extract metadata from upload response', () => {
        const metadata = extractMetadata(mockUploadResponse, mockUploadOptions, 2);

        expect(metadata).toEqual({
          fileSize: 152048,
          height: 600,
          isPrimary: false,
          sortOrder: 2,
          url: 'https://res.cloudinary.com/test/image/upload/v1/test.jpg',
          width: 800,
        });
      });

      it('should handle isPrimary undefined as false', () => {
        const options = { ...mockUploadOptions, isPrimary: undefined };
        const metadata = extractMetadata(mockUploadResponse, options, 0);
        expect(metadata.isPrimary).toBe(false);
      });

      it('should use default sortOrder of 0', () => {
        const metadata = extractMetadata(mockUploadResponse, mockUploadOptions);
        expect(metadata.sortOrder).toBe(0);
      });
    });

    describe('generateResponsiveUrls', () => {
      it('should generate all responsive URL variants', () => {
        const publicId = 'test/image/123';
        vi.mocked(cloudinary.url).mockImplementation((id, options) => {
          const params = new URLSearchParams();
          const opts = options as Record<string, any>;
          if (opts?.width) params.set('w', opts.width.toString());
          if (opts?.height) params.set('h', opts.height.toString());
          if (opts?.crop) params.set('c', opts.crop);
          if (opts?.gravity) params.set('g', opts.gravity);
          return `https://res.cloudinary.com/${id}?${params.toString()}`;
        });

        const urls = generateResponsiveUrls(publicId);

        expect(urls).toHaveProperty('thumbnail');
        expect(urls).toHaveProperty('medium');
        expect(urls).toHaveProperty('large');
        expect(urls).toHaveProperty('original');

        expect(cloudinary.url).toHaveBeenCalledTimes(4);
        expect(cloudinary.url).toHaveBeenCalledWith(
          publicId,
          expect.objectContaining({
            crop: 'fill',
            gravity: 'face',
            height: 150,
            width: 150,
          }),
        );
      });
    });
  });

  describe('Upload Functions', () => {
    describe('uploadImage', () => {
      it('should successfully upload an image', async () => {
        const mockUploadStream = vi.fn().mockImplementation(() => ({
          end: vi.fn(() => {
            const callback = mockUploadStream.mock.calls[0]?.[1];
            if (callback) {
              callback(undefined, mockUploadResponse);
            }
          }),
        }));

        vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(mockUploadStream);
        vi.mocked(cloudinary.url).mockReturnValue('https://res.cloudinary.com/test/optimized.jpg');

        const result = await uploadImage(mockFile, mockUploadOptions, 1);

        expect(result).toBeDefined();
        expect(result.publicId).toBe(mockUploadResponse.public_id);
        expect(result.metadata).toBeDefined();
        expect(result.metadata.fileSize).toBe(152048);
        expect(result.metadata.sortOrder).toBe(1);
        expect(result.responsiveUrls).toBeDefined();

        expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
          expect.objectContaining({
            folder: 'bobbleheads/user123/bobblehead456',
            resource_type: 'image',
            signed: true,
            unique_filename: true,
            upload_preset: 'test-preset',
          }),
          expect.any(Function),
        );
      });

      it('should handle upload errors', async () => {
        const mockUploadStream = vi.fn().mockImplementation(() => ({
          end: vi.fn(() => {
            const callback = mockUploadStream.mock.calls[0]?.[1];
            if (callback) {
              callback(mockUploadError, undefined);
            }
          }),
        }));

        vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(mockUploadStream);

        await expect(uploadImage(mockFile, mockUploadOptions)).rejects.toThrow(
          'Failed to upload image to Cloudinary',
        );
      });

      it('should handle unknown errors', async () => {
        const mockUploadStream = vi.fn().mockImplementation(() => ({
          end: vi.fn(() => {
            const callback = mockUploadStream.mock.calls[0]?.[1];
            if (callback) {
              callback(undefined, undefined);
            }
          }),
        }));

        vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(mockUploadStream);

        await expect(uploadImage(mockFile, mockUploadOptions)).rejects.toThrow(
          'Unknown error during image upload',
        );
      });

      it('should reject invalid files before upload', async () => {
        await expect(uploadImage(invalidTypeFile, mockUploadOptions)).rejects.toThrow(/Invalid file format/);
        expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
      });

      it('should sanitize filename and generate unique public ID', async () => {
        const specialFile = new File(['test'], 'My Special File!@#.jpg', { type: 'image/jpeg' });
        const mockUploadStream = vi.fn().mockImplementation(() => ({
          end: vi.fn(() => {
            const callback = mockUploadStream.mock.calls[0]?.[1];
            if (callback) {
              callback(undefined, mockUploadResponse);
            }
          }),
        }));

        vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(mockUploadStream);
        vi.mocked(cloudinary.url).mockReturnValue('https://res.cloudinary.com/test/optimized.jpg');

        await uploadImage(specialFile, mockUploadOptions);

        const callArgs = vi.mocked(cloudinary.uploader.upload_stream).mock.calls[0]?.[0] as any;
        expect(callArgs?.public_id).toMatch(/bobbleheads\/user123\/bobblehead456\/My_Special_File____\d+$/);
      });

      it('should use custom public ID when provided', async () => {
        const optionsWithPublicId = { ...mockUploadOptions, publicId: 'custom-id' };
        const mockUploadStream = vi.fn().mockImplementation(() => ({
          end: vi.fn(() => {
            const callback = mockUploadStream.mock.calls[0]?.[1];
            if (callback) {
              callback(undefined, mockUploadResponse);
            }
          }),
        }));

        vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(mockUploadStream);
        vi.mocked(cloudinary.url).mockReturnValue('https://res.cloudinary.com/test/optimized.jpg');

        await uploadImage(mockFile, optionsWithPublicId);

        const callArgs = vi.mocked(cloudinary.uploader.upload_stream).mock.calls[0]?.[0] as any;
        expect(callArgs?.public_id).toBe('custom-id');
      });
    });

    describe('uploadMultipleImages', () => {
      it('should upload multiple images successfully', async () => {
        const files = [
          new File(['content1'], 'image1.jpg', { type: 'image/jpeg' }),
          new File(['content2'], 'image2.png', { type: 'image/png' }),
          new File(['content3'], 'image3.webp', { type: 'image/webp' }),
        ];

        const mockUploadStream = vi.fn().mockImplementation(() => ({
          end: vi.fn(() => {
            const callback = mockUploadStream.mock.calls[mockUploadStream.mock.calls.length - 1]?.[1];
            if (callback) {
              callback(undefined, mockUploadResponse);
            }
          }),
        }));

        vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(mockUploadStream);
        vi.mocked(cloudinary.url).mockReturnValue('https://res.cloudinary.com/test/optimized.jpg');

        const results = await uploadMultipleImages(files, mockUploadOptions);

        expect(results).toHaveLength(3);
        expect(cloudinary.uploader.upload_stream).toHaveBeenCalledTimes(3);

        // Check that first image is not marked as primary since mockUploadOptions.isPrimary is false
        expect(results[0]!.metadata.isPrimary).toBe(false);
        expect(results[1]!.metadata.isPrimary).toBe(false);
        expect(results[2]!.metadata.isPrimary).toBe(false);

        // Check sort order
        expect(results[0]?.metadata.sortOrder).toBe(0);
        expect(results[1]?.metadata.sortOrder).toBe(1);
        expect(results[2]?.metadata.sortOrder).toBe(2);
      });

      it('should handle partial failures and continue uploading', async () => {
        const files = [
          new File(['content1'], 'image1.jpg', { type: 'image/jpeg' }),
          invalidTypeFile, // This will fail
          new File(['content3'], 'image3.png', { type: 'image/png' }),
        ];

        const mockUploadStream = vi.fn().mockImplementation(() => ({
          end: vi.fn(() => {
            const callback = mockUploadStream.mock.calls[mockUploadStream.mock.calls.length - 1]?.[1];
            if (callback) {
              callback(undefined, mockUploadResponse);
            }
          }),
        }));

        vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(mockUploadStream);
        vi.mocked(cloudinary.url).mockReturnValue('https://res.cloudinary.com/test/optimized.jpg');

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const results = await uploadMultipleImages(files, mockUploadOptions);

        expect(results).toHaveLength(2); // Only 2 successful uploads
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('1 out of 3 uploads failed'),
          expect.any(Array),
        );

        consoleSpy.mockRestore();
      });

      it('should throw error if all uploads fail', async () => {
        const files = [invalidTypeFile, invalidExtensionFile];

        await expect(uploadMultipleImages(files, mockUploadOptions)).rejects.toThrow(/All uploads failed/);
      });

      it('should mark first image as primary by default when isPrimary not specified', async () => {
        const files = [
          new File(['content1'], 'image1.jpg', { type: 'image/jpeg' }),
          new File(['content2'], 'image2.png', { type: 'image/png' }),
        ];

        const optionsNoPrimarySet = { bobbleheadId: 'bobblehead456', userId: 'user123' };

        const mockUploadStream = vi.fn().mockImplementation(() => ({
          end: vi.fn(() => {
            const callback = mockUploadStream.mock.calls[mockUploadStream.mock.calls.length - 1]?.[1];
            if (callback) {
              callback(undefined, mockUploadResponse);
            }
          }),
        }));

        vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(mockUploadStream);
        vi.mocked(cloudinary.url).mockReturnValue('https://res.cloudinary.com/test/optimized.jpg');

        const results = await uploadMultipleImages(files, optionsNoPrimarySet);

        expect(results[0]?.metadata.isPrimary).toBe(true);
        expect(results[1]?.metadata.isPrimary).toBe(false);
      });

      it('should respect isPrimary option override', async () => {
        const files = [
          new File(['content1'], 'image1.jpg', { type: 'image/jpeg' }),
          new File(['content2'], 'image2.png', { type: 'image/png' }),
        ];

        const optionsNoPrimary = { ...mockUploadOptions, isPrimary: false };

        const mockUploadStream = vi.fn().mockImplementation(() => ({
          end: vi.fn(() => {
            const callback = mockUploadStream.mock.calls[mockUploadStream.mock.calls.length - 1]?.[1];
            if (callback) {
              callback(undefined, mockUploadResponse);
            }
          }),
        }));

        vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(mockUploadStream);
        vi.mocked(cloudinary.url).mockReturnValue('https://res.cloudinary.com/test/optimized.jpg');

        const results = await uploadMultipleImages(files, optionsNoPrimary);

        expect(results[0]?.metadata.isPrimary).toBe(false);
        expect(results[1]?.metadata.isPrimary).toBe(false);
      });

      it('should handle empty file array', async () => {
        const results = await uploadMultipleImages([], mockUploadOptions);
        expect(results).toEqual([]);
      });
    });
  });

  describe('Delete Functions', () => {
    describe('deleteImage', () => {
      it('should successfully delete an image', async () => {
        vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' } as any);

        await expect(deleteImage('test-public-id')).resolves.not.toThrow();
        expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test-public-id');
      });

      it('should throw error when deletion fails', async () => {
        vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'not found' } as any);

        await expect(deleteImage('non-existent-id')).rejects.toThrow(ActionError);
        await expect(deleteImage('non-existent-id')).rejects.toThrow('Failed to delete image: not found');
      });

      it('should handle network errors', async () => {
        const networkError = new Error('Network error');
        vi.mocked(cloudinary.uploader.destroy).mockRejectedValue(networkError);

        await expect(deleteImage('test-id')).rejects.toThrow(ActionError);
        await expect(deleteImage('test-id')).rejects.toThrow('Failed to delete image from Cloudinary');
      });

      it('should wrap non-ActionError errors in CloudinaryError', async () => {
        const genericError = new Error('Generic network error');
        vi.mocked(cloudinary.uploader.destroy).mockRejectedValue(genericError);

        await expect(deleteImage('test-id')).rejects.toThrow('Failed to delete image from Cloudinary');
        await expect(deleteImage('test-id')).rejects.toThrow(ActionError);
      });

      it('should handle special characters in public ID', async () => {
        vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({ result: 'ok' } as any);

        await deleteImage('folder/subfolder/image-123_test');
        expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('folder/subfolder/image-123_test');
      });
    });
  });

  describe('URL Generation', () => {
    describe('getOptimizedUrl', () => {
      it('should generate URL with default transformations', () => {
        vi.mocked(cloudinary.url).mockReturnValue('https://res.cloudinary.com/optimized.jpg');

        const url = getOptimizedUrl('test-public-id');

        expect(url).toBe('https://res.cloudinary.com/optimized.jpg');
        expect(cloudinary.url).toHaveBeenCalledWith('test-public-id', {
          format: 'auto',
          quality: 'auto',
        });
      });

      it('should merge custom transformations with defaults', () => {
        vi.mocked(cloudinary.url).mockReturnValue('https://res.cloudinary.com/custom.jpg');

        const url = getOptimizedUrl('test-public-id', {
          crop: 'fill',
          height: 300,
          width: 500,
        });

        expect(url).toBe('https://res.cloudinary.com/custom.jpg');
        expect(cloudinary.url).toHaveBeenCalledWith('test-public-id', {
          crop: 'fill',
          format: 'auto',
          height: 300,
          quality: 'auto',
          width: 500,
        });
      });

      it('should allow overriding default transformations', () => {
        vi.mocked(cloudinary.url).mockReturnValue('https://res.cloudinary.com/override.jpg');

        getOptimizedUrl('test-public-id', {
          format: 'jpg',
          quality: 80,
        });

        expect(cloudinary.url).toHaveBeenCalledWith('test-public-id', {
          format: 'jpg',
          quality: 80,
        });
      });
    });

    describe('generateSignedUploadUrl', () => {
      it('should generate signed upload URL with signature', () => {
        const mockSignature = 'abc123signature';
        vi.mocked(cloudinary.utils.api_sign_request).mockReturnValue(mockSignature);

        const result = generateSignedUploadUrl({
          folder: 'test-folder',
        });

        expect(result).toHaveProperty('signature', mockSignature);
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('uploadUrl');
        expect(result.uploadUrl).toBe('https://api.cloudinary.com/v1_1/test-cloud/image/upload');

        expect(cloudinary.utils.api_sign_request).toHaveBeenCalledWith(
          expect.objectContaining({
            folder: 'test-folder',
            upload_preset: 'test-preset',
          }),
          'test-api-secret',
        );
      });

      it('should include public ID when provided', () => {
        vi.mocked(cloudinary.utils.api_sign_request).mockReturnValue('signature');

        generateSignedUploadUrl({
          folder: 'test-folder',
          publicId: 'custom-public-id',
        });

        expect(cloudinary.utils.api_sign_request).toHaveBeenCalledWith(
          expect.objectContaining({
            folder: 'test-folder',
            public_id: 'custom-public-id',
            upload_preset: 'test-preset',
          }),
          'test-api-secret',
        );
      });

      it('should handle errors during signature generation', () => {
        const error = new Error('Signature generation failed');
        vi.mocked(cloudinary.utils.api_sign_request).mockImplementation(() => {
          throw error;
        });

        expect(() => generateSignedUploadUrl({ folder: 'test' })).toThrow(ActionError);
        expect(() => generateSignedUploadUrl({ folder: 'test' })).toThrow(
          'Failed to generate signed upload URL',
        );
      });

      it('should generate consistent timestamp', () => {
        vi.mocked(cloudinary.utils.api_sign_request).mockReturnValue('signature');

        const beforeTime = Math.round(Date.now() / 1000);
        const result = generateSignedUploadUrl({ folder: 'test' });
        const afterTime = Math.round(Date.now() / 1000);

        expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(result.timestamp).toBeLessThanOrEqual(afterTime);
      });
    });
  });

  describe('Error Handling', () => {
    it('should create CloudinaryError with correct properties', () => {
      const originalError = new Error('Original error');
      const error = new ActionError(
        ErrorType.EXTERNAL_SERVICE,
        'CLOUDINARY_UPLOAD_FAILED',
        'Custom message',
        { originalError: originalError.message },
        true,
        500,
        originalError,
      );

      expect(error).toBeInstanceOf(ActionError);
      expect(error.type).toBe(ErrorType.EXTERNAL_SERVICE);
      expect(error.code).toBe('CLOUDINARY_UPLOAD_FAILED');
      expect(error.message).toBe('Custom message');
      expect(error.context).toEqual({ originalError: 'Original error' });
      expect(error.isRecoverable).toBe(true);
      expect(error.statusCode).toBe(500);
    });
  });
});
