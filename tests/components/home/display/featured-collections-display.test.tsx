import type { JSX } from 'react';

import { describe, expect, it, vi } from 'vitest';

import type { FeaturedCollection } from '@/app/(app)/(home)/components/display/featured-collections-display';

import { FeaturedCollectionsDisplay } from '@/app/(app)/(home)/components/display/featured-collections-display';
import { CLOUDINARY_PATHS } from '@/lib/constants/cloudinary-paths';

import { render, screen } from '../../../setup/test-utils';

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>): JSX.Element => (
    <img alt={String(props.alt)} data-testid={String(props['data-testid'])} src={String(props.src)} />
  ),
}));

// Mock next-cloudinary
vi.mock('next-cloudinary', () => ({
  CldImage: (props: Record<string, unknown>): JSX.Element => (
    <img
      alt={String(props.alt)}
      data-public-id={String(props.src)}
      data-testid={String(props['data-testid'])}
    />
  ),
}));

// Mock next-typesafe-url
vi.mock('next-typesafe-url', () => ({
  $path: vi.fn(({ route, routeParams }: { route: string; routeParams?: Record<string, string> }): string => {
    if (route === '/browse') return '/browse';
    if (routeParams?.collectionSlug) {
      return `/collections/${routeParams.collectionSlug}`;
    }
    return route;
  }),
}));

// Mock cloudinary utils
vi.mock('@/lib/utils/cloudinary.utils', () => ({
  extractPublicIdFromCloudinaryUrl: vi.fn((url: null | string): string => {
    if (!url || url === '/placeholder.jpg') return '';
    return 'mock-public-id';
  }),
  generateBlurDataUrl: vi.fn((publicId: null | string | undefined): string | undefined => {
    if (!publicId) return undefined;
    return 'data:image/jpeg;base64,mockblurdata';
  }),
}));

describe('FeaturedCollectionsDisplay', () => {
  const mockCollections: Array<FeaturedCollection> = [
    {
      comments: 12,
      contentId: 'collection-1',
      contentSlug: 'vintage-baseball',
      description: 'My vintage baseball collection',
      id: 'col-1',
      imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/collection1.jpg',
      isLiked: true,
      isTrending: true,
      likeId: 'like-1',
      likes: 234,
      ownerAvatarUrl: 'https://example.com/avatar1.jpg',
      ownerDisplayName: 'collector1',
      title: 'Vintage Baseball Collection',
      totalItems: 45,
      totalValue: 12500,
      viewCount: 1543,
    },
    {
      comments: 8,
      contentId: 'collection-2',
      contentSlug: 'movie-stars',
      description: 'Hollywood legends collection',
      id: 'col-2',
      imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/collection2.jpg',
      isLiked: false,
      isTrending: false,
      likeId: null,
      likes: 156,
      ownerAvatarUrl: null,
      ownerDisplayName: 'collector2',
      title: 'Movie Stars',
      totalItems: 28,
      totalValue: 8900,
      viewCount: 987,
    },
    {
      comments: 5,
      contentId: 'collection-3',
      contentSlug: 'sports-heroes',
      description: 'Sports bobblehead collection',
      id: 'col-3',
      imageUrl: null,
      isLiked: false,
      isTrending: false,
      likeId: null,
      likes: 89,
      ownerAvatarUrl: 'https://example.com/avatar3.jpg',
      ownerDisplayName: 'collector3',
      title: 'Sports Heroes',
      totalItems: 15,
      totalValue: 4500,
      viewCount: 432,
    },
  ];

  it('should render collection grid with all collections', () => {
    render(<FeaturedCollectionsDisplay collections={mockCollections} />);

    // Check all collection titles are rendered
    expect(screen.getByText('Vintage Baseball Collection')).toBeInTheDocument();
    expect(screen.getByText('Movie Stars')).toBeInTheDocument();
    expect(screen.getByText('Sports Heroes')).toBeInTheDocument();
  });

  it('should show empty state when no collections', () => {
    render(<FeaturedCollectionsDisplay collections={[]} />);

    expect(screen.getByText('No featured collections available at this time.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse all collections/i })).toBeInTheDocument();
  });

  it('should display owner avatar and info', () => {
    render(<FeaturedCollectionsDisplay collections={mockCollections} />);

    // Check owner display names with @ prefix
    expect(screen.getByText('@collector1')).toBeInTheDocument();
    expect(screen.getByText('@collector2')).toBeInTheDocument();
    expect(screen.getByText('@collector3')).toBeInTheDocument();

    // Check item counts
    expect(screen.getByText('45 items')).toBeInTheDocument();
    expect(screen.getByText('28 items')).toBeInTheDocument();
    expect(screen.getByText('15 items')).toBeInTheDocument();
  });

  it('should show like status for each collection', () => {
    render(<FeaturedCollectionsDisplay collections={mockCollections} />);

    // Check like counts are displayed
    expect(screen.getByText('234')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();
  });

  it('should display trending badge when isTrending is true', () => {
    render(<FeaturedCollectionsDisplay collections={mockCollections} />);

    // Only first collection is trending
    expect(screen.getByText('Trending')).toBeInTheDocument();
  });

  it('should not display trending badge when isTrending is false', () => {
    const nonTrendingCollections = mockCollections.map((col) => ({ ...col, isTrending: false }));
    render(<FeaturedCollectionsDisplay collections={nonTrendingCollections} />);

    expect(screen.queryByText('Trending')).not.toBeInTheDocument();
  });

  it('should render with custom testId prop', () => {
    render(<FeaturedCollectionsDisplay collections={mockCollections} testId={'custom-grid-id'} />);

    expect(screen.getByTestId('custom-grid-id')).toBeInTheDocument();
  });

  it('should render default testId when not provided', () => {
    render(<FeaturedCollectionsDisplay collections={mockCollections} />);

    expect(screen.getByTestId('feature-collection-grid')).toBeInTheDocument();
  });

  it('should render empty state with correct testId', () => {
    render(<FeaturedCollectionsDisplay collections={[]} />);

    expect(screen.getByTestId('feature-collections-empty-state')).toBeInTheDocument();
  });

  it('should link to correct collection detail pages', () => {
    render(<FeaturedCollectionsDisplay collections={mockCollections} />);

    const links = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('/collections'));
    expect(links[0]).toHaveAttribute('href', '/collections/vintage-baseball');
    expect(links[1]).toHaveAttribute('href', '/collections/movie-stars');
    expect(links[2]).toHaveAttribute('href', '/collections/sports-heroes');
  });

  it('should display view counts and comment counts', () => {
    render(<FeaturedCollectionsDisplay collections={mockCollections} />);

    // View counts
    expect(screen.getByText('1,543')).toBeInTheDocument();
    expect(screen.getByText('987')).toBeInTheDocument();
    expect(screen.getByText('432')).toBeInTheDocument();

    // Comment counts
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should format total value with toLocaleString', () => {
    render(<FeaturedCollectionsDisplay collections={mockCollections} />);

    expect(screen.getByText('$12,500')).toBeInTheDocument();
    expect(screen.getByText('$8,900')).toBeInTheDocument();
    expect(screen.getByText('$4,500')).toBeInTheDocument();
  });

  it('should handle zero values correctly', () => {
    const zeroValuesCollection: Array<FeaturedCollection> = [
      {
        comments: 0,
        contentId: 'collection-4',
        contentSlug: 'new-collection',
        description: 'Brand new collection',
        id: 'col-4',
        imageUrl: null,
        isLiked: false,
        likeId: null,
        likes: 0,
        ownerDisplayName: 'newcollector',
        title: 'New Collection',
        totalItems: 0,
        totalValue: 0,
        viewCount: 0,
      },
    ];

    render(<FeaturedCollectionsDisplay collections={zeroValuesCollection} />);

    expect(screen.getByText('0 items')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('should use placeholder avatar when ownerAvatarUrl is null', () => {
    render(<FeaturedCollectionsDisplay collections={[mockCollections[1]!]} />);

    // Second collection has null ownerAvatarUrl
    const avatarImage = screen.getByAltText('collector2');
    expect(avatarImage).toHaveAttribute('src', CLOUDINARY_PATHS.PLACEHOLDERS.AVATAR);
  });

  it('should show placeholder image when collection has no imageUrl', () => {
    render(<FeaturedCollectionsDisplay collections={[mockCollections[2]!]} />);

    // Third collection has null imageUrl
    const placeholderImage = screen.getByAltText('Collection placeholder');
    expect(placeholderImage).toHaveAttribute('src', CLOUDINARY_PATHS.PLACEHOLDERS.COLLECTION_COVER);
  });

  it('should render CldImage when collection has valid imageUrl', () => {
    render(<FeaturedCollectionsDisplay collections={[mockCollections[0]!]} />);

    const collectionImage = screen.getByAltText('Vintage Baseball Collection');
    expect(collectionImage).toHaveAttribute('data-public-id', 'mock-public-id');
  });

  it('should display descriptions when provided', () => {
    render(<FeaturedCollectionsDisplay collections={mockCollections} />);

    expect(screen.getByText('My vintage baseball collection')).toBeInTheDocument();
    expect(screen.getByText('Hollywood legends collection')).toBeInTheDocument();
    expect(screen.getByText('Sports bobblehead collection')).toBeInTheDocument();
  });
});
