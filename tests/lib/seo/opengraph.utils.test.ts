import { describe, expect, it } from 'vitest';

import {
  generateBaseMetadata,
  generateOpenGraphMetadata,
  generateTwitterCardMetadata,
} from '@/lib/seo/opengraph.utils';
import { CHARACTER_LIMITS, DEFAULT_SITE_METADATA, IMAGE_DIMENSIONS } from '@/lib/seo/seo.constants';

describe('generateBaseMetadata', () => {
  it('should return title and description', () => {
    const result = generateBaseMetadata('Test Title', 'Test Description');

    expect(result).toEqual({
      description: 'Test Description',
      title: 'Test Title',
    });
  });

  it('should use default description when empty string provided', () => {
    const result = generateBaseMetadata('Test Title', '');

    expect(result.title).toBe('Test Title');
    expect(result.description).toBe(DEFAULT_SITE_METADATA.description);
  });

  it('should use default title when empty string provided', () => {
    const result = generateBaseMetadata('', 'Test Description');

    expect(result.title).toBe(DEFAULT_SITE_METADATA.title);
    expect(result.description).toBe('Test Description');
  });

  it('should use both defaults when both empty', () => {
    const result = generateBaseMetadata('', '');

    expect(result.title).toBe(DEFAULT_SITE_METADATA.title);
    expect(result.description).toBe(DEFAULT_SITE_METADATA.description);
  });
});

describe('generateOpenGraphMetadata', () => {
  const baseOptions = {
    description: 'Test description',
    title: 'Test Title',
    url: 'https://headshakers.com/test',
  };

  it('should generate basic Open Graph metadata', () => {
    const result = generateOpenGraphMetadata(baseOptions);

    expect(result).toMatchObject({
      description: 'Test description',
      locale: DEFAULT_SITE_METADATA.locale,
      siteName: DEFAULT_SITE_METADATA.siteName,
      title: 'Test Title',
      type: DEFAULT_SITE_METADATA.ogType,
      url: 'https://headshakers.com/test',
    });
  });

  it('should truncate title to character limit with ellipsis', () => {
    const longTitle = 'A'.repeat(CHARACTER_LIMITS.ogTitle + 10);
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      title: longTitle,
    });

    expect(result.title.length).toBe(CHARACTER_LIMITS.ogTitle);
    expect(result.title).toMatch(/\.\.\.$/);
  });

  it('should truncate description to character limit with ellipsis', () => {
    const longDescription = 'B'.repeat(CHARACTER_LIMITS.ogDescription + 10);
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      description: longDescription,
    });

    expect(result.description.length).toBe(CHARACTER_LIMITS.ogDescription);
    expect(result.description).toMatch(/\.\.\.$/);
  });

  it('should not truncate title when within limit', () => {
    const normalTitle = 'Normal Length Title';
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      title: normalTitle,
    });

    expect(result.title).toBe(normalTitle);
  });

  it('should not truncate description when within limit', () => {
    const normalDescription = 'Normal length description for testing';
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      description: normalDescription,
    });

    expect(result.description).toBe(normalDescription);
  });

  it('should include custom locale when provided', () => {
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      locale: 'es_ES',
    });

    expect(result.locale).toBe('es_ES');
  });

  it('should include custom siteName when provided', () => {
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      siteName: 'Custom Site',
    });

    expect(result.siteName).toBe('Custom Site');
  });

  it('should set type to website by default', () => {
    const result = generateOpenGraphMetadata(baseOptions);

    expect(result.type).toBe('website');
  });

  it('should set custom type when provided', () => {
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      type: 'article',
    });

    expect(result.type).toBe('article');
  });

  it('should handle product type', () => {
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      type: 'product',
    });

    expect(result.type).toBe('product');
  });

  it('should handle profile type', () => {
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      type: 'profile',
    });

    expect(result.type).toBe('profile');
  });

  it('should format images with default dimensions when not provided', () => {
    const images = [{ url: 'https://example.com/image.jpg' }];
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      images,
    });

    expect(result.images).toHaveLength(1);
    expect(result.images[0]).toMatchObject({
      height: IMAGE_DIMENSIONS.openGraph.height,
      type: 'image/jpeg',
      url: 'https://example.com/image.jpg',
      width: IMAGE_DIMENSIONS.openGraph.width,
    });
  });

  it('should preserve custom image dimensions', () => {
    const images = [
      {
        height: 800,
        url: 'https://example.com/image.jpg',
        width: 1600,
      },
    ];
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      images,
    });

    expect(result.images[0]?.width).toBe(1600);
    expect(result.images[0]?.height).toBe(800);
  });

  it('should use title as alt text when not provided', () => {
    const images = [{ url: 'https://example.com/image.jpg' }];
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      images,
      title: 'Test Title',
    });

    expect(result.images[0]?.alt).toBe('Test Title');
  });

  it('should use truncated title as alt text for long titles', () => {
    const longTitle = 'A'.repeat(CHARACTER_LIMITS.ogTitle + 10);
    const images = [{ url: 'https://example.com/image.jpg' }];
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      images,
      title: longTitle,
    });

    expect(result.images[0]?.alt).toBe(result.title);
    expect(result.images[0]?.alt?.length).toBe(CHARACTER_LIMITS.ogTitle);
  });

  it('should preserve custom alt text', () => {
    const images = [
      {
        alt: 'Custom alt text',
        url: 'https://example.com/image.jpg',
      },
    ];
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      images,
    });

    expect(result.images[0]?.alt).toBe('Custom alt text');
  });

  it('should preserve custom image type', () => {
    const images = [
      {
        type: 'image/png',
        url: 'https://example.com/image.png',
      },
    ];
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      images,
    });

    expect(result.images[0]?.type).toBe('image/png');
  });

  it('should handle multiple images', () => {
    const images = [
      { url: 'https://example.com/image1.jpg' },
      { url: 'https://example.com/image2.jpg' },
      { url: 'https://example.com/image3.jpg' },
    ];
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      images,
    });

    expect(result.images).toHaveLength(3);
    expect(result.images.map((img) => img.url)).toEqual([
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg',
    ]);
  });

  it('should handle empty images array', () => {
    const result = generateOpenGraphMetadata({
      ...baseOptions,
      images: [],
    });

    expect(result.images).toEqual([]);
  });
});

describe('generateTwitterCardMetadata', () => {
  const baseOptions = {
    description: 'Test description',
    title: 'Test Title',
  };

  it('should generate basic Twitter Card metadata', () => {
    const result = generateTwitterCardMetadata(baseOptions);

    expect(result).toMatchObject({
      card: DEFAULT_SITE_METADATA.twitterCard,
      description: 'Test description',
      site: DEFAULT_SITE_METADATA.twitterHandle,
      title: 'Test Title',
    });
  });

  it('should truncate title to character limit with ellipsis', () => {
    const longTitle = 'A'.repeat(CHARACTER_LIMITS.twitterTitle + 10);
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      title: longTitle,
    });

    expect(result.title.length).toBe(CHARACTER_LIMITS.twitterTitle);
    expect(result.title).toMatch(/\.\.\.$/);
  });

  it('should truncate description to character limit with ellipsis', () => {
    const longDescription = 'B'.repeat(CHARACTER_LIMITS.twitterDescription + 10);
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      description: longDescription,
    });

    expect(result.description.length).toBe(CHARACTER_LIMITS.twitterDescription);
    expect(result.description).toMatch(/\.\.\.$/);
  });

  it('should not truncate title when within limit', () => {
    const normalTitle = 'Normal Length Title';
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      title: normalTitle,
    });

    expect(result.title).toBe(normalTitle);
  });

  it('should not truncate description when within limit', () => {
    const normalDescription = 'Normal length description for testing';
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      description: normalDescription,
    });

    expect(result.description).toBe(normalDescription);
  });

  it('should include custom card type when provided', () => {
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      card: 'summary',
    });

    expect(result.card).toBe('summary');
  });

  it('should support app card type', () => {
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      card: 'app',
    });

    expect(result.card).toBe('app');
  });

  it('should support player card type', () => {
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      card: 'player',
    });

    expect(result.card).toBe('player');
  });

  it('should include custom site handle when provided', () => {
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      site: '@customhandle',
    });

    expect(result.site).toBe('@customhandle');
  });

  it('should include creator handle when provided', () => {
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      creator: '@johndoe',
    });

    expect(result.creator).toBe('@johndoe');
  });

  it('should not include creator when not provided', () => {
    const result = generateTwitterCardMetadata(baseOptions);

    expect(result.creator).toBeUndefined();
  });

  it('should format images with alt text', () => {
    const images = [{ url: 'https://example.com/image.jpg' }];
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      images,
    });

    expect(result.images).toHaveLength(1);
    expect(result.images?.[0]).toMatchObject({
      alt: 'Test Title',
      url: 'https://example.com/image.jpg',
    });
  });

  it('should use title as alt text when not provided', () => {
    const images = [{ url: 'https://example.com/image.jpg' }];
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      images,
      title: 'Custom Title',
    });

    expect(result.images?.[0]?.alt).toBe('Custom Title');
  });

  it('should use truncated title as alt text for long titles', () => {
    const longTitle = 'A'.repeat(CHARACTER_LIMITS.twitterTitle + 10);
    const images = [{ url: 'https://example.com/image.jpg' }];
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      images,
      title: longTitle,
    });

    expect(result.images?.[0]?.alt).toBe(result.title);
    const altText = result.images?.[0]?.alt;
    if (altText) {
      expect(altText.length).toBe(CHARACTER_LIMITS.twitterTitle);
    }
  });

  it('should preserve custom alt text', () => {
    const images = [
      {
        alt: 'Custom alt text',
        url: 'https://example.com/image.jpg',
      },
    ];
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      images,
    });

    expect(result.images?.[0]?.alt).toBe('Custom alt text');
  });

  it('should handle multiple images', () => {
    const images = [
      { url: 'https://example.com/image1.jpg' },
      { url: 'https://example.com/image2.jpg' },
      { url: 'https://example.com/image3.jpg' },
    ];
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      images,
    });

    expect(result.images).toHaveLength(3);
    expect(result.images?.map((img) => img.url)).toEqual([
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg',
    ]);
  });

  it('should not include images property when empty array provided', () => {
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      images: [],
    });

    expect(result.images).toBeUndefined();
  });

  it('should handle images with proper type checking', () => {
    const images = [{ url: 'https://example.com/image.jpg' }];
    const result = generateTwitterCardMetadata({
      ...baseOptions,
      images,
    });

    expect(result.images).toBeDefined();
    if (result.images && Array.isArray(result.images)) {
      expect(result.images[0]?.url).toBe('https://example.com/image.jpg');
    }
  });

  it('should handle undefined images', () => {
    const result = generateTwitterCardMetadata(baseOptions);

    expect(result.images).toBeUndefined();
  });
});
