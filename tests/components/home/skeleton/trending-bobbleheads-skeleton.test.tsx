import { describe, expect, it } from 'vitest';

import { TrendingBobbleheadsSkeleton } from '@/app/(app)/(home)/components/skeleton/trending-bobbleheads-skeleton';

import { render, screen } from '../../../setup/test-utils';

describe('TrendingBobbleheadsSkeleton', () => {
  it('should render with proper accessibility attributes', () => {
    render(<TrendingBobbleheadsSkeleton />);

    const container = screen.getByRole('status');

    expect(container).toHaveAttribute('aria-busy', 'true');
    expect(container).toHaveAttribute('aria-label', 'Loading trending bobbleheads');
  });

  it('should render correct test ID on container', () => {
    render(<TrendingBobbleheadsSkeleton />);

    expect(screen.getByTestId('ui-skeleton-trending-bobbleheads')).toBeInTheDocument();
  });

  it('should render test IDs for all bobblehead cards', () => {
    render(<TrendingBobbleheadsSkeleton />);

    for (let i = 0; i < 12; i++) {
      expect(screen.getByTestId(`ui-skeleton-trending-bobblehead-${i}`)).toBeInTheDocument();
    }
  });

  it('should have screen reader announcement', () => {
    render(<TrendingBobbleheadsSkeleton />);

    expect(screen.getByText('Loading trending bobbleheads...')).toHaveClass('sr-only');
  });
});
