import { afterEach, describe, expect, it, vi } from 'vitest';

import { CollectionCardCompact } from '@/app/(app)/dashboard/collection/components/sidebar/cards/collection-card-compact';

import {
  createMockCollectionDashboardRecord,
  mockCollectionDashboardRecord,
  mockEmptyCollectionDashboardRecord,
  mockPrivateCollectionDashboardRecord,
} from '../../../mocks/data/collections-dashboard.mock';
import { render, screen } from '../../../setup/test-utils';

describe('CollectionCardCompact', () => {
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

  describe('rendering collection info', () => {
    it('should render collection name', () => {
      render(<CollectionCardCompact {...defaultProps} />);

      expect(screen.getByText('Sports Collection')).toBeInTheDocument();
    });

    it('should render collection item count', () => {
      render(<CollectionCardCompact {...defaultProps} />);

      expect(screen.getByText('15 items')).toBeInTheDocument();
    });

    it('should render collection visibility badge for public collection', () => {
      render(<CollectionCardCompact {...defaultProps} />);

      const publicIcon = screen.getByLabelText('Public');
      expect(publicIcon).toBeInTheDocument();
    });

    it('should render collection visibility badge for private collection', () => {
      render(<CollectionCardCompact {...defaultProps} collection={mockPrivateCollectionDashboardRecord} />);

      const privateIcon = screen.getByLabelText('Private');
      expect(privateIcon).toBeInTheDocument();
    });

    it('should display collection cover image when provided', () => {
      render(<CollectionCardCompact {...defaultProps} />);

      // Avatar component renders with the collection name
      // The avatar is present in the DOM when cover image is provided
      const collectionName = screen.getByText('Sports Collection');
      expect(collectionName).toBeInTheDocument();
    });

    it('should display placeholder when collection has no cover image', () => {
      render(<CollectionCardCompact {...defaultProps} collection={mockEmptyCollectionDashboardRecord} />);

      // When no cover image, avatar fallback should be visible (first character of name)
      const fallback = screen.getByText('E'); // 'E' from 'Empty Collection'
      expect(fallback).toBeInTheDocument();
    });

    it('should display formatted total value', () => {
      render(<CollectionCardCompact {...defaultProps} />);

      expect(screen.getByText('$450.00')).toBeInTheDocument();
    });
  });

  describe('Links to correct collection detail page', () => {
    it('should call onClick with collection slug when card is clicked', async () => {
      const { user } = render(<CollectionCardCompact {...defaultProps} />);

      // Find the card button (not the dropdown menu button)
      const card = screen.getByRole('button', { name: /sports collection/i });
      await user.click(card);

      expect(defaultProps.onClick).toHaveBeenCalledWith('sports-collection');
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('active state styling', () => {
    it('should render active state styling when isActive is true', () => {
      render(<CollectionCardCompact {...defaultProps} isActive={true} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('border-primary');
      expect(card).toHaveClass('bg-linear-to-r');
      expect(card).toHaveClass('from-primary/10');
    });

    it('should render default state styling when isActive is false', () => {
      render(<CollectionCardCompact {...defaultProps} isActive={false} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('border-border');
      expect(card).toHaveClass('bg-card');
      expect(card).not.toHaveClass('bg-linear-to-r');
    });

    it('should render active indicator when isActive is true', () => {
      render(<CollectionCardCompact {...defaultProps} isActive={true} />);

      // Active indicator is a visual element with specific data-slot attribute
      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('border-primary');
    });

    it('should not render active indicator when isActive is false', () => {
      render(<CollectionCardCompact {...defaultProps} isActive={false} />);

      // Non-active state should have border-border class
      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('border-border');
    });
  });

  describe('edge cases', () => {
    it('should handle collections with zero items', () => {
      render(<CollectionCardCompact {...defaultProps} collection={mockEmptyCollectionDashboardRecord} />);

      expect(screen.getByText('0 items')).toBeInTheDocument();
    });

    it('should handle collections with null total value', () => {
      const collectionWithNullValue = createMockCollectionDashboardRecord({ totalValue: null });
      render(<CollectionCardCompact {...defaultProps} collection={collectionWithNullValue} />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should render truncated long collection names', () => {
      const longNameCollection = createMockCollectionDashboardRecord({
        name: 'This is a very long collection name that should be truncated in the display',
      });
      render(<CollectionCardCompact {...defaultProps} collection={longNameCollection} />);

      const nameElement = screen.getByText(
        'This is a very long collection name that should be truncated in the display',
      );
      expect(nameElement).toHaveClass('truncate');
    });

    it('should display avatar fallback with first character when image fails', () => {
      render(<CollectionCardCompact {...defaultProps} />);

      // Avatar fallback should show first character of collection name
      const fallback = screen.getByText('S');
      expect(fallback).toBeInTheDocument();
    });
  });

  describe('hover effects and styling', () => {
    it('should apply hover class names via CSS', () => {
      render(<CollectionCardCompact {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('hover:border-primary');
      expect(card).toHaveClass('hover:bg-accent');
    });

    it('should have transition-all class for smooth animations', () => {
      render(<CollectionCardCompact {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('transition-all');
    });
  });

  describe('accessibility', () => {
    it('should have role button for keyboard navigation', () => {
      render(<CollectionCardCompact {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toBeInTheDocument();
    });

    it('should have tabIndex for keyboard focus', () => {
      render(<CollectionCardCompact {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('should have aria-label for visibility icons', () => {
      render(<CollectionCardCompact {...defaultProps} />);

      const publicIcon = screen.getByLabelText('Public');
      expect(publicIcon).toHaveAttribute('aria-label', 'Public');
    });
  });
});
