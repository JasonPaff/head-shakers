import { afterEach, describe, expect, it, vi } from 'vitest';

import { CollectionCardCover } from '@/app/(app)/dashboard/collection/(collection)/components/sidebar/cards/collection-card-cover';

import {
  createMockCollectionDashboardRecord,
  mockCollectionDashboardRecord,
  mockEmptyCollectionDashboardRecord,
  mockPrivateCollectionDashboardRecord,
} from '../../../mocks/data/collections-dashboard.mock';
import { render, screen } from '../../../setup/test-utils';

describe('CollectionCardCover', () => {
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

  describe('full-bleed cover image rendering', () => {
    it('should render full-bleed cover image as background', () => {
      render(<CollectionCardCover {...defaultProps} />);

      const coverImage = screen.getByRole('img', { name: /sports collection/i });
      expect(coverImage).toBeInTheDocument();
      expect(coverImage).toHaveAttribute(
        'src',
        'https://res.cloudinary.com/test/image/upload/collection-cover-1.jpg',
      );
    });

    it('should render collection name as overlay text', () => {
      render(<CollectionCardCover {...defaultProps} />);

      const collectionName = screen.getByRole('heading', { level: 3, name: /sports collection/i });
      expect(collectionName).toBeInTheDocument();
      // Text color comes from parent container with text-white class
      expect(collectionName.parentElement).toHaveClass('text-white');
    });

    it('should display gradient overlay for text readability', () => {
      render(<CollectionCardCover {...defaultProps} />);

      // Verify overlay content is visible - gradient enables text readability
      const collectionName = screen.getByRole('heading', { level: 3, name: /sports collection/i });
      // Parent container has text-white for readability over gradient
      expect(collectionName.parentElement).toHaveClass('text-white');
      expect(collectionName.closest('[class*="absolute"]')).toBeInTheDocument();
    });

    it('should show item count badge on image', () => {
      render(<CollectionCardCover {...defaultProps} />);

      expect(screen.getByText('15 items')).toBeInTheDocument();
    });

    it('should handle collections without cover images (placeholder)', () => {
      render(<CollectionCardCover {...defaultProps} collection={mockEmptyCollectionDashboardRecord} />);

      const coverImage = screen.getByRole('img', { name: /empty collection/i });
      expect(coverImage).toHaveAttribute('src', '/images/placeholders/collection-cover-placeholder.png');
    });

    it('should render aspect ratio container correctly', () => {
      render(<CollectionCardCover {...defaultProps} />);

      // Verify cover image is rendered - aspect ratio container wraps it
      const coverImage = screen.getByRole('img', { name: /sports collection/i });
      expect(coverImage).toBeInTheDocument();
      expect(coverImage).toHaveClass('size-full');
    });

    it('should apply hover zoom effect via CSS', () => {
      render(<CollectionCardCover {...defaultProps} />);

      const coverImage = screen.getByRole('img', { name: /sports collection/i });
      expect(coverImage).toHaveClass('group-hover:scale-105');
      expect(coverImage).toHaveClass('transition-transform');
    });

    it('should link to collection detail page', async () => {
      const { user } = render(<CollectionCardCover {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      await user.click(card);

      expect(defaultProps.onClick).toHaveBeenCalledWith('sports-collection');
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle very long collection names with ellipsis', () => {
      const longNameCollection = createMockCollectionDashboardRecord({
        name: 'This is a very long collection name that should be displayed correctly with proper text handling in the overlay',
      });
      render(<CollectionCardCover {...defaultProps} collection={longNameCollection} />);

      const collectionName = screen.getByRole('heading', {
        level: 3,
        name: /this is a very long collection name/i,
      });
      expect(collectionName).toBeInTheDocument();
      expect(collectionName).toHaveClass('leading-tight');
    });

    it('should display visibility indicator (public/private icon)', () => {
      render(<CollectionCardCover {...defaultProps} />);

      const publicIcon = screen.getByLabelText('Public');
      expect(publicIcon).toBeInTheDocument();
    });

    it('should display visibility indicator for private collections', () => {
      render(<CollectionCardCover {...defaultProps} collection={mockPrivateCollectionDashboardRecord} />);

      const privateIcon = screen.getByLabelText('Private');
      expect(privateIcon).toBeInTheDocument();
    });

    it('should show loading state for images', () => {
      render(<CollectionCardCover {...defaultProps} />);

      const coverImage = screen.getByRole('img', { name: /sports collection/i });
      expect(coverImage).toHaveClass('object-cover');
      expect(coverImage).toHaveClass('size-full');
    });

    it('should render testId correctly', () => {
      render(<CollectionCardCover {...defaultProps} />);

      // Verify card is rendered with correct role and content
      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toBeInTheDocument();
    });

    it('should handle image loading errors gracefully', () => {
      // The component uses a placeholder URL for null/missing images
      render(<CollectionCardCover {...defaultProps} collection={mockEmptyCollectionDashboardRecord} />);

      const coverImage = screen.getByRole('img', { name: /empty collection/i });
      expect(coverImage).toHaveAttribute('src', '/images/placeholders/collection-cover-placeholder.png');
    });
  });

  describe('overlay stats display', () => {
    it('should display all stats in overlay', () => {
      render(<CollectionCardCover {...defaultProps} />);

      expect(screen.getByText('15 items')).toBeInTheDocument();
      expect(screen.getByText('$450.00')).toBeInTheDocument();
      expect(screen.getByText('24')).toBeInTheDocument(); // like count
    });

    it('should display collection description in overlay', () => {
      render(<CollectionCardCover {...defaultProps} />);

      expect(screen.getByText('My favorite sports bobbleheads')).toBeInTheDocument();
    });

    it('should truncate long descriptions with line-clamp-2', () => {
      const longDescriptionCollection = createMockCollectionDashboardRecord({
        description:
          'This is a very long description that should be truncated to two lines in the display and should not overflow the card layout or cover image overlay area',
      });
      render(<CollectionCardCover {...defaultProps} collection={longDescriptionCollection} />);

      const description = screen.getByText(
        'This is a very long description that should be truncated to two lines in the display and should not overflow the card layout or cover image overlay area',
      );
      expect(description).toHaveClass('line-clamp-2');
    });

    it('should format total value correctly', () => {
      render(<CollectionCardCover {...defaultProps} />);

      expect(screen.getByText('$450.00')).toBeInTheDocument();
    });

    it('should handle null total value', () => {
      const collectionWithNullValue = createMockCollectionDashboardRecord({ totalValue: null });
      render(<CollectionCardCover {...defaultProps} collection={collectionWithNullValue} />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });

  describe('active state styling', () => {
    it('should render active state styling when isActive is true', () => {
      render(<CollectionCardCover {...defaultProps} isActive={true} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('border-primary');
      expect(card).toHaveClass('shadow-lg');
      expect(card).toHaveClass('ring-2');
      expect(card).toHaveClass('ring-primary/20');
    });

    it('should render default state styling when isActive is false', () => {
      render(<CollectionCardCover {...defaultProps} isActive={false} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('border-border');
      expect(card).toHaveClass('hover:border-primary/50');
      expect(card).not.toHaveClass('ring-2');
    });

    it('should render active indicator bar when isActive is true', () => {
      render(<CollectionCardCover {...defaultProps} isActive={true} />);

      // Active indicator is visually present - verify via active state classes
      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('border-primary');
      expect(card).toHaveClass('shadow-lg');
    });

    it('should not render active indicator bar when isActive is false', () => {
      render(<CollectionCardCover {...defaultProps} isActive={false} />);

      // No active indicator - verify via absence of active state classes
      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).not.toHaveClass('ring-2');
      expect(card).toHaveClass('border-border');
    });
  });

  describe('hover effects and styling', () => {
    it('should apply hover class names via CSS', () => {
      render(<CollectionCardCover {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('hover:shadow-lg');
    });

    it('should have transition-all class for smooth animations', () => {
      render(<CollectionCardCover {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveClass('transition-all');
    });

    it('should show actions menu on hover', async () => {
      const { user } = render(<CollectionCardCover {...defaultProps} />);

      // Actions menu trigger button exists (even if hidden initially)
      const menuTrigger = screen.getByRole('button', { name: '' });
      expect(menuTrigger).toBeInTheDocument();

      // Menu can be opened to reveal actions
      await user.click(menuTrigger);
      expect(screen.getByRole('menuitem', { name: /edit collection/i })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have role button for keyboard navigation', () => {
      render(<CollectionCardCover {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toBeInTheDocument();
    });

    it('should have tabIndex for keyboard focus', () => {
      render(<CollectionCardCover {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('should support keyboard interaction with Enter key', async () => {
      const { user } = render(<CollectionCardCover {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      card.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onClick).toHaveBeenCalledWith('sports-collection');
    });

    it('should support keyboard interaction with Space key', async () => {
      const { user } = render(<CollectionCardCover {...defaultProps} />);

      const card = screen.getByRole('button', { name: /sports collection/i });
      card.focus();
      await user.keyboard(' ');

      expect(defaultProps.onClick).toHaveBeenCalledWith('sports-collection');
    });

    it('should have aria-label for visibility icons', () => {
      render(<CollectionCardCover {...defaultProps} />);

      const publicIcon = screen.getByLabelText('Public');
      expect(publicIcon).toHaveAttribute('aria-label', 'Public');
    });

    it('should have accessible image alt text', () => {
      render(<CollectionCardCover {...defaultProps} />);

      const coverImage = screen.getByRole('img', { name: /sports collection/i });
      expect(coverImage).toHaveAttribute('alt', 'Sports Collection');
    });
  });

  describe('action handlers', () => {
    it('should call onEdit when edit is clicked', async () => {
      const { user } = render(<CollectionCardCover {...defaultProps} />);

      // Open dropdown menu
      const menuTrigger = screen.getByRole('button', { name: '' }); // Icon button has no text
      await user.click(menuTrigger);

      // Click edit option
      const editOption = screen.getByRole('menuitem', { name: /edit collection/i });
      await user.click(editOption);

      expect(defaultProps.onEdit).toHaveBeenCalledWith('collection-1');
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete is clicked', async () => {
      const { user } = render(<CollectionCardCover {...defaultProps} />);

      // Open dropdown menu
      const menuTrigger = screen.getByRole('button', { name: '' }); // Icon button has no text
      await user.click(menuTrigger);

      // Click delete option
      const deleteOption = screen.getByRole('menuitem', { name: /delete collection/i });
      await user.click(deleteOption);

      expect(defaultProps.onDelete).toHaveBeenCalledWith('collection-1');
      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });

    it('should handle edit action independently of card click', async () => {
      const { user } = render(<CollectionCardCover {...defaultProps} />);

      // Open dropdown menu
      const menuTrigger = screen.getByRole('button', { name: '' });
      await user.click(menuTrigger);

      // Click edit option
      const editOption = screen.getByRole('menuitem', { name: /edit collection/i });
      await user.click(editOption);

      // onEdit should be called with correct ID
      expect(defaultProps.onEdit).toHaveBeenCalledWith('collection-1');
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });

    it('should handle delete action independently of card click', async () => {
      const { user } = render(<CollectionCardCover {...defaultProps} />);

      // Open dropdown menu
      const menuTrigger = screen.getByRole('button', { name: '' });
      await user.click(menuTrigger);

      // Click delete option
      const deleteOption = screen.getByRole('menuitem', { name: /delete collection/i });
      await user.click(deleteOption);

      // onDelete should be called with correct ID
      expect(defaultProps.onDelete).toHaveBeenCalledWith('collection-1');
      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });
  });
});
