import { describe, expect, it } from 'vitest';

import type { PlatformStats } from '@/lib/facades/platform/platform-stats.facade';

import { PlatformStatsDisplay } from '@/app/(app)/(home)/components/display/platform-stats-display';

import { render, screen } from '../../../setup/test-utils';

describe('PlatformStatsDisplay', () => {
  const mockStats: PlatformStats = {
    totalBobbleheads: 15234,
    totalCollections: 3567,
    totalCollectors: 8901,
  };

  it('should render all 3 stat values', () => {
    render(<PlatformStatsDisplay platformStats={mockStats} />);

    // Check that all three stats are displayed (numbers are formatted and + is in separate span)
    expect(screen.getByText('15,234')).toBeInTheDocument();
    expect(screen.getByText('3,567')).toBeInTheDocument();
    expect(screen.getByText('8,901')).toBeInTheDocument();
  });

  it('should format numbers with toLocaleString', () => {
    const largeStats: PlatformStats = {
      totalBobbleheads: 1234567,
      totalCollections: 987654,
      totalCollectors: 456789,
    };

    render(<PlatformStatsDisplay platformStats={largeStats} />);

    // Verify proper number formatting
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
    expect(screen.getByText('987,654')).toBeInTheDocument();
    expect(screen.getByText('456,789')).toBeInTheDocument();
  });

  it('should have proper accessibility with dl/dt/dd structure', () => {
    render(<PlatformStatsDisplay platformStats={mockStats} />);

    // Check for description list with aria-label
    const descriptionList = screen.getByLabelText('Platform statistics');
    expect(descriptionList).toBeInTheDocument();
    expect(descriptionList.tagName).toBe('DL');

    // Check for stat labels (dd elements)
    expect(screen.getByText('Bobbleheads')).toBeInTheDocument();
    expect(screen.getByText('Collectors')).toBeInTheDocument();
    expect(screen.getByText('Collections')).toBeInTheDocument();
  });

  it('should render correct test IDs for all stat items', () => {
    render(<PlatformStatsDisplay platformStats={mockStats} />);

    expect(screen.getByTestId('feature-hero-stats')).toBeInTheDocument();
    expect(screen.getByTestId('feature-hero-stats-bobbleheads')).toBeInTheDocument();
    expect(screen.getByTestId('feature-hero-stats-collectors')).toBeInTheDocument();
    expect(screen.getByTestId('feature-hero-stats-collections')).toBeInTheDocument();
  });

  it('should display + symbol with aria-label for accessibility', () => {
    render(<PlatformStatsDisplay platformStats={mockStats} />);

    // Check for + symbols with aria-label
    const plusSymbols = screen.getAllByLabelText('and growing');
    expect(plusSymbols).toHaveLength(3);
  });

  it('should handle zero values correctly', () => {
    const zeroStats: PlatformStats = {
      totalBobbleheads: 0,
      totalCollections: 0,
      totalCollectors: 0,
    };

    render(<PlatformStatsDisplay platformStats={zeroStats} />);

    // Should display 0 with proper formatting (there will be 3 instances of "0", one for each stat)
    const zeroTexts = screen.getAllByText('0');
    expect(zeroTexts).toHaveLength(3);
  });
});
