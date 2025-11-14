import * as Sentry from '@sentry/nextjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IMAGE_DIMENSIONS } from '@/lib/seo/seo.constants';
import {
  extractFormatFromCloudinaryUrl,
  extractPublicIdFromCloudinaryUrl,
  generateOpenGraphImageUrl,
  generateSocialImageUrl,
  generateTwitterCardImageUrl,
} from '@/lib/utils/cloudinary.utils';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

// Mock environment variable
const MOCK_CLOUD_NAME = 'test-cloud';
const DEFAULT_SOCIAL_IMAGE = '/images/og-default.jpg';

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = MOCK_CLOUD_NAME;
});

describe('extractFormatFromCloudinaryUrl', () => {
  it('should extract jpg format from URL', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/photo.jpg';
    const result = extractFormatFromCloudinaryUrl(url);

    expect(result).toBe('jpg');
  });

  it('should extract png format from URL', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/photo.png';
    const result = extractFormatFromCloudinaryUrl(url);

    expect(result).toBe('png');
  });

  it('should extract webp format from URL', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/photo.webp';
    const result = extractFormatFromCloudinaryUrl(url);

    expect(result).toBe('webp');
  });

  it('should return jpg as default format when no extension found', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/photo';
    const result = extractFormatFromCloudinaryUrl(url);

    expect(result).toBe('jpg');
  });

  it('should handle URL with query parameters', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/photo.jpg?version=123';
    const result = extractFormatFromCloudinaryUrl(url);

    expect(result).toBe('jpg?version=123');
  });

  it('should handle errors gracefully and return jpg', () => {
    const invalidUrl = '';
    const result = extractFormatFromCloudinaryUrl(invalidUrl);

    expect(result).toBe('jpg');
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});

describe('extractPublicIdFromCloudinaryUrl', () => {
  it('should extract public ID from basic URL', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/users/abc/photo.jpg';
    const result = extractPublicIdFromCloudinaryUrl(url);

    expect(result).toBe('users/abc/photo');
  });

  it('should extract public ID from URL with transformations', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/c_fill,w_200/users/abc/photo.jpg';
    const result = extractPublicIdFromCloudinaryUrl(url);

    expect(result).toBe('users/abc/photo');
  });

  it('should extract public ID from URL with version', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/users/abc/photo.jpg';
    const result = extractPublicIdFromCloudinaryUrl(url);

    expect(result).toBe('users/abc/photo');
  });

  it('should extract public ID from URL with transformations and version', () => {
    const url =
      'https://res.cloudinary.com/demo/image/upload/c_fill,w_200,h_300/v1234567890/users/abc/photo.jpg';
    const result = extractPublicIdFromCloudinaryUrl(url);

    expect(result).toBe('users/abc/photo');
  });

  it('should extract public ID from URL with multiple transformation parameters', () => {
    const url =
      'https://res.cloudinary.com/demo/image/upload/c_fill,w_200,h_300,q_auto,f_auto/users/abc/photo.jpg';
    const result = extractPublicIdFromCloudinaryUrl(url);

    expect(result).toBe('users/abc/photo');
  });

  it('should handle public ID with folders', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/bobbleheads/sports/nba/michael-jordan.jpg';
    const result = extractPublicIdFromCloudinaryUrl(url);

    expect(result).toBe('bobbleheads/sports/nba/michael-jordan');
  });

  it('should handle public ID without folders', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/photo.jpg';
    const result = extractPublicIdFromCloudinaryUrl(url);

    expect(result).toBe('photo');
  });

  it('should return original URL when upload segment not found', () => {
    const url = 'https://example.com/image.jpg';
    const result = extractPublicIdFromCloudinaryUrl(url);

    expect(result).toBe(url);
  });

  it('should handle errors gracefully and return original URL', () => {
    const invalidUrl = 'invalid-url';
    const result = extractPublicIdFromCloudinaryUrl(invalidUrl);

    expect(result).toBe(invalidUrl);
    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it('should handle URL without file extension', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/users/abc/photo';
    const result = extractPublicIdFromCloudinaryUrl(url);

    expect(result).toBe('users/abc/photo');
  });
});

describe('generateOpenGraphImageUrl', () => {
  it('should generate Open Graph image URL with correct dimensions', () => {
    const publicId = 'bobbleheads/item-123';
    const result = generateOpenGraphImageUrl(publicId);

    const { height, width } = IMAGE_DIMENSIONS.openGraph;
    expect(result).toBe(
      `https://res.cloudinary.com/${MOCK_CLOUD_NAME}/image/upload/c_fill,w_${width},h_${height},f_auto,q_auto/${publicId}`,
    );
  });

  it('should include correct transformations', () => {
    const publicId = 'test/image';
    const result = generateOpenGraphImageUrl(publicId);

    expect(result).toContain('c_fill');
    expect(result).toContain('w_1200');
    expect(result).toContain('h_630');
    expect(result).toContain('f_auto');
    expect(result).toContain('q_auto');
  });

  it('should return default image when publicId is empty', () => {
    const result = generateOpenGraphImageUrl('');

    expect(result).toBe(DEFAULT_SOCIAL_IMAGE);
  });

  it('should return default image when publicId is undefined', () => {
    const result = generateOpenGraphImageUrl(undefined as any);

    expect(result).toBe(DEFAULT_SOCIAL_IMAGE);
  });

  it('should return default image when cloud name is not set', () => {
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const result = generateOpenGraphImageUrl('test/image');

    expect(result).toBe(DEFAULT_SOCIAL_IMAGE);
  });

  it('should handle errors gracefully and return default image', () => {
    const publicId = 'test/image';
    // Force an error by making the function throw
    vi.spyOn(global, 'String').mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const result = generateOpenGraphImageUrl(publicId);

    expect(result).toBe(DEFAULT_SOCIAL_IMAGE);
    expect(Sentry.captureException).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('should handle special characters in publicId', () => {
    const publicId = 'folder/image-name_123';
    const result = generateOpenGraphImageUrl(publicId);

    expect(result).toContain(publicId);
  });
});

describe('generateTwitterCardImageUrl', () => {
  it('should generate Twitter Card image URL with correct dimensions', () => {
    const publicId = 'bobbleheads/item-123';
    const result = generateTwitterCardImageUrl(publicId);

    const { height, width } = IMAGE_DIMENSIONS.twitter;
    expect(result).toBe(
      `https://res.cloudinary.com/${MOCK_CLOUD_NAME}/image/upload/c_fill,w_${width},h_${height},f_auto,q_auto/${publicId}`,
    );
  });

  it('should include correct transformations', () => {
    const publicId = 'test/image';
    const result = generateTwitterCardImageUrl(publicId);

    expect(result).toContain('c_fill');
    expect(result).toContain('w_800');
    expect(result).toContain('h_418');
    expect(result).toContain('f_auto');
    expect(result).toContain('q_auto');
  });

  it('should return default image when publicId is empty', () => {
    const result = generateTwitterCardImageUrl('');

    expect(result).toBe(DEFAULT_SOCIAL_IMAGE);
  });

  it('should return default image when publicId is undefined', () => {
    const result = generateTwitterCardImageUrl(undefined as any);

    expect(result).toBe(DEFAULT_SOCIAL_IMAGE);
  });

  it('should return default image when cloud name is not set', () => {
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const result = generateTwitterCardImageUrl('test/image');

    expect(result).toBe(DEFAULT_SOCIAL_IMAGE);
  });

  it('should handle errors gracefully and return default image', () => {
    const publicId = 'test/image';
    // Force an error
    vi.spyOn(global, 'String').mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const result = generateTwitterCardImageUrl(publicId);

    expect(result).toBe(DEFAULT_SOCIAL_IMAGE);
    expect(Sentry.captureException).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('should use different dimensions than Open Graph', () => {
    const publicId = 'test/image';
    const ogResult = generateOpenGraphImageUrl(publicId);
    const twitterResult = generateTwitterCardImageUrl(publicId);

    expect(ogResult).toContain('w_1200,h_630');
    expect(twitterResult).toContain('w_800,h_418');
    expect(ogResult).not.toBe(twitterResult);
  });
});

describe('generateSocialImageUrl', () => {
  it('should generate default platform image URL', () => {
    const publicId = 'test/image';
    const result = generateSocialImageUrl(publicId, 'default');

    const { height, width } = IMAGE_DIMENSIONS.default;
    expect(result).toContain(`w_${width},h_${height}`);
  });

  it('should generate Open Graph platform image URL', () => {
    const publicId = 'test/image';
    const result = generateSocialImageUrl(publicId, 'og');

    const { height, width } = IMAGE_DIMENSIONS.openGraph;
    expect(result).toContain(`w_${width},h_${height}`);
  });

  it('should generate Twitter platform image URL', () => {
    const publicId = 'test/image';
    const result = generateSocialImageUrl(publicId, 'twitter');

    const { height, width } = IMAGE_DIMENSIONS.twitter;
    expect(result).toContain(`w_${width},h_${height}`);
  });

  it('should use default platform when not specified', () => {
    const publicId = 'test/image';
    const result = generateSocialImageUrl(publicId);

    const { height, width } = IMAGE_DIMENSIONS.default;
    expect(result).toContain(`w_${width},h_${height}`);
  });

  it('should include standard transformations for all platforms', () => {
    const publicId = 'test/image';
    const platforms: Array<'default' | 'og' | 'twitter'> = ['default', 'og', 'twitter'];

    platforms.forEach((platform) => {
      const result = generateSocialImageUrl(publicId, platform);
      expect(result).toContain('c_fill');
      expect(result).toContain('f_auto');
      expect(result).toContain('q_auto');
    });
  });

  it('should return default image when publicId is empty', () => {
    const result = generateSocialImageUrl('', 'og');

    expect(result).toBe(DEFAULT_SOCIAL_IMAGE);
  });

  it('should return default image when publicId is undefined', () => {
    const result = generateSocialImageUrl(undefined as any, 'twitter');

    expect(result).toBe(DEFAULT_SOCIAL_IMAGE);
  });

  it('should return default image when cloud name is not set', () => {
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const result = generateSocialImageUrl('test/image', 'og');

    expect(result).toBe(DEFAULT_SOCIAL_IMAGE);
  });

  it('should handle errors gracefully and return default image', () => {
    const publicId = 'test/image';
    // Force an error
    vi.spyOn(global, 'String').mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const result = generateSocialImageUrl(publicId, 'og');

    expect(result).toBe(DEFAULT_SOCIAL_IMAGE);
    expect(Sentry.captureException).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('should generate different URLs for different platforms', () => {
    const publicId = 'test/image';
    const defaultUrl = generateSocialImageUrl(publicId, 'default');
    const ogUrl = generateSocialImageUrl(publicId, 'og');
    const twitterUrl = generateSocialImageUrl(publicId, 'twitter');

    // All should be different due to different dimensions
    expect(defaultUrl).not.toBe(ogUrl);
    expect(ogUrl).not.toBe(twitterUrl);
    expect(twitterUrl).not.toBe(defaultUrl);
  });

  it('should include publicId in the URL', () => {
    const publicId = 'bobbleheads/sports/nba/jordan';
    const result = generateSocialImageUrl(publicId, 'og');

    expect(result).toContain(publicId);
  });

  it('should match generateOpenGraphImageUrl output for og platform', () => {
    const publicId = 'test/image';
    const socialResult = generateSocialImageUrl(publicId, 'og');
    const ogResult = generateOpenGraphImageUrl(publicId);

    expect(socialResult).toBe(ogResult);
  });

  it('should match generateTwitterCardImageUrl output for twitter platform', () => {
    const publicId = 'test/image';
    const socialResult = generateSocialImageUrl(publicId, 'twitter');
    const twitterResult = generateTwitterCardImageUrl(publicId);

    expect(socialResult).toBe(twitterResult);
  });
});
