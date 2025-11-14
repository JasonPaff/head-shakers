import { describe, expect, it } from 'vitest';

import type {
  BreadcrumbNavItem,
  GenerateCollectionPageSchemaParams,
  GeneratePersonSchemaParams,
  GenerateProductSchemaParams,
} from '@/lib/seo/jsonld.utils';

import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  generateOrganizationSchema,
  generatePersonSchema,
  generateProductSchema,
} from '@/lib/seo/jsonld.utils';
import { DEFAULT_SITE_METADATA } from '@/lib/seo/seo.constants';

describe('generateBreadcrumbSchema', () => {
  it('should generate breadcrumb schema with single item', () => {
    const items: Array<BreadcrumbNavItem> = [{ name: 'Home', url: 'https://headshakers.com' }];

    const result = generateBreadcrumbSchema(items);

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          item: 'https://headshakers.com',
          name: 'Home',
          position: 1,
        },
      ],
    });
  });

  it('should generate breadcrumb schema with multiple items', () => {
    const items: Array<BreadcrumbNavItem> = [
      { name: 'Home', url: 'https://headshakers.com' },
      { name: 'Collections', url: 'https://headshakers.com/collections' },
      { name: 'Sports', url: 'https://headshakers.com/collections/sports' },
    ];

    const result = generateBreadcrumbSchema(items);

    expect(result.itemListElement).toHaveLength(3);
    expect(result.itemListElement[0]?.position).toBe(1);
    expect(result.itemListElement[1]?.position).toBe(2);
    expect(result.itemListElement[2]?.position).toBe(3);
  });

  it('should handle last item without URL', () => {
    const items: Array<BreadcrumbNavItem> = [
      { name: 'Home', url: 'https://headshakers.com' },
      { name: 'Collections', url: 'https://headshakers.com/collections' },
      { name: 'Current Page' },
    ];

    const result = generateBreadcrumbSchema(items);

    expect(result.itemListElement[2]).toEqual({
      '@type': 'ListItem',
      name: 'Current Page',
      position: 3,
    });
    expect(result.itemListElement[2]?.item).toBeUndefined();
  });

  it('should have correct schema.org context and type', () => {
    const items: Array<BreadcrumbNavItem> = [{ name: 'Home', url: 'https://headshakers.com' }];

    const result = generateBreadcrumbSchema(items);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('BreadcrumbList');
  });

  it('should increment position correctly', () => {
    const items: Array<BreadcrumbNavItem> = [
      { name: 'One', url: '/one' },
      { name: 'Two', url: '/two' },
      { name: 'Three', url: '/three' },
      { name: 'Four', url: '/four' },
      { name: 'Five', url: '/five' },
    ];

    const result = generateBreadcrumbSchema(items);

    result.itemListElement.forEach((item, index) => {
      expect(item.position).toBe(index + 1);
    });
  });
});

describe('generateCollectionPageSchema', () => {
  it('should generate basic collection page schema', () => {
    const params: GenerateCollectionPageSchemaParams = {
      name: 'Sports Bobbleheads',
      url: 'https://headshakers.com/collections/sports',
    };

    const result = generateCollectionPageSchema(params);

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Sports Bobbleheads',
      url: 'https://headshakers.com/collections/sports',
    });
  });

  it('should include description when provided', () => {
    const params: GenerateCollectionPageSchemaParams = {
      description: 'My collection of sports-themed bobbleheads',
      name: 'Sports Bobbleheads',
      url: 'https://headshakers.com/collections/sports',
    };

    const result = generateCollectionPageSchema(params);

    expect(result.description).toBe('My collection of sports-themed bobbleheads');
  });

  it('should not include description when not provided', () => {
    const params: GenerateCollectionPageSchemaParams = {
      name: 'Sports Bobbleheads',
      url: 'https://headshakers.com/collections/sports',
    };

    const result = generateCollectionPageSchema(params);

    expect(result.description).toBeUndefined();
  });

  it('should have correct schema.org context and type', () => {
    const params: GenerateCollectionPageSchemaParams = {
      name: 'Test Collection',
      url: 'https://headshakers.com/collections/test',
    };

    const result = generateCollectionPageSchema(params);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('CollectionPage');
  });

  it('should handle items count in description (not in schema)', () => {
    const params: GenerateCollectionPageSchemaParams = {
      itemsCount: 42,
      name: 'Sports Bobbleheads',
      url: 'https://headshakers.com/collections/sports',
    };

    const result = generateCollectionPageSchema(params);

    // itemsCount is accepted by params but not used in schema
    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Sports Bobbleheads',
      url: 'https://headshakers.com/collections/sports',
    });
  });
});

describe('generateOrganizationSchema', () => {
  it('should generate organization schema with default values', () => {
    const result = generateOrganizationSchema();

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      description: DEFAULT_SITE_METADATA.description,
      logo: `${DEFAULT_SITE_METADATA.url}/images/logo.png`,
      name: DEFAULT_SITE_METADATA.siteName,
      sameAs: [],
      url: DEFAULT_SITE_METADATA.url,
    });
  });

  it('should have correct schema.org context and type', () => {
    const result = generateOrganizationSchema();

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Organization');
  });

  it('should include site name from constants', () => {
    const result = generateOrganizationSchema();

    expect(result.name).toBe(DEFAULT_SITE_METADATA.siteName);
  });

  it('should include site description from constants', () => {
    const result = generateOrganizationSchema();

    expect(result.description).toBe(DEFAULT_SITE_METADATA.description);
  });

  it('should include logo URL', () => {
    const result = generateOrganizationSchema();

    expect(result.logo).toBe(`${DEFAULT_SITE_METADATA.url}/images/logo.png`);
  });

  it('should include site URL from constants', () => {
    const result = generateOrganizationSchema();

    expect(result.url).toBe(DEFAULT_SITE_METADATA.url);
  });

  it('should include sameAs array for social profiles', () => {
    const result = generateOrganizationSchema();

    expect(result.sameAs).toBeDefined();
    expect(Array.isArray(result.sameAs)).toBe(true);
  });
});

describe('generatePersonSchema', () => {
  it('should generate basic person schema with required fields', () => {
    const params: GeneratePersonSchemaParams = {
      name: 'John Collector',
      userId: 'user-123',
    };

    const result = generatePersonSchema(params);

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'John Collector',
    });
  });

  it('should include description when provided', () => {
    const params: GeneratePersonSchemaParams = {
      description: 'Bobblehead enthusiast since 2010',
      name: 'John Collector',
      userId: 'user-123',
    };

    const result = generatePersonSchema(params);

    expect(result.description).toBe('Bobblehead enthusiast since 2010');
  });

  it('should include image when provided', () => {
    const params: GeneratePersonSchemaParams = {
      image: 'https://example.com/john.jpg',
      name: 'John Collector',
      userId: 'user-123',
    };

    const result = generatePersonSchema(params);

    expect(result.image).toBe('https://example.com/john.jpg');
  });

  it('should include URL when provided', () => {
    const params: GeneratePersonSchemaParams = {
      name: 'John Collector',
      url: 'https://headshakers.com/collectors/john',
      userId: 'user-123',
    };

    const result = generatePersonSchema(params);

    expect(result.url).toBe('https://headshakers.com/collectors/john');
  });

  it('should include sameAs when provided', () => {
    const params: GeneratePersonSchemaParams = {
      name: 'John Collector',
      sameAs: ['https://twitter.com/johncollector', 'https://instagram.com/johncollector'],
      userId: 'user-123',
    };

    const result = generatePersonSchema(params);

    expect(result.sameAs).toEqual([
      'https://twitter.com/johncollector',
      'https://instagram.com/johncollector',
    ]);
  });

  it('should not include optional fields when not provided', () => {
    const params: GeneratePersonSchemaParams = {
      name: 'John Collector',
      userId: 'user-123',
    };

    const result = generatePersonSchema(params);

    expect(result.description).toBeUndefined();
    expect(result.image).toBeUndefined();
    expect(result.url).toBeUndefined();
    expect(result.sameAs).toBeUndefined();
  });

  it('should not include sameAs when empty array provided', () => {
    const params: GeneratePersonSchemaParams = {
      name: 'John Collector',
      sameAs: [],
      userId: 'user-123',
    };

    const result = generatePersonSchema(params);

    expect(result.sameAs).toBeUndefined();
  });

  it('should have correct schema.org context and type', () => {
    const params: GeneratePersonSchemaParams = {
      name: 'John Collector',
      userId: 'user-123',
    };

    const result = generatePersonSchema(params);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Person');
  });

  it('should generate complete person schema with all fields', () => {
    const params: GeneratePersonSchemaParams = {
      description: 'Avid collector of sports bobbleheads',
      image: 'https://example.com/john.jpg',
      name: 'John Collector',
      sameAs: ['https://twitter.com/johncollector'],
      url: 'https://headshakers.com/collectors/john',
      userId: 'user-123',
    };

    const result = generatePersonSchema(params);

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      description: 'Avid collector of sports bobbleheads',
      image: 'https://example.com/john.jpg',
      name: 'John Collector',
      sameAs: ['https://twitter.com/johncollector'],
      url: 'https://headshakers.com/collectors/john',
    });
  });
});

describe('generateProductSchema', () => {
  it('should generate basic product schema with required fields', () => {
    const params: GenerateProductSchemaParams = {
      name: 'Michael Jordan Bobblehead',
    };

    const result = generateProductSchema(params);

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Michael Jordan Bobblehead',
    });
  });

  it('should include description when provided', () => {
    const params: GenerateProductSchemaParams = {
      description: 'Limited edition bobblehead from 2020',
      name: 'Michael Jordan Bobblehead',
    };

    const result = generateProductSchema(params);

    expect(result.description).toBe('Limited edition bobblehead from 2020');
  });

  it('should include single image when provided as string', () => {
    const params: GenerateProductSchemaParams = {
      image: 'https://example.com/mj.jpg',
      name: 'Michael Jordan Bobblehead',
    };

    const result = generateProductSchema(params);

    expect(result.image).toBe('https://example.com/mj.jpg');
  });

  it('should include multiple images when provided as array', () => {
    const params: GenerateProductSchemaParams = {
      image: ['https://example.com/mj1.jpg', 'https://example.com/mj2.jpg'],
      name: 'Michael Jordan Bobblehead',
    };

    const result = generateProductSchema(params);

    expect(result.image).toEqual(['https://example.com/mj1.jpg', 'https://example.com/mj2.jpg']);
  });

  it('should include category when provided', () => {
    const params: GenerateProductSchemaParams = {
      category: 'Sports',
      name: 'Michael Jordan Bobblehead',
    };

    const result = generateProductSchema(params);

    expect(result.category).toBe('Sports');
  });

  it('should include brand as structured object when provided', () => {
    const params: GenerateProductSchemaParams = {
      brand: 'FOCO',
      name: 'Michael Jordan Bobblehead',
    };

    const result = generateProductSchema(params);

    expect(result.brand).toEqual({
      '@type': 'Brand',
      name: 'FOCO',
    });
  });

  it('should not include optional fields when not provided', () => {
    const params: GenerateProductSchemaParams = {
      name: 'Michael Jordan Bobblehead',
    };

    const result = generateProductSchema(params);

    expect(result.description).toBeUndefined();
    expect(result.image).toBeUndefined();
    expect(result.category).toBeUndefined();
    expect(result.brand).toBeUndefined();
  });

  it('should have correct schema.org context and type', () => {
    const params: GenerateProductSchemaParams = {
      name: 'Michael Jordan Bobblehead',
    };

    const result = generateProductSchema(params);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Product');
  });

  it('should generate complete product schema with all fields', () => {
    const params: GenerateProductSchemaParams = {
      brand: 'FOCO',
      category: 'Sports',
      dateCreated: '2020-01-15',
      description: 'Limited edition Chicago Bulls bobblehead from 2020',
      image: ['https://example.com/mj1.jpg', 'https://example.com/mj2.jpg'],
      name: 'Michael Jordan Bulls Bobblehead',
    };

    const result = generateProductSchema(params);

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      brand: {
        '@type': 'Brand',
        name: 'FOCO',
      },
      category: 'Sports',
      description: 'Limited edition Chicago Bulls bobblehead from 2020',
      image: ['https://example.com/mj1.jpg', 'https://example.com/mj2.jpg'],
      name: 'Michael Jordan Bulls Bobblehead',
    });
  });

  it('should handle dateCreated parameter without including it in schema', () => {
    const params: GenerateProductSchemaParams = {
      dateCreated: '2020-01-15',
      name: 'Michael Jordan Bobblehead',
    };

    const result = generateProductSchema(params);

    // dateCreated is accepted by params but not currently used in schema output
    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Michael Jordan Bobblehead',
    });
  });
});
