import { describe, expect, it } from 'vitest';

import { PlatformStatsSkeleton } from '@/app/(app)/(home)/components/skeleton/platform-stats-skeleton';

import { render, screen } from '../../../setup/test-utils';

describe('PlatformStatsSkeleton', () => {
  it('should render with proper accessibility attributes', () => {
    render(<PlatformStatsSkeleton />);

    const container = screen.getByRole('status');

    expect(container).toHaveAttribute('aria-busy', 'true');
    expect(container).toHaveAttribute('aria-label', 'Loading platform statistics');
  });

  it('should render correct test ID on container', () => {
    render(<PlatformStatsSkeleton />);

    expect(screen.getByTestId('ui-skeleton-hero-stats')).toBeInTheDocument();
  });

  it('should render skeleton elements for all 3 stats', () => {
    render(<PlatformStatsSkeleton />);

    // Bobbleheads stat
    expect(screen.getByTestId('ui-skeleton-hero-stats-bobbleheads-value')).toBeInTheDocument();
    expect(screen.getByTestId('ui-skeleton-hero-stats-bobbleheads-label')).toBeInTheDocument();

    // Collectors stat
    expect(screen.getByTestId('ui-skeleton-hero-stats-collectors-value')).toBeInTheDocument();
    expect(screen.getByTestId('ui-skeleton-hero-stats-collectors-label')).toBeInTheDocument();

    // Collections stat
    expect(screen.getByTestId('ui-skeleton-hero-stats-collections-value')).toBeInTheDocument();
    expect(screen.getByTestId('ui-skeleton-hero-stats-collections-label')).toBeInTheDocument();
  });

  it('should have screen reader announcement', () => {
    render(<PlatformStatsSkeleton />);

    expect(screen.getByText('Loading platform statistics...')).toHaveClass('sr-only');
  });
});
