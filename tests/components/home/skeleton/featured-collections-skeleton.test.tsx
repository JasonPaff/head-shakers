import { describe, expect, it } from 'vitest';

import { FeaturedCollectionsSkeleton } from '@/app/(app)/(home)/components/skeleton/featured-collections-skeleton';

import { render, screen } from '../../../setup/test-utils';

describe('FeaturedCollectionsSkeleton', () => {
  it('should render with proper accessibility attributes', () => {
    render(<FeaturedCollectionsSkeleton />);

    const container = screen.getByRole('status');

    expect(container).toHaveAttribute('aria-busy', 'true');
    expect(container).toHaveAttribute('aria-label', 'Loading featured collections');
  });

  it('should render correct test ID on container', () => {
    render(<FeaturedCollectionsSkeleton />);

    expect(screen.getByTestId('ui-skeleton-featured-collections')).toBeInTheDocument();
  });

  it('should render test IDs for all collection cards', () => {
    render(<FeaturedCollectionsSkeleton />);

    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`ui-skeleton-collection-${i}`)).toBeInTheDocument();
    }
  });

  it('should have screen reader announcement', () => {
    render(<FeaturedCollectionsSkeleton />);

    expect(screen.getByText('Loading featured collections...')).toHaveClass('sr-only');
  });
});
