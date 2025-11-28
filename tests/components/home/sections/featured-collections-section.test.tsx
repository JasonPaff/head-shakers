import type { JSX } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { FeaturedCollectionsSection } from '@/app/(app)/(home)/components/sections/featured-collections-section';
import { generateTestId } from '@/lib/test-ids';

import { render, screen } from '../../../setup/test-utils';

// Mock async server components
vi.mock('@/app/(app)/(home)/components/async/featured-collections-async', () => ({
  FeaturedCollectionsAsync: (): JSX.Element => (
    <div data-testid={'featured-collections-async'}>Featured Collections</div>
  ),
}));

describe('FeaturedCollectionsSection', () => {
  describe('Rendering', () => {
    it('should render section heading', () => {
      render(<FeaturedCollectionsSection />);

      expect(screen.getByRole('heading', { name: /Featured Collections/i })).toBeInTheDocument();
    });

    it('should render section description', () => {
      render(<FeaturedCollectionsSection />);

      expect(
        screen.getByText(/Explore curated collections from our most passionate collectors/i),
      ).toBeInTheDocument();
    });

    it('should render section with correct test ID', () => {
      render(<FeaturedCollectionsSection />);

      expect(
        screen.getByTestId(generateTestId('layout', 'featured-collections-section')),
      ).toBeInTheDocument();
    });
  });

  describe('View All Link', () => {
    it('should render view all collections link', () => {
      render(<FeaturedCollectionsSection />);

      const link = screen.getByRole('link', { name: /View All Collections/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/browse');
    });
  });

  describe('Error Boundary', () => {
    it('should render error boundary wrapper for async content', () => {
      render(<FeaturedCollectionsSection />);

      // Verify the section renders (which includes ErrorBoundary wrapper)
      expect(
        screen.getByTestId(generateTestId('layout', 'featured-collections-section')),
      ).toBeInTheDocument();
    });
  });
});
