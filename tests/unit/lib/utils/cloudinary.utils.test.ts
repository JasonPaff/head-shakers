import { describe, expect, it } from 'vitest';

import {
  extractFormatFromCloudinaryUrl,
  extractPublicIdFromCloudinaryUrl,
  generateBlurDataUrl,
  generateOpenGraphImageUrl,
  generateSocialImageUrl,
  generateTwitterCardImageUrl,
} from '@/lib/utils/cloudinary.utils';

describe('cloudinary utilities', () => {
  describe('extractPublicIdFromCloudinaryUrl', () => {
    it('should extract public ID from valid Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
      const result = extractPublicIdFromCloudinaryUrl(url);
      expect(result).toBe('sample');
    });

    it('should extract public ID from URL with folder path', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/users/abc/photo.jpg';
      const result = extractPublicIdFromCloudinaryUrl(url);
      expect(result).toBe('users/abc/photo');
    });

    it('should extract public ID from URL with version number', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/users/abc/photo.jpg';
      const result = extractPublicIdFromCloudinaryUrl(url);
      expect(result).toBe('users/abc/photo');
    });

    it('should extract public ID from URL with transformations', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/c_fill,w_200,h_200/users/abc/photo.jpg';
      const result = extractPublicIdFromCloudinaryUrl(url);
      expect(result).toBe('users/abc/photo');
    });

    it('should extract public ID from URL with both version and transformations', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/c_fill,w_200/users/abc/photo.jpg';
      const result = extractPublicIdFromCloudinaryUrl(url);
      expect(result).toBe('users/abc/photo');
    });

    it('should handle URL without file extension', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/users/abc/photo';
      const result = extractPublicIdFromCloudinaryUrl(url);
      expect(result).toBe('users/abc/photo');
    });

    it('should return original URL for non-Cloudinary URL', () => {
      const url = 'https://example.com/images/photo.jpg';
      const result = extractPublicIdFromCloudinaryUrl(url);
      expect(result).toBe(url);
    });

    it('should handle URL with dots in folder names', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/folder.with.dots/photo.jpg';
      const result = extractPublicIdFromCloudinaryUrl(url);
      expect(result).toBe('folder.with.dots/photo');
    });

    it('should handle multiple nested folders', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/bobbleheads/sports/baseball/item-123.jpg';
      const result = extractPublicIdFromCloudinaryUrl(url);
      expect(result).toBe('bobbleheads/sports/baseball/item-123');
    });

    it('should handle complex transformations with multiple parameters', () => {
      const url =
        'https://res.cloudinary.com/demo/image/upload/c_fill,w_200,h_300,q_auto,f_auto/bobbleheads/item.jpg';
      const result = extractPublicIdFromCloudinaryUrl(url);
      expect(result).toBe('bobbleheads/item');
    });
  });

  describe('generateBlurDataUrl', () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    it('should generate valid blur data URL for simple public ID', () => {
      if (!cloudName) {
        expect(generateBlurDataUrl('sample')).toBe('');
        return;
      }

      const result = generateBlurDataUrl('sample');
      expect(result).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_10,h_10,e_blur:1000,q_1,f_auto/sample`,
      );
    });

    it('should generate valid blur data URL for public ID with folder path', () => {
      if (!cloudName) {
        expect(generateBlurDataUrl('bobbleheads/item-123')).toBe('');
        return;
      }

      const result = generateBlurDataUrl('bobbleheads/item-123');
      expect(result).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_10,h_10,e_blur:1000,q_1,f_auto/bobbleheads/item-123`,
      );
    });

    it('should generate valid blur data URL for nested folder paths', () => {
      if (!cloudName) {
        expect(generateBlurDataUrl('users/abc/photo')).toBe('');
        return;
      }

      const result = generateBlurDataUrl('users/abc/photo');
      expect(result).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_10,h_10,e_blur:1000,q_1,f_auto/users/abc/photo`,
      );
    });

    it('should return empty string for empty public ID', () => {
      const result = generateBlurDataUrl('');
      expect(result).toBe('');
    });

    it('should return empty string when cloud name is not configured', () => {
      const originalCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const result = generateBlurDataUrl('sample');
      expect(result).toBe('');

      // Restore original value
      if (originalCloudName) {
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = originalCloudName;
      }
    });
  });

  describe('extractFormatFromCloudinaryUrl', () => {
    it('should extract jpg format from URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
      const result = extractFormatFromCloudinaryUrl(url);
      expect(result).toBe('jpg');
    });

    it('should extract png format from URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/sample.png';
      const result = extractFormatFromCloudinaryUrl(url);
      expect(result).toBe('png');
    });

    it('should extract webp format from URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/sample.webp';
      const result = extractFormatFromCloudinaryUrl(url);
      expect(result).toBe('webp');
    });

    it('should return jpg as default for URL without extension', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/sample';
      const result = extractFormatFromCloudinaryUrl(url);
      expect(result).toBe('jpg');
    });

    it('should handle URL with transformation parameters', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/c_fill,w_200/sample.png';
      const result = extractFormatFromCloudinaryUrl(url);
      expect(result).toBe('png');
    });
  });

  describe('generateOpenGraphImageUrl', () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    it('should generate valid Open Graph image URL', () => {
      if (!cloudName) {
        expect(generateOpenGraphImageUrl('sample')).toBe('/images/og-default.jpg');
        return;
      }

      const result = generateOpenGraphImageUrl('sample');
      expect(result).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_1200,h_630,f_auto,q_auto/sample`,
      );
    });

    it('should generate valid Open Graph image URL for public ID with folder path', () => {
      if (!cloudName) {
        expect(generateOpenGraphImageUrl('bobbleheads/item-123')).toBe('/images/og-default.jpg');
        return;
      }

      const result = generateOpenGraphImageUrl('bobbleheads/item-123');
      expect(result).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_1200,h_630,f_auto,q_auto/bobbleheads/item-123`,
      );
    });

    it('should return default social image for empty public ID', () => {
      const result = generateOpenGraphImageUrl('');
      expect(result).toBe('/images/og-default.jpg');
    });

    it('should return default social image when cloud name is not configured', () => {
      const originalCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const result = generateOpenGraphImageUrl('sample');
      expect(result).toBe('/images/og-default.jpg');

      // Restore original value
      if (originalCloudName) {
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = originalCloudName;
      }
    });
  });

  describe('generateTwitterCardImageUrl', () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    it('should generate valid Twitter card image URL', () => {
      if (!cloudName) {
        expect(generateTwitterCardImageUrl('sample')).toBe('/images/og-default.jpg');
        return;
      }

      const result = generateTwitterCardImageUrl('sample');
      expect(result).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_800,h_418,f_auto,q_auto/sample`,
      );
    });

    it('should generate valid Twitter card image URL for public ID with folder path', () => {
      if (!cloudName) {
        expect(generateTwitterCardImageUrl('bobbleheads/item-123')).toBe('/images/og-default.jpg');
        return;
      }

      const result = generateTwitterCardImageUrl('bobbleheads/item-123');
      expect(result).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_800,h_418,f_auto,q_auto/bobbleheads/item-123`,
      );
    });

    it('should return default social image for empty public ID', () => {
      const result = generateTwitterCardImageUrl('');
      expect(result).toBe('/images/og-default.jpg');
    });

    it('should return default social image when cloud name is not configured', () => {
      const originalCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const result = generateTwitterCardImageUrl('sample');
      expect(result).toBe('/images/og-default.jpg');

      // Restore original value
      if (originalCloudName) {
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = originalCloudName;
      }
    });
  });

  describe('generateSocialImageUrl', () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    it('should generate default platform image URL', () => {
      if (!cloudName) {
        expect(generateSocialImageUrl('sample', 'default')).toBe('/images/og-default.jpg');
        return;
      }

      const result = generateSocialImageUrl('sample', 'default');
      expect(result).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_1200,h_630,f_auto,q_auto/sample`,
      );
    });

    it('should generate Open Graph platform image URL', () => {
      if (!cloudName) {
        expect(generateSocialImageUrl('sample', 'og')).toBe('/images/og-default.jpg');
        return;
      }

      const result = generateSocialImageUrl('sample', 'og');
      expect(result).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_1200,h_630,f_auto,q_auto/sample`,
      );
    });

    it('should generate Twitter platform image URL', () => {
      if (!cloudName) {
        expect(generateSocialImageUrl('sample', 'twitter')).toBe('/images/og-default.jpg');
        return;
      }

      const result = generateSocialImageUrl('sample', 'twitter');
      expect(result).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_800,h_418,f_auto,q_auto/sample`,
      );
    });

    it('should use default platform when no platform is specified', () => {
      if (!cloudName) {
        expect(generateSocialImageUrl('sample')).toBe('/images/og-default.jpg');
        return;
      }

      const result = generateSocialImageUrl('sample');
      expect(result).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_1200,h_630,f_auto,q_auto/sample`,
      );
    });

    it('should return default social image for empty public ID', () => {
      const result = generateSocialImageUrl('', 'og');
      expect(result).toBe('/images/og-default.jpg');
    });

    it('should return default social image when cloud name is not configured', () => {
      const originalCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const result = generateSocialImageUrl('sample', 'og');
      expect(result).toBe('/images/og-default.jpg');

      // Restore original value
      if (originalCloudName) {
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = originalCloudName;
      }
    });

    it('should handle public ID with nested folder paths', () => {
      if (!cloudName) {
        expect(generateSocialImageUrl('users/abc/photo', 'twitter')).toBe('/images/og-default.jpg');
        return;
      }

      const result = generateSocialImageUrl('users/abc/photo', 'twitter');
      expect(result).toBe(
        `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_800,h_418,f_auto,q_auto/users/abc/photo`,
      );
    });
  });
});
