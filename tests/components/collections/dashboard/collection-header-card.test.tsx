import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CollectionHeaderCard } from '@/app/(app)/dashboard/collection/components/main/collection-header-card';

import { createMockCollectionHeader } from '../../../fixtures/collection-header.factory';
import { render, screen } from '../../../setup/test-utils';

describe('CollectionHeaderCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const defaultProps = {
    collection: createMockCollectionHeader(),
    onDelete: mockOnDelete,
    onEdit: mockOnEdit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render collection name, description, and avatar', () => {
      const collection = createMockCollectionHeader({
        description: 'Test collection description',
        name: 'My Test Collection',
      });

      render(<CollectionHeaderCard {...defaultProps} collection={collection} />);

      // Verify title (CardTitle)
      expect(screen.getByTestId('ui-card-title')).toHaveTextContent('My Test Collection');

      // Verify description (CardDescription)
      expect(screen.getByTestId('ui-card-description')).toHaveTextContent('Test collection description');

      // Verify avatar fallback (image doesn't load in tests, fallback renders instead)
      const avatarFallback = document.querySelector('[data-slot="avatar-fallback"]');
      expect(avatarFallback).toBeInTheDocument();
    });

    it('should display formatted stats (items, likes, views, comments)', () => {
      const collection = createMockCollectionHeader({
        bobbleheadCount: 5,
        commentCount: 3,
        featuredCount: 2,
        likeCount: 10,
        viewCount: 25,
      });

      render(<CollectionHeaderCard {...defaultProps} collection={collection} />);

      // Verify items count
      expect(screen.getByText('5 items')).toBeInTheDocument();

      // Verify featured count
      expect(screen.getByText('2 featured')).toBeInTheDocument();

      // Verify like count
      expect(screen.getByText('10')).toBeInTheDocument();

      // Verify view count
      expect(screen.getByText('25 views')).toBeInTheDocument();

      // Verify comment count (singular)
      expect(screen.getByText('3 comments')).toBeInTheDocument();
    });

    it('should format total value as currency using formatCurrency utility', () => {
      const collection = createMockCollectionHeader({
        totalValue: 1234.56,
      });

      render(<CollectionHeaderCard {...defaultProps} collection={collection} />);

      // Verify formatted currency
      expect(screen.getByText('$1,234.56 total value')).toBeInTheDocument();
    });
  });

  describe('dropdown menu interactions', () => {
    it('should render dropdown menu with Edit and Delete options', async () => {
      const { user } = render(<CollectionHeaderCard {...defaultProps} />);

      // Click dropdown trigger button
      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);

      // Verify Edit menu item appears
      expect(screen.getByRole('menuitem', { name: /edit collection/i })).toBeInTheDocument();

      // Verify Delete menu item appears
      expect(screen.getByRole('menuitem', { name: /delete collection/i })).toBeInTheDocument();
    });

    it('should call onEdit when Edit menu item is clicked', async () => {
      const { user } = render(<CollectionHeaderCard {...defaultProps} />);

      // Open dropdown menu
      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);

      // Click Edit menu item
      const editMenuItem = screen.getByRole('menuitem', { name: /edit collection/i });
      await user.click(editMenuItem);

      // Verify onEdit callback was called
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when Delete menu item is clicked', async () => {
      const { user } = render(<CollectionHeaderCard {...defaultProps} />);

      // Open dropdown menu
      const dropdownTrigger = screen.getByRole('button', { name: '' });
      await user.click(dropdownTrigger);

      // Click Delete menu item
      const deleteMenuItem = screen.getByRole('menuitem', { name: /delete collection/i });
      await user.click(deleteMenuItem);

      // Verify onDelete callback was called
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });
});
