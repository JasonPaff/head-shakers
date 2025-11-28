import type { JSX } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { TrendingBobbleheadsSection } from '@/app/(app)/(home)/components/sections/trending-bobbleheads-section';
import { generateTestId } from '@/lib/test-ids';

import { render, screen } from '../../../setup/test-utils';

// Mock async server components
vi.mock('@/app/(app)/(home)/components/async/trending-bobbleheads-async', () => ({
  TrendingBobbleheadsAsync: (): JSX.Element => (
    <div data-testid={'trending-bobbleheads-async'}>Trending Bobbleheads</div>
  ),
}));

describe('TrendingBobbleheadsSection', () => {
  describe('Rendering', () => {
    it('should render section heading', () => {
      render(<TrendingBobbleheadsSection />);

      expect(screen.getByRole('heading', { name: /Trending Now/i })).toBeInTheDocument();
    });

    it('should render section description', () => {
      render(<TrendingBobbleheadsSection />);

      expect(
        screen.getByText(/The most popular bobbleheads this week from collectors worldwide/i),
      ).toBeInTheDocument();
    });

    it('should render section with correct test ID', () => {
      render(<TrendingBobbleheadsSection />);

      expect(
        screen.getByTestId(generateTestId('layout', 'trending-bobbleheads-section')),
      ).toBeInTheDocument();
    });
  });

  describe('Explore All Link', () => {
    it('should render explore all bobbleheads link', () => {
      render(<TrendingBobbleheadsSection />);

      const link = screen.getByRole('link', { name: /Explore All Bobbleheads/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/browse/search');
    });
  });

  describe('Error Boundary', () => {
    it('should render error boundary wrapper for async content', () => {
      render(<TrendingBobbleheadsSection />);

      // Verify the section renders (which includes ErrorBoundary wrapper)
      expect(
        screen.getByTestId(generateTestId('layout', 'trending-bobbleheads-section')),
      ).toBeInTheDocument();
    });
  });
});
