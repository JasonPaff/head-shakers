import type { JSX } from 'react';

import { describe, expect, it, vi } from 'vitest';

import HomePage, { generateMetadata } from '@/app/(app)/(home)/page';
import { ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from '@/lib/seo/seo.constants';

import { render, screen } from '../../setup/test-utils';

// Mock Redis client to prevent initialization error
vi.mock('@/lib/utils/redis-client', () => ({
  getRedisClient: vi.fn(() => ({
    del: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  })),
  RedisOperations: class {
    static del = vi.fn();
    static get = vi.fn();
    static set = vi.fn();
  },
}));

// Mock CacheService to prevent cache operations
vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    featured: {
      collections: vi.fn(),
      content: vi.fn(),
      featuredBobblehead: vi.fn(),
      trendingBobbleheads: vi.fn(),
    },
    invalidatePattern: vi.fn(),
  },
}));

// Mock getCurrentUserWithRole to prevent database access
vi.mock('@/lib/utils/admin.utils', () => ({
  getCurrentUserWithRole: vi.fn().mockResolvedValue(null),
}));

// Mock all section components
vi.mock('@/app/(app)/(home)/components/sections/hero-section', () => ({
  HeroSection: (): JSX.Element => <div data-testid={'hero-section-mock'}>Hero Section</div>,
}));

vi.mock('@/app/(app)/(home)/components/sections/featured-collections-section', () => ({
  FeaturedCollectionsSection: (): JSX.Element => (
    <div data-testid={'featured-collections-section-mock'}>Featured Collections Section</div>
  ),
}));

vi.mock('@/app/(app)/(home)/components/sections/trending-bobbleheads-section', () => ({
  TrendingBobbleheadsSection: (): JSX.Element => (
    <div data-testid={'trending-bobbleheads-section-mock'}>Trending Bobbleheads Section</div>
  ),
}));

vi.mock('@/app/(app)/(home)/components/sections/join-community-section', () => ({
  JoinCommunitySection: (): JSX.Element => (
    <div data-testid={'join-community-section-mock'}>Join Community Section</div>
  ),
}));

describe('HomePage', () => {
  describe('Page Composition', () => {
    it('should render all 4 sections', async () => {
      const Component = await HomePage();
      render(Component);

      const heroSection = screen.getByTestId('hero-section-mock');
      const featuredCollections = screen.getByTestId('featured-collections-section-mock');
      const trendingBobbleheads = screen.getByTestId('trending-bobbleheads-section-mock');
      const joinCommunity = screen.getByTestId('join-community-section-mock');

      expect(heroSection).toBeInTheDocument();
      expect(featuredCollections).toBeInTheDocument();
      expect(trendingBobbleheads).toBeInTheDocument();
      expect(joinCommunity).toBeInTheDocument();
    });
  });

  describe('JSON-LD Schema', () => {
    it('should include Organization schema with correct structure', () => {
      // Verify the ORGANIZATION_SCHEMA constant has the expected structure
      expect(ORGANIZATION_SCHEMA).toHaveProperty('@context', 'https://schema.org');
      expect(ORGANIZATION_SCHEMA).toHaveProperty('@type', 'Organization');
      expect(ORGANIZATION_SCHEMA).toHaveProperty('name');
      expect(ORGANIZATION_SCHEMA).toHaveProperty('url');
      expect(ORGANIZATION_SCHEMA).toHaveProperty('description');
      expect(ORGANIZATION_SCHEMA).toHaveProperty('logo');
    });

    it('should include WebSite schema with correct structure', () => {
      // Verify the WEBSITE_SCHEMA constant has the expected structure
      expect(WEBSITE_SCHEMA).toHaveProperty('@context', 'https://schema.org');
      expect(WEBSITE_SCHEMA).toHaveProperty('@type', 'WebSite');
      expect(WEBSITE_SCHEMA).toHaveProperty('name');
      expect(WEBSITE_SCHEMA).toHaveProperty('url');
      expect(WEBSITE_SCHEMA).toHaveProperty('description');
      expect(WEBSITE_SCHEMA).toHaveProperty('potentialAction');
    });

    it('should have WebSite schema with SearchAction', () => {
      expect(WEBSITE_SCHEMA).toHaveProperty('potentialAction');
      expect(WEBSITE_SCHEMA.potentialAction!).toHaveProperty('@type', 'SearchAction');
      expect(WEBSITE_SCHEMA.potentialAction!).toHaveProperty('target');
      expect(WEBSITE_SCHEMA.potentialAction!).toHaveProperty('query-input');
      expect(WEBSITE_SCHEMA.potentialAction!.target).toContain('/search');
    });

    it('should have valid Organization schema properties', () => {
      expect(typeof ORGANIZATION_SCHEMA.name).toBe('string');
      expect(typeof ORGANIZATION_SCHEMA.url).toBe('string');
      expect(typeof ORGANIZATION_SCHEMA.description).toBe('string');
      expect(typeof ORGANIZATION_SCHEMA.logo).toBe('string');
      expect(Array.isArray(ORGANIZATION_SCHEMA.sameAs)).toBe(true);
    });

    it('should have valid WebSite schema properties', () => {
      expect(typeof WEBSITE_SCHEMA.name).toBe('string');
      expect(typeof WEBSITE_SCHEMA.url).toBe('string');
      expect(typeof WEBSITE_SCHEMA.description).toBe('string');
      expect(WEBSITE_SCHEMA.name).toBeTruthy();
      expect(WEBSITE_SCHEMA.url).toBeTruthy();
    });
  });

  describe('Metadata Generation', () => {
    it('should return correct metadata object', () => {
      const metadata = generateMetadata();

      expect(metadata).toBeDefined();
      expect(metadata).toHaveProperty('title');
      expect(metadata.title).toBe('Home');
    });

    it('should generate metadata with description', () => {
      const metadata = generateMetadata();

      expect(metadata).toHaveProperty('description');
      expect(metadata.description).toBeDefined();
      expect(typeof metadata.description).toBe('string');
    });

    it('should generate metadata with Open Graph data', () => {
      const metadata = generateMetadata();

      expect(metadata).toHaveProperty('openGraph');
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph).toHaveProperty('title');
      expect(metadata.openGraph).toHaveProperty('description');
      expect(metadata.openGraph).toHaveProperty('type');
    });

    it('should generate metadata with Twitter Card data', () => {
      const metadata = generateMetadata();

      expect(metadata).toHaveProperty('twitter');
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter).toHaveProperty('title');
      expect(metadata.twitter).toHaveProperty('description');
      expect(metadata.twitter).toHaveProperty('card');
    });

    it('should generate metadata with canonical URL in alternates', () => {
      const metadata = generateMetadata();

      expect(metadata).toHaveProperty('alternates');
      expect(metadata.alternates).toBeDefined();
      expect(metadata.alternates).toHaveProperty('canonical');
      expect(typeof metadata.alternates?.canonical).toBe('string');
    });

    it('should generate metadata with robots directives', () => {
      const metadata = generateMetadata();

      expect(metadata).toHaveProperty('robots');
      expect(metadata.robots).toBeDefined();
      // Robots can be string or object
      expect(['string', 'object']).toContain(typeof metadata.robots);
    });

    it('should include Open Graph metadata for home page', () => {
      const metadata = generateMetadata();

      // Home page should have Open Graph metadata
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph).toHaveProperty('title');
      expect(metadata.openGraph).toHaveProperty('description');
    });
  });

  describe('Page Structure', () => {
    it('should have proper semantic structure with all sections', async () => {
      const Component = await HomePage();
      render(Component);

      // All sections should be rendered
      expect(screen.getByTestId('hero-section-mock')).toBeInTheDocument();
      expect(screen.getByTestId('featured-collections-section-mock')).toBeInTheDocument();
      expect(screen.getByTestId('trending-bobbleheads-section-mock')).toBeInTheDocument();
      expect(screen.getByTestId('join-community-section-mock')).toBeInTheDocument();
    });
  });
});
