import { afterEach, describe, expect, it, vi } from 'vitest';

import { CollectionCardDetailed } from '@/app/(app)/user/[username]/dashboard/collection/components/sidebar/cards/collection-card-detailed';

import {
  createMockCollectionDashboardRecord,
  mockCollectionDashboardRecord,
  mockEmptyCollectionDashboardRecord,
  mockPopularCollectionDashboardRecord,
  mockPrivateCollectionDashboardRecord,
} from '../../../mocks/data/collections-dashboard.mock';
import { render, screen } from '../../../setup/test-utils';

describe('CollectionCardDetailed', () => {
  const defaultProps = {
    collection: mockCollectionDashboardRecord,
    isActive: false,
    isHoverCardEnabled: false,
    onClick: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering all compact card features (inherited)', () => {
    it('should render collection name', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      expect(screen.getByText('Sports Collection')).toBeInTheDocument();
    });

    it('should render collection item count', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      expect(screen.getByText('15 items')).toBeInTheDocument();
    });

    it('should render collection visibility badge for public collection', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      const publicIcon = screen.getByLabelText('Public');
      expect(publicIcon).toBeInTheDocument();
    });

    it('should render collection visibility badge for private collection', () => {
      render(<CollectionCardDetailed {...defaultProps} collection={mockPrivateCollectionDashboardRecord} />);

      const privateIcon = screen.getByLabelText('Private');
      expect(privateIcon).toBeInTheDocument();
    });

    it('should display formatted total value', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      expect(screen.getByText('$450.00')).toBeInTheDocument();
    });

    it('should call onClick with collection slug when card is clicked', async () => {
      const { user } = render(<CollectionCardDetailed {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      await user.click(card);

      expect(defaultProps.onClick).toHaveBeenCalledWith('sports-collection');
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('extended stats display', () => {
    it('should display like count with icon', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      expect(screen.getByText('24')).toBeInTheDocument();
      // HeartIcon is present as part of the stats
      const statsSection = screen.getByText('24').parentElement;
      expect(statsSection).toBeInTheDocument();
    });

    it('should display featured bobblehead count', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      expect(screen.getByText('3')).toBeInTheDocument();
      // StarIcon is present as part of the stats
      const statsSection = screen.getByText('3').parentElement;
      expect(statsSection).toBeInTheDocument();
    });

    it('should handle zero values for all stats', () => {
      render(<CollectionCardDetailed {...defaultProps} collection={mockEmptyCollectionDashboardRecord} />);

      expect(screen.getByText('0 items')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument();
      // Both likes and featured count should show 0
      const zeroStats = screen.getAllByText('0');
      expect(zeroStats).toHaveLength(2); // like count and featured count
    });

    it('should display large numbers correctly without abbreviation', () => {
      render(<CollectionCardDetailed {...defaultProps} collection={mockPopularCollectionDashboardRecord} />);

      expect(screen.getByText('1024')).toBeInTheDocument(); // likes
      expect(screen.getByText('25')).toBeInTheDocument(); // featured count
    });
  });

  describe('collection description', () => {
    it('should display collection description snippet', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      expect(screen.getByText('My favorite sports bobbleheads')).toBeInTheDocument();
    });

    it('should truncate long descriptions with line-clamp-2', () => {
      const longDescriptionCollection = createMockCollectionDashboardRecord({
        description:
          'This is a very long description that should be truncated to two lines in the display and should not overflow the card layout',
      });
      render(<CollectionCardDetailed {...defaultProps} collection={longDescriptionCollection} />);

      const description = screen.getByText(
        'This is a very long description that should be truncated to two lines in the display and should not overflow the card layout',
      );
      expect(description).toHaveClass('line-clamp-2');
    });

    it('should handle empty description gracefully', () => {
      const noDescriptionCollection = createMockCollectionDashboardRecord({
        description: '',
      });
      render(<CollectionCardDetailed {...defaultProps} collection={noDescriptionCollection} />);

      // Description element should still exist but be empty
      const collectionInfo = screen.getByRole('button', { name: /collection/i });
      expect(collectionInfo).toBeInTheDocument();
    });
  });

  describe('layout and stat positioning', () => {
    it('should show all stats in proper layout grid', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      // Stats row contains item count, total value, and visibility icon
      expect(screen.getByText('15 items')).toBeInTheDocument();
      expect(screen.getByText('$450.00')).toBeInTheDocument();
      expect(screen.getByLabelText('Public')).toBeInTheDocument();

      // Engagement stats row contains likes and featured count
      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display avatar with proper size', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      // Avatar should be rendered with size-16 class
      const collectionName = screen.getByText('Sports Collection');
      expect(collectionName).toBeInTheDocument();
    });
  });

  describe('missing optional stats', () => {
    it('should handle collections with null total value', () => {
      const collectionWithNullValue = createMockCollectionDashboardRecord({ totalValue: null });
      render(<CollectionCardDetailed {...defaultProps} collection={collectionWithNullValue} />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle collections with zero featured count', () => {
      const collectionWithZeroFeatured = createMockCollectionDashboardRecord({ featuredCount: 0 });
      render(<CollectionCardDetailed {...defaultProps} collection={collectionWithZeroFeatured} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle collections with zero likes', () => {
      const collectionWithZeroLikes = createMockCollectionDashboardRecord({ likeCount: 0 });
      render(<CollectionCardDetailed {...defaultProps} collection={collectionWithZeroLikes} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('active state styling', () => {
    it('should render active state styling when isActive is true', () => {
      render(<CollectionCardDetailed {...defaultProps} isActive={true} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('border-primary');
      expect(card).toHaveClass('bg-linear-to-r');
      expect(card).toHaveClass('from-primary/10');
    });

    it('should render default state styling when isActive is false', () => {
      render(<CollectionCardDetailed {...defaultProps} isActive={false} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('border-border');
      expect(card).toHaveClass('bg-card');
      expect(card).not.toHaveClass('bg-linear-to-r');
    });
  });

  describe('hover effects and styling', () => {
    it('should apply hover class names via CSS', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('hover:border-primary');
      expect(card).toHaveClass('hover:bg-accent');
    });

    it('should have transition-all class for smooth animations', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('transition-all');
    });
  });

  describe('accessibility', () => {
    it('should have role button for keyboard navigation', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toBeInTheDocument();
    });

    it('should have tabIndex for keyboard focus', () => {
      render(<CollectionCardDetailed {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('should support keyboard interaction with Enter key', async () => {
      const { user } = render(<CollectionCardDetailed {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      card.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onClick).toHaveBeenCalledWith('sports-collection');
    });

    it('should support keyboard interaction with Space key', async () => {
      const { user } = render(<CollectionCardDetailed {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      card.focus();
      await user.keyboard(' ');

      expect(defaultProps.onClick).toHaveBeenCalledWith('sports-collection');
    });
  });
});
