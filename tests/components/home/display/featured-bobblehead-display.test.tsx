import type { JSX } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { FeaturedBobbleheadDisplay } from '@/app/(app)/(home)/components/display/featured-bobblehead-display';

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
  $path: vi.fn(({ routeParams }: { routeParams: Record<string, string> }): string => {
    return `/bobbleheads/${routeParams.bobbleheadSlug}`;
  }),
}));

// Mock cloudinary utils
vi.mock('@/lib/utils/cloudinary.utils', () => ({
  extractPublicIdFromCloudinaryUrl: vi.fn((url: null | string): null | string => {
    if (!url) return null;
    return 'mock-public-id';
  }),
  generateBlurDataUrl: vi.fn((publicId: null | string | undefined): string | undefined => {
    if (!publicId) return undefined;
    return 'data:image/jpeg;base64,mockblurdata';
  }),
}));

describe('FeaturedBobbleheadDisplay', () => {
  const mockBobblehead = {
    contentId: '00000000-0000-0000-0000-000000000000',
    contentName: 'Vintage Baseball Player',
    contentSlug: 'bobblehead-1',
    description: 'A rare collectible bobblehead',
    id: 'bobblehead-1',
    imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/bobbleheads/photo.jpg',
    likes: 125,
    name: 'Vintage Baseball Player',
    owner: '@jason-paff',
    userId: 'user-1',
    viewCount: 1543,
  };

  it('should render with complete data', () => {
    render(<FeaturedBobbleheadDisplay bobblehead={mockBobblehead} />);

    // Check name is displayed
    expect(screen.getByText('Vintage Baseball Player')).toBeInTheDocument();

    // Check description is displayed
    expect(screen.getByText('A rare collectible bobblehead')).toBeInTheDocument();

    // Check stats are displayed with proper formatting
    expect(screen.getByText('125')).toBeInTheDocument();
    expect(screen.getByText('1,543')).toBeInTheDocument();
  });

  it('should show trophy icon when no image', () => {
    const bobbleheadNoImage = {
      ...mockBobblehead,
      photoUrl: null,
    };

    const { container } = render(<FeaturedBobbleheadDisplay bobblehead={bobbleheadNoImage} />);

    // When no image, should show fallback with gradient background
    // Trophy icon is an SVG with aria-hidden, so we need to query it differently
    // eslint-disable-next-line testing-library/no-container
    const trophyIcon = container.querySelector('svg[aria-hidden="true"]');
    expect(trophyIcon).toBeInTheDocument();
    expect(trophyIcon).toHaveClass('size-20');
  });

  it("should display editor's pick badge", () => {
    render(<FeaturedBobbleheadDisplay bobblehead={mockBobblehead} />);

    // Check for badge
    expect(screen.getByText("Editor's Pick")).toBeInTheDocument();
  });

  it('should link to bobblehead detail page', () => {
    render(<FeaturedBobbleheadDisplay bobblehead={mockBobblehead} />);

    // Find the main card link
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/bobbleheads/bobblehead-1');
  });

  it('should render with custom testId prop', () => {
    render(<FeaturedBobbleheadDisplay bobblehead={mockBobblehead} testId={'custom-test-id'} />);

    expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    expect(screen.getByTestId('custom-test-id-card')).toBeInTheDocument();
    expect(screen.getByTestId('custom-test-id-badge')).toBeInTheDocument();
  });

  it('should render default testIds when not provided', () => {
    render(<FeaturedBobbleheadDisplay bobblehead={mockBobblehead} />);

    expect(screen.getByTestId('feature-bobblehead-card')).toBeInTheDocument();
    expect(screen.getByTestId('feature-bobblehead-card-card')).toBeInTheDocument();
    expect(screen.getByTestId('feature-bobblehead-card-badge')).toBeInTheDocument();
  });

  it('should render image when photoUrl is provided', () => {
    render(<FeaturedBobbleheadDisplay bobblehead={mockBobblehead} />);

    const image = screen.getByRole('img', { name: 'Vintage Baseball Player' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('data-public-id', 'mock-public-id');
  });

  it('should not render description when null', () => {
    const bobbleheadNoDesc = {
      ...mockBobblehead,
      description: null,
    };

    render(<FeaturedBobbleheadDisplay bobblehead={bobbleheadNoDesc} />);

    expect(screen.queryByText('A rare collectible bobblehead')).not.toBeInTheDocument();
  });

  it('should render floating cards for top rated and value growth', () => {
    render(<FeaturedBobbleheadDisplay bobblehead={mockBobblehead} />);

    expect(screen.getByText('Top Rated')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('+23%')).toBeInTheDocument();
    expect(screen.getByText('Value Growth')).toBeInTheDocument();
  });

  it('should format large numbers with toLocaleString', () => {
    const popularBobblehead = {
      ...mockBobblehead,
      likeCount: 15234,
      viewCount: 98765,
    };

    render(<FeaturedBobbleheadDisplay bobblehead={popularBobblehead} />);

    expect(screen.getByText('15,234')).toBeInTheDocument();
    expect(screen.getByText('98,765')).toBeInTheDocument();
  });
});
