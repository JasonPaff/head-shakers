import type { JSX } from 'react';

import { describe, expect, it, vi } from 'vitest';

import type { TrendingBobbleheadData } from '@/lib/queries/featured-content/featured-content-query';

import { TrendingBobbleheadsDisplay } from '@/app/(app)/(home)/components/display/trending-bobbleheads-display';

import { render, screen } from '../../../setup/test-utils';

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
    if (routeParams?.bobbleheadSlug) {
      return `/bobbleheads/${routeParams.bobbleheadSlug}`;
    }
    return route;
  }),
}));

// Mock cloudinary utils
vi.mock('@/lib/utils/cloudinary.utils', () => ({
  extractPublicIdFromCloudinaryUrl: vi.fn((url: null | string): string => {
    if (!url) return '';
    return 'mock-public-id';
  }),
  generateBlurDataUrl: vi.fn((publicId: null | string | undefined): string | undefined => {
    if (!publicId) return undefined;
    return 'data:image/jpeg;base64,mockblurdata';
  }),
}));

describe('TrendingBobbleheadsDisplay', () => {
  const mockBobbleheads: Array<TrendingBobbleheadData> = [
    {
      category: 'Sports',
      contentId: 'content-1',
      contentSlug: 'baseball-star',
      featureType: 'trending',
      id: 'bobblehead-1',
      imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/photo1.jpg',
      likeCount: 125,
      name: 'Baseball Star',
      title: 'Baseball Star',
      viewCount: 543,
      year: 2023,
    },
    {
      category: 'Movies',
      contentId: 'content-2',
      contentSlug: 'action-hero',
      featureType: 'editor_pick',
      id: 'bobblehead-2',
      imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/photo2.jpg',
      likeCount: 234,
      name: 'Action Hero',
      title: 'Action Hero',
      viewCount: 876,
      year: 2022,
    },
    {
      category: 'TV',
      contentId: 'content-3',
      contentSlug: 'detective',
      featureType: 'editor_pick',
      id: 'bobblehead-3',
      imageUrl: null,
      likeCount: 89,
      name: 'Detective',
      title: 'Detective',
      viewCount: 321,
      year: 2024,
    },
    {
      category: 'Games',
      contentId: 'content-4',
      contentSlug: 'hero-character',
      featureType: 'trending',
      id: 'bobblehead-4',
      imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/photo4.jpg',
      likeCount: 456,
      name: 'Hero Character',
      title: 'Hero Character',
      viewCount: 1234,
      year: 2021,
    },
  ];

  it('should render trending grid with all bobbleheads', () => {
    render(<TrendingBobbleheadsDisplay bobbleheads={mockBobbleheads} />);

    // Check all bobblehead names are rendered
    expect(screen.getByText('Baseball Star')).toBeInTheDocument();
    expect(screen.getByText('Action Hero')).toBeInTheDocument();
    expect(screen.getByText('Detective')).toBeInTheDocument();
    expect(screen.getByText('Hero Character')).toBeInTheDocument();
  });

  it('should show empty state when no bobbleheads', () => {
    render(<TrendingBobbleheadsDisplay bobbleheads={[]} />);

    expect(screen.getByText('No trending bobbleheads available at this time.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse all bobbleheads/i })).toBeInTheDocument();
  });

  it('should map badge variants correctly', () => {
    render(<TrendingBobbleheadsDisplay bobbleheads={mockBobbleheads} />);

    // Check badge text mapping
    expect(screen.getByText('Trending')).toBeInTheDocument(); // trending
    expect(screen.getByText('Pick')).toBeInTheDocument(); // editor_pick
    expect(screen.getByText('New')).toBeInTheDocument(); // new_badge
    expect(screen.getByText('Popular')).toBeInTheDocument(); // popular
  });

  it('should display category and year for each bobblehead', () => {
    render(<TrendingBobbleheadsDisplay bobbleheads={mockBobbleheads} />);

    // Check categories
    expect(screen.getByText('Sports')).toBeInTheDocument();
    expect(screen.getByText('Movies')).toBeInTheDocument();
    expect(screen.getByText('TV')).toBeInTheDocument();
    expect(screen.getByText('Games')).toBeInTheDocument();

    // Check years
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
  });

  it('should render with custom testId prop', () => {
    render(<TrendingBobbleheadsDisplay bobbleheads={mockBobbleheads} testId={'custom-grid-id'} />);

    expect(screen.getByTestId('custom-grid-id')).toBeInTheDocument();
  });

  it('should render default testId when not provided', () => {
    render(<TrendingBobbleheadsDisplay bobbleheads={mockBobbleheads} />);

    expect(screen.getByTestId('feature-trending-bobbleheads-grid')).toBeInTheDocument();
  });

  it('should render empty state with correct testId', () => {
    render(<TrendingBobbleheadsDisplay bobbleheads={[]} />);

    expect(screen.getByTestId('feature-trending-bobbleheads-grid')).toBeInTheDocument();
  });

  it('should link to correct bobblehead detail pages', () => {
    render(<TrendingBobbleheadsDisplay bobbleheads={mockBobbleheads} />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/bobbleheads/baseball-star');
    expect(links[1]).toHaveAttribute('href', '/bobbleheads/action-hero');
    expect(links[2]).toHaveAttribute('href', '/bobbleheads/detective');
    expect(links[3]).toHaveAttribute('href', '/bobbleheads/hero-character');
  });

  it('should format like counts and view counts with toLocaleString', () => {
    const largeCounts: Array<TrendingBobbleheadData> = [
      {
        category: 'Sports',
        contentId: 'content-5',
        contentSlug: 'popular-star',
        featureType: 'trending',
        id: 'bobblehead-5',
        imageUrl: null,
        likeCount: 15234,
        name: 'Popular Star',
        title: 'Popular Star',
        viewCount: 98765,
        year: 2023,
      },
    ];

    render(<TrendingBobbleheadsDisplay bobbleheads={largeCounts} />);

    // Stats appear on hover but DOM is still rendered
    expect(screen.getByText('15,234')).toBeInTheDocument();
    expect(screen.getByText('98,765')).toBeInTheDocument();
  });

  it('should render images when imageUrl is provided', () => {
    render(<TrendingBobbleheadsDisplay bobbleheads={mockBobbleheads.slice(0, 2)} />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('alt', 'Baseball Star');
    expect(images[1]).toHaveAttribute('alt', 'Action Hero');
  });

  it('should handle missing imageUrl gracefully', () => {
    const noImageBobblehead: Array<TrendingBobbleheadData> = [
      {
        category: 'Music',
        contentId: 'content-6',
        contentSlug: 'rock-star',
        featureType: 'trending',
        id: 'bobblehead-6',
        imageUrl: null,
        likeCount: 50,
        name: 'Rock Star',
        title: 'Rock Star',
        viewCount: 200,
        year: 2024,
      },
    ];

    render(<TrendingBobbleheadsDisplay bobbleheads={noImageBobblehead} />);

    // Should still render the card
    expect(screen.getByText('Rock Star')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
  });

  it('should apply hover effects with proper CSS classes', () => {
    render(<TrendingBobbleheadsDisplay bobbleheads={mockBobbleheads.slice(0, 1)} />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('group');
    expect(link).toHaveClass('hover:-translate-y-2');
  });
});
