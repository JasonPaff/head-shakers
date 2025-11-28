import { describe, expect, it } from 'vitest';

import { FeaturedBobbleheadSkeleton } from '@/app/(app)/(home)/components/skeleton/featured-bobblehead-skeleton';

import { render, screen } from '../../../setup/test-utils';

describe('FeaturedBobbleheadSkeleton', () => {
  it('should render with proper accessibility attributes', () => {
    render(<FeaturedBobbleheadSkeleton />);

    const container = screen.getByRole('status');

    expect(container).toHaveAttribute('aria-busy', 'true');
    expect(container).toHaveAttribute('aria-label', 'Loading featured bobblehead showcase');
  });

  it('should render correct test ID on container', () => {
    render(<FeaturedBobbleheadSkeleton />);

    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead')).toBeInTheDocument();
  });

  it('should render main card skeleton elements', () => {
    render(<FeaturedBobbleheadSkeleton />);

    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead-image')).toBeInTheDocument();
    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead-badge')).toBeInTheDocument();
    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead-title')).toBeInTheDocument();
    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead-description')).toBeInTheDocument();
    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead-likes')).toBeInTheDocument();
    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead-views')).toBeInTheDocument();
  });

  it('should render both floating card elements', () => {
    render(<FeaturedBobbleheadSkeleton />);

    // First floating card
    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead-float-icon-1')).toBeInTheDocument();
    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead-float-text-1')).toBeInTheDocument();
    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead-float-subtext-1')).toBeInTheDocument();

    // Second floating card
    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead-float-icon-2')).toBeInTheDocument();
    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead-float-text-2')).toBeInTheDocument();
    expect(screen.getByTestId('ui-skeleton-hero-featured-bobblehead-float-subtext-2')).toBeInTheDocument();
  });

  it('should have screen reader announcement', () => {
    render(<FeaturedBobbleheadSkeleton />);

    expect(screen.getByText('Loading featured bobblehead showcase...')).toHaveClass('sr-only');
  });
});
