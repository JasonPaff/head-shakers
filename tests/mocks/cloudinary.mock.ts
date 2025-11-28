/**
 * Cloudinary utilities mock for testing
 * Mocks all Cloudinary utility functions for image display tests
 */

import { vi } from 'vitest';

/**
 * Sets up mocks for all Cloudinary utility functions
 *
 * Usage:
 * ```typescript
 * import { mockCloudinaryUtils } from 'tests/mocks/cloudinary.mock';
 *
 * beforeEach(() => {
 *   mockCloudinaryUtils();
 * });
 * ```
 */
export const mockCloudinaryUtils = () => {
  vi.mock('@/lib/utils/cloudinary.utils', () => ({
    extractFormatFromCloudinaryUrl: vi.fn((url: string) => {
      const parts = url.split('.');
      return parts.length > 1 ? parts[parts.length - 1] : 'jpg';
    }),

    extractPublicIdFromCloudinaryUrl: vi.fn((url: string) => {
      if (!url) return url;
      // Return a simple mock public ID based on the URL
      return url.includes('/') ?
          url
            .split('/')
            .pop()
            ?.replace(/\.[^.]+$/, '') || 'mock-public-id'
        : 'mock-public-id';
    }),

    generateBlurDataUrl: vi.fn((publicId: string) => {
      if (!publicId) return '';
      return `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAKAAoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==`;
    }),

    generateOpenGraphImageUrl: vi.fn((publicId: string) => {
      if (!publicId) return '/images/og-default.jpg';
      return `https://res.cloudinary.com/mock-cloud/image/upload/c_fill,w_1200,h_630,f_auto,q_auto/${publicId}`;
    }),

    generateSocialImageUrl: vi.fn((publicId: string, platform: 'default' | 'og' | 'twitter' = 'default') => {
      if (!publicId) return '/images/og-default.jpg';

      const dimensions = {
        default: { height: 630, width: 1200 },
        og: { height: 630, width: 1200 },
        twitter: { height: 418, width: 800 },
      };

      const { height, width } = dimensions[platform];
      return `https://res.cloudinary.com/mock-cloud/image/upload/c_fill,w_${width},h_${height},f_auto,q_auto/${publicId}`;
    }),

    generateTwitterCardImageUrl: vi.fn((publicId: string) => {
      if (!publicId) return '/images/og-default.jpg';
      return `https://res.cloudinary.com/mock-cloud/image/upload/c_fill,w_800,h_418,f_auto,q_auto/${publicId}`;
    }),
  }));
};

/**
 * Returns typed mock implementations for direct use in tests
 * Useful when you need to access the mocked functions directly
 *
 * Usage:
 * ```typescript
 * import { getMockedCloudinaryUtils } from 'tests/mocks/cloudinary.mock';
 *
 * const { extractPublicIdFromCloudinaryUrl } = getMockedCloudinaryUtils();
 * expect(extractPublicIdFromCloudinaryUrl).toHaveBeenCalledWith('https://...');
 * ```
 */
export const getMockedCloudinaryUtils = async () => {
  const cloudinaryUtils = vi.mocked(await import('@/lib/utils/cloudinary.utils')) as {
    extractFormatFromCloudinaryUrl: ReturnType<typeof vi.fn>;
    extractPublicIdFromCloudinaryUrl: ReturnType<typeof vi.fn>;
    generateBlurDataUrl: ReturnType<typeof vi.fn>;
    generateOpenGraphImageUrl: ReturnType<typeof vi.fn>;
    generateSocialImageUrl: ReturnType<typeof vi.fn>;
    generateTwitterCardImageUrl: ReturnType<typeof vi.fn>;
  };

  return cloudinaryUtils;
};
