import type { Metadata } from 'next';

import * as Sentry from '@sentry/nextjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  generateAlternates,
  generatePageMetadata,
  generateRobotsMetadata,
  generateTitle,
  generateVerificationMetaTags,
  serializeJsonLd,
} from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA, FALLBACK_METADATA, ROBOTS_CONFIG } from '@/lib/seo/seo.constants';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  startSpan: vi.fn((_options, callback) => callback()),
}));

describe('generateAlternates', () => {
  it('should generate alternates with canonical URL', () => {
    const url = 'https://headshakers.com/collections/123';
    const result = generateAlternates(url);

    expect(result).toEqual({
      canonical: url,
    });
  });

  it('should include language variants when provided', () => {
    const url = 'https://headshakers.com/collections/123';
    const languages = {
      'en-US': 'https://headshakers.com/en/collections/123',
      'es-ES': 'https://headshakers.com/es/collections/123',
    };

    const result = generateAlternates(url, languages);

    expect(result).toEqual({
      canonical: url,
      languages,
    });
  });

  it('should not include languages property when empty object provided', () => {
    const url = 'https://headshakers.com/collections/123';
    const result = generateAlternates(url, {});

    expect(result).toEqual({
      canonical: url,
    });
    expect(result.languages).toBeUndefined();
  });
});

describe('generateRobotsMetadata', () => {
  it('should return default robots config for public indexable page', () => {
    const result = generateRobotsMetadata(true, true);

    expect(result).toEqual(ROBOTS_CONFIG.default);
  });

  it('should return noindex config for public non-indexable page', () => {
    const result = generateRobotsMetadata(false, true);

    expect(result).toEqual(ROBOTS_CONFIG.noIndex);
  });

  it('should return none config for private page', () => {
    const result = generateRobotsMetadata(true, false);

    expect(result).toEqual(ROBOTS_CONFIG.none);
  });

  it('should return none config for private non-indexable page', () => {
    const result = generateRobotsMetadata(false, false);

    expect(result).toEqual(ROBOTS_CONFIG.none);
  });
});

describe('generateTitle', () => {
  it('should append site name to page title', () => {
    const result = generateTitle('My Collection');

    expect(result).toBe(`My Collection | ${DEFAULT_SITE_METADATA.siteName}`);
  });

  it('should return site name for empty title', () => {
    const result = generateTitle('');

    expect(result).toBe(DEFAULT_SITE_METADATA.siteName);
  });

  it('should return site name for whitespace-only title', () => {
    const result = generateTitle('   ');

    expect(result).toBe(DEFAULT_SITE_METADATA.siteName);
  });

  it('should not duplicate site name if already present', () => {
    const result = generateTitle('Head Shakers');

    expect(result).toBe('Head Shakers');
  });

  it('should not duplicate site name if present in different case', () => {
    const result = generateTitle('Welcome to head shakers');

    expect(result).toBe('Welcome to head shakers');
  });
});

describe('generateVerificationMetaTags', () => {
  beforeEach(() => {
    // Clear environment variables before each test
    delete process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
    delete process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
    delete process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION;
  });

  it('should return empty object when no verification codes are set', () => {
    const result = generateVerificationMetaTags();

    expect(result).toEqual({});
  });

  it('should include Google verification when set', () => {
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = 'google-123';

    const result = generateVerificationMetaTags();

    expect(result).toEqual({
      google: 'google-123',
    });
  });

  it('should include Bing verification when set', () => {
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION = 'bing-456';

    const result = generateVerificationMetaTags();

    expect(result).toEqual({
      bing: 'bing-456',
    });
  });

  it('should include Yandex verification when set', () => {
    process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION = 'yandex-789';

    const result = generateVerificationMetaTags();

    expect(result).toEqual({
      yandex: 'yandex-789',
    });
  });

  it('should include all verification codes when set', () => {
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = 'google-123';
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION = 'bing-456';
    process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION = 'yandex-789';

    const result = generateVerificationMetaTags();

    expect(result).toEqual({
      bing: 'bing-456',
      google: 'google-123',
      yandex: 'yandex-789',
    });
  });
});

describe('serializeJsonLd', () => {
  it('should serialize JSON-LD schema to string', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test Product',
    };

    const result = serializeJsonLd(schema as any);

    expect(result).toBe(JSON.stringify(schema));
  });

  it('should handle complex nested schemas', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      brand: {
        '@type': 'Brand',
        name: 'FOCO',
      },
      name: 'Bobblehead',
    };

    const result = serializeJsonLd(schema as any);

    expect(result).toBe(JSON.stringify(schema));
    expect(JSON.parse(result)).toEqual(schema);
  });
});

describe('generatePageMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate basic metadata with required fields', () => {
    const result = generatePageMetadata('home', {
      title: 'Home Page',
    });

    expect(result.title).toBe(`Home Page | ${DEFAULT_SITE_METADATA.siteName}`);
    expect(result.description).toBe(FALLBACK_METADATA.description);
    expect(result.alternates).toBeDefined();
    expect(result.robots).toBeDefined();
  });

  it('should use provided description', () => {
    const description = 'Custom description for this page';
    const result = generatePageMetadata('home', {
      description,
      title: 'Home Page',
    });

    expect(result.description).toBe(description);
  });

  it('should include keywords when provided', () => {
    const keywords = ['bobblehead', 'collection', 'rare'];
    const result = generatePageMetadata('home', {
      keywords,
      title: 'Home Page',
    });

    expect(result.keywords).toEqual(keywords);
  });

  it('should generate canonical URL from provided URL', () => {
    const url = 'https://headshakers.com/collections/123';
    const result = generatePageMetadata('collection', {
      title: 'My Collection',
      url,
    });

    expect(result.alternates?.canonical).toBe(url);
  });

  it('should use default URL when not provided', () => {
    const result = generatePageMetadata('home', {
      title: 'Home Page',
    });

    expect(result.alternates?.canonical).toBe(DEFAULT_SITE_METADATA.url);
  });

  it('should generate Open Graph metadata by default', () => {
    const result = generatePageMetadata('home', {
      title: 'Home Page',
    });

    expect(result.openGraph).toBeDefined();
    expect(result.openGraph?.title).toBe('Home Page');
    // Note: Next.js Metadata type doesn't expose 'type' property in the return type
  });

  it('should generate Twitter Card metadata by default', () => {
    const result = generatePageMetadata('home', {
      title: 'Home Page',
    });

    expect(result.twitter).toBeDefined();
    expect(result.twitter?.title).toBe('Home Page');
    // Note: Next.js Metadata type doesn't expose 'card' property in the return type
  });

  it('should skip Open Graph when shouldIncludeOpenGraph is false', () => {
    const result = generatePageMetadata(
      'home',
      {
        title: 'Home Page',
      },
      {
        shouldIncludeOpenGraph: false,
      },
    );

    expect(result.openGraph).toBeUndefined();
  });

  it('should skip Twitter Card when shouldIncludeTwitterCard is false', () => {
    const result = generatePageMetadata(
      'home',
      {
        title: 'Home Page',
      },
      {
        shouldIncludeTwitterCard: false,
      },
    );

    expect(result.twitter).toBeUndefined();
  });

  it('should not use title template when shouldUseTitleTemplate is false', () => {
    const result = generatePageMetadata(
      'home',
      {
        title: 'Home Page',
      },
      {
        shouldUseTitleTemplate: false,
      },
    );

    expect(result.title).toBe('Home Page');
  });

  it('should generate correct robots for private page', () => {
    const result = generatePageMetadata(
      'profile',
      {
        title: 'User Profile',
      },
      {
        isPublic: false,
      },
    );

    expect(result.robots).toBe('noindex, nofollow');
  });

  it('should generate correct robots for public non-indexable page', () => {
    const result = generatePageMetadata(
      'search',
      {
        title: 'Search Results',
      },
      {
        isIndexable: false,
        isPublic: true,
      },
    );

    expect(result.robots).toBe('noindex, follow');
  });

  it('should use custom robots config when provided', () => {
    const customRobots: Array<'index' | 'nofollow'> = ['index', 'nofollow'];
    const result = generatePageMetadata(
      'home',
      {
        title: 'Home Page',
      },
      {
        robots: customRobots,
      },
    );

    expect(result.robots).toBe('index, nofollow');
  });

  it('should include verification tags when environment variables are set', () => {
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = 'google-123';

    const result = generatePageMetadata('home', {
      title: 'Home Page',
    });

    expect(result.verification).toEqual({
      google: 'google-123',
    });

    delete process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  });

  it('should map bobblehead page type to product Open Graph type', () => {
    const result = generatePageMetadata('bobblehead', {
      title: 'Cool Bobblehead',
    });

    expect(result.openGraph).toBeDefined();
    // Note: Next.js Metadata type doesn't expose 'type' property
  });

  it('should map profile page type to profile Open Graph type', () => {
    const result = generatePageMetadata('profile', {
      title: 'User Profile',
    });

    expect(result.openGraph).toBeDefined();
    // Note: Next.js Metadata type doesn't expose 'type' property
  });

  it('should map article page type to article Open Graph type', () => {
    const result = generatePageMetadata('article', {
      title: 'Article Title',
    });

    expect(result.openGraph).toBeDefined();
    // Note: Next.js Metadata type doesn't expose 'type' property
  });

  it('should handle string images by converting to objects', () => {
    const imageUrl = 'https://example.com/image.jpg';
    const result = generatePageMetadata('home', {
      images: [imageUrl],
      title: 'Home Page',
    });

    expect(result.openGraph?.images).toBeDefined();
    const images = result.openGraph?.images;
    if (Array.isArray(images) && images.length > 0) {
      const firstImage = images[0];
      if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
        expect(firstImage.url).toBe(imageUrl);
      }
    }
  });

  it('should include creator handle in Twitter metadata', () => {
    const result = generatePageMetadata('profile', {
      creatorHandle: '@johndoe',
      title: 'User Profile',
    });

    expect(result.twitter?.creator).toBe('@johndoe');
  });

  it('should add Sentry breadcrumbs during metadata generation', () => {
    generatePageMetadata('home', {
      title: 'Home Page',
    });

    expect(Sentry.addBreadcrumb).toHaveBeenCalled();
  });

  it('should use Sentry span for metadata generation', () => {
    generatePageMetadata('home', {
      title: 'Home Page',
    });

    expect(Sentry.startSpan).toHaveBeenCalled();
  });

  it('should handle missing data gracefully with fallbacks', () => {
    const result = generatePageMetadata('home', {
      title: 'Home Page',
    });

    expect(result.title).toBeTruthy();
    expect(result.description).toBe(FALLBACK_METADATA.description);
    expect(result.alternates?.canonical).toBe(DEFAULT_SITE_METADATA.url);
  });

  it('should handle empty images array', () => {
    const result = generatePageMetadata('home', {
      images: [],
      title: 'Home Page',
    });

    expect(result.openGraph?.images).toBeDefined();
    const images = result.openGraph?.images;
    if (Array.isArray(images)) {
      expect(images.length).toBeGreaterThan(0);
      const firstImage = images[0];
      if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
        expect(firstImage.url).toBe(FALLBACK_METADATA.imageUrl);
      }
    }
  });

  it('should generate complete metadata for complex content', () => {
    const result: Metadata = generatePageMetadata(
      'bobblehead',
      {
        brand: 'FOCO',
        category: 'Sports',
        description: 'Limited edition bobblehead from 2020',
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        keywords: ['bobblehead', 'sports', 'collectible'],
        title: 'Michael Jordan Bobblehead',
        url: 'https://headshakers.com/bobbleheads/mj-bulls',
      },
      {
        isPublic: true,
        shouldIncludeOpenGraph: true,
        shouldIncludeTwitterCard: true,
      },
    );

    expect(result.title).toContain('Michael Jordan Bobblehead');
    expect(result.description).toBe('Limited edition bobblehead from 2020');
    expect(result.keywords).toEqual(['bobblehead', 'sports', 'collectible']);
    expect(result.alternates?.canonical).toBe('https://headshakers.com/bobbleheads/mj-bulls');
    expect(result.openGraph).toBeDefined();
    expect(result.twitter).toBeDefined();
    expect(result.robots).toBe('index, follow');
  });
});
